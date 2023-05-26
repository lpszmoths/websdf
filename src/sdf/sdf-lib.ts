import {
  SDFChannelMode,
  SDFConverterOverflowMode,
  SDFGenerationOptions,
  SDFPrecisionMode
} from './sdf-types'
import {
  NUM_SAMPLES_BY_SAMPLING_MODE
} from './sdf-constants'
import vertexShaderSource from './shaders/sdf-vertex-shader.glsl'
import fragmentShaderSource from './shaders/sdf-fragment-shader.glsl'
import { blit2D, createCanvas, createShaderProgram, drawFullQuad, setUniform1f, setUniform1i, setUniform2f, waitForFrame } from './gl-utils'

enum SDFShaderUniform {
  TEXTURE = 'uTexture',
  RADIUS = 'uRadius',
  THRESHOLD = 'uThreshold',
  TEXEL_SIZE = 'uTexelSize',
  HIGH_PRECISION = 'uHighPrecision',
  NUM_SAMPLES = 'uNumSamples',
  PROGRESS = 'uProgress',
  ENABLE_RGB = 'uEnableRGB',
}

function createSDFShaderProgram(
  gl: WebGL2RenderingContext
): WebGLProgram {
  return createShaderProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource
  )
}

function setCorrectCanvasSize(
  inputTexture: HTMLImageElement,
  overflowMode: SDFConverterOverflowMode,
  canvas: HTMLCanvasElement
) {
  const {
    width: srcWidth,
    height: srcHeight
  } = inputTexture
  canvas.width = srcWidth
  canvas.height = srcHeight
}

function setSDFUniforms(
  gl: WebGL2RenderingContext,
  shaderProgram: WebGLProgram,
  canvas: HTMLCanvasElement,
  {
    precisionMode,
    samplingMode,
    threshold,
    radius,
    channelMode
  }: SDFGenerationOptions
) {
  setUniform1i(
    gl,
    shaderProgram,
    SDFShaderUniform.TEXTURE,
    0
  )

  // push SDF uniforms
  setUniform1f(
    gl,
    shaderProgram,
    SDFShaderUniform.RADIUS,
    radius
  )
  setUniform1f(
    gl,
    shaderProgram,
    SDFShaderUniform.THRESHOLD,
    threshold
  )
  setUniform1f(
    gl,
    shaderProgram,
    SDFShaderUniform.NUM_SAMPLES,
    NUM_SAMPLES_BY_SAMPLING_MODE[samplingMode]
  )
  setUniform1i(
    gl,
    shaderProgram,
    SDFShaderUniform.HIGH_PRECISION,
    precisionMode === SDFPrecisionMode.EXACT ? 1 : 0
  )
  setUniform1i(
    gl,
    shaderProgram,
    SDFShaderUniform.ENABLE_RGB,
    channelMode === SDFChannelMode.RGBA ? 1 : 0
  )

  // push other uniforms
  const texelWidth: number = 1.0 / canvas.width
  const texelHeight: number = 1.0 / canvas.height
  const texelSizeLocation = gl.getUniformLocation(shaderProgram, SDFShaderUniform.TEXEL_SIZE)
  gl.uniform2f(texelSizeLocation, texelWidth, texelHeight)
}

function sleep(
  ms: number
) {
  return new Promise(
    (
      resolve: (value?: undefined) => void,
      reject: (reason: any) => void
    ) => {
      setTimeout(
        () => {
          resolve()
        },
        ms
      )
    }
  )
}

/**
 * Generates an SDF texture using a temporary canvas.
 * @param inputTexture the input texture as an ImageData object
 * @param options SDF generation parameters
 * @param options.radiusX the maximum horizontal distance in pixels
 * @param options.radiusY the maximum vertical distance in pixels
 * @param options.threshold the light/dark threshold (0.0-1.0)
 * @param options.overflowMode how to handle coordinates outside the image
 * @param options.channelMode whether to generate monochrome or RGB output
 * @returns 
 */
export async function generateSDF(
  inputTexture: HTMLImageElement,
  {
    radius,
    threshold,
    overflowMode,
    precisionMode,
    samplingMode,
    channelMode
  }: SDFGenerationOptions,
  onProgress: (progress: number) => void
): Promise<string> {
  const {
    width: srcWidth,
    height: srcHeight
  } = inputTexture
  let srcX = 0, srcY = 0
  let dstWidth = srcWidth
  let dstHeight = srcHeight

  // apply overflow mode
  if (overflowMode == SDFConverterOverflowMode.EXPAND_AS_NECESSARY) {
    throw new Error('The "expand as needed" option is not implemented yet')
  }

  // create a temporary 2D canvas as a compositing target
  const canvas = createCanvas(
    dstWidth,
    dstHeight,
    '2d'
  )

  // apply the shader
  await renderSDFToCanvas(
    inputTexture,
    {
      radius,
      threshold,
      overflowMode,
      precisionMode,
      samplingMode,
      channelMode
    },
    canvas,
    onProgress
  )

  // read from the canvas
  return canvas.toDataURL()
}

export async function renderSDFToCanvas(
  inputTexture: HTMLImageElement,
  sdfGenerationOptions: SDFGenerationOptions,
  canvas: HTMLCanvasElement,
  onProgress: (progress: number) => void
): Promise<void> {
  const {
    radius,
    overflowMode,
    precisionMode,
    samplingMode,
  } = sdfGenerationOptions
  const numSamples = NUM_SAMPLES_BY_SAMPLING_MODE[samplingMode]

  // ensure the canvas is the correct size
  setCorrectCanvasSize(
    inputTexture,
    overflowMode,
    canvas
  )

  // create temp buffer
  const buffer = createCanvas(
    canvas.width,
    canvas.height,
    'webgl2'
  )

  // get ctxs
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Unable to create 2D context.')
  }
  const gl = buffer.getContext('webgl2')
  if (!gl) {
    throw new Error('Unable to create context. The device probably doesn\'t support WebGL 2.')
  }

  // join both shaders into a shader program
  const shaderProgram = createSDFShaderProgram(gl)

  // create texture and assign it to the shader
  const texture = gl.createTexture()
  if (!texture) {
    throw new Error('Unable to create texture')
  }
  gl.bindTexture(gl.TEXTURE_2D, texture)
  if (overflowMode === SDFConverterOverflowMode.WRAP) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
  }
  else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, inputTexture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)

  // set up texture uniform
  setUniform1i(
    gl,
    shaderProgram,
    SDFShaderUniform.TEXTURE,
    0
  )

  // push SDF uniforms
  setSDFUniforms(
    gl,
    shaderProgram,
    canvas,
    sdfGenerationOptions
  )

  // render
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  gl.clearColor(0.0, 0.0, 0.0, 0.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  if (precisionMode === SDFPrecisionMode.APPROXIMATE) {
    setUniform1f(
      gl,
      shaderProgram,
      SDFShaderUniform.PROGRESS,
      1.0
    )
    await doSingleRenderPass(
      gl,
      shaderProgram
    )
    blit2D(
      buffer,
      canvas
    )
    onProgress(1.0)
  }
  else {
    gl.enable(gl.BLEND) // required for iterative rendering
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_DST_ALPHA) // draw "behind"
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA) // draw "behind"
    const numPasses = radius
    const increment = 1.0 / (numPasses * numSamples)
    for (let k = 0.0; k <= 1.0; k += increment) {
      await doIterativeRenderPass(
        gl,
        shaderProgram,
        1.0 - k
      )
      await sleep(10)
      await waitForFrame()
      ctx.drawImage(
        buffer,
        0,
        0
      )
      onProgress(k)
    }
    
    onProgress(1.0)
  }
}

async function doSingleRenderPass(
  gl: WebGL2RenderingContext,
  shaderProgram: WebGLProgram
) {
  drawFullQuad(
    gl,
    shaderProgram
  )
  gl.finish()
  await waitForFrame()
}

async function doIterativeRenderPass(
  gl: WebGL2RenderingContext,
  shaderProgram: WebGLProgram,
  progress: number
) {
  setUniform1f(
    gl,
    shaderProgram,
    SDFShaderUniform.PROGRESS,
    progress
  )
  drawFullQuad(
    gl,
    shaderProgram
  )
  gl.finish()
  await waitForFrame()
}

