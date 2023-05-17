import { SDFChannelMode, SDFConverterOverflowMode, SDFPrecisionMode } from './sdf-constants'
import vertexShaderSource from './shaders/sdf-vertex-shader.glsl'
import fragmentShaderSource from './shaders/sdf-fragment-shader.glsl'

enum SDFShaderUniform {
  TEXTURE = 'uTexture',
  RADIUS = 'uRadius',
  THRESHOLD = 'uThreshold',
  TEXEL_SIZE = 'uTexelSize',
  HIGH_PRECISION = 'uHighPrecision',
  ENABLE_RGB = 'uEnableRGB',
}

const VERTICES = [
  -1, -1,
  1, -1,
  1, 1,
  -1, 1
]
const UVs = [
  0, 0,
  1, 0,
  1, 1,
  0, 1
]
const INDICES = [
  0, 1, 2, 3
]

/**
 * TODO docs
 */
export interface SDFGenerationOptions {
  radiusX: number
  radiusY: number
  threshold: number
  overflowMode: SDFConverterOverflowMode
  precisionMode: SDFPrecisionMode
  numSamples: number
  channelMode: SDFChannelMode
}

function createGLCanvas(
  width: number,
  height: number
): HTMLCanvasElement {
  const canvasContainer: HTMLDivElement = document.createElement('div')
  makeHTMLElementInvisible(canvasContainer)

  const canvas: HTMLCanvasElement = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvasContainer.appendChild(canvas)

  document.body.appendChild(canvasContainer)

  const ctx = canvas.getContext('webgl2')
  
  if (!ctx) {
    throw new Error('Unable to create context. The device probably doesn\'t support WebGL 2.')
  }

  return canvas
}

function createSDFShaderProgram(gl: WebGL2RenderingContext): WebGLProgram {
  // ensure dFdx/dFdy are available
  //console.log(gl.getSupportedExtensions())

  // create shaders
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  if (!vertexShader) {
    throw new Error('Unable to create vertex shader.')
  }
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  if (!fragmentShader) {
    throw new Error('Unable to create vertex shader.')
  }

  // load shader code and compile
  gl.shaderSource(vertexShader, vertexShaderSource)
  gl.shaderSource(fragmentShader, fragmentShaderSource)
  gl.compileShader(vertexShader)
  gl.compileShader(fragmentShader)

  // join both shaders into a shader program
  const shaderProgram = gl.createProgram()
  if (!shaderProgram) {
    throw new Error('Unable to create shader program.')
  }
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)
  gl.useProgram(shaderProgram)

  return shaderProgram
}

function makeHTMLElementInvisible(
  element: HTMLElement
) {
  element.setAttribute('hidden', 'hidden')
  element.style.visibility = 'hidden'
  element.style.width = '0'
  element.style.height = '0'
  element.style.pointerEvents = 'none'
  element.style.position = 'absolute'
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
    radiusX,
    radiusY,
    threshold,
    overflowMode,
    precisionMode,
    numSamples,
    channelMode
  }: SDFGenerationOptions
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

  // create a temporary canvas
  const canvas = createGLCanvas(
    dstWidth,
    dstHeight
  )

  // apply the shader
  await renderSDFToCanvas(
    inputTexture,
    {
      radiusX,
      radiusY,
      threshold,
      overflowMode,
      precisionMode,
      numSamples,
      channelMode
    },
    canvas
  )

  // read from the canvas
  return canvas.toDataURL()
}

export async function renderSDFToCanvas(
  inputTexture: HTMLImageElement,
  {
    radiusX,
    radiusY,
    threshold,
    overflowMode,
    precisionMode,
    channelMode
  }: SDFGenerationOptions,
  canvas: HTMLCanvasElement
): Promise<void> {
  // ensure the canvas is the correct size
  setCorrectCanvasSize(
    inputTexture,
    overflowMode,
    canvas
  )

  // get ctx
  const gl = canvas.getContext('webgl2')
  if (!gl) {
    throw new Error('Unable to create context. The device probably doesn\'t support WebGL 2.')
  }

  // ensure dFdx/dFdy are available
  console.log(gl.getSupportedExtensions())

  // create shaders
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  if (!vertexShader) {
    throw new Error('Unable to create vertex shader.')
  }
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  if (!fragmentShader) {
    throw new Error('Unable to create vertex shader.')
  }

  // load shader code and compile
  gl.shaderSource(vertexShader, vertexShaderSource)
  gl.shaderSource(fragmentShader, fragmentShaderSource)
  gl.compileShader(vertexShader)
  gl.compileShader(fragmentShader)

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

  // create geometry buffers and assign them
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VERTICES), gl.STATIC_DRAW)
  const uvBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(UVs), gl.STATIC_DRAW)
  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(INDICES), gl.STATIC_DRAW)

  // set up vertex pos
  const vertexPosLocation = gl.getAttribLocation(shaderProgram, "aPos")
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.enableVertexAttribArray(vertexPosLocation)
  gl.vertexAttribPointer(vertexPosLocation, 2, gl.FLOAT, false, 0, 0)

  // set up UVs
  const uvLocation = gl.getAttribLocation(shaderProgram, "aTexCoord")
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
  gl.enableVertexAttribArray(uvLocation)
  gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0)

  // set up texture uniform
  const textureLocation = gl.getUniformLocation(shaderProgram, SDFShaderUniform.TEXTURE)
  gl.uniform1i(textureLocation, 0)

  // push SDF uniforms
  const radiusLocation = gl.getUniformLocation(shaderProgram, SDFShaderUniform.RADIUS)
  gl.uniform2f(radiusLocation, radiusX, radiusY)
  const thresholdLocation = gl.getUniformLocation(shaderProgram, SDFShaderUniform.THRESHOLD)
  gl.uniform1f(thresholdLocation, threshold)
  const highPrecisionLocation = gl.getUniformLocation(shaderProgram, SDFShaderUniform.HIGH_PRECISION)
  gl.uniform1i(highPrecisionLocation, precisionMode === SDFPrecisionMode.EXACT ? 1 : 0)
  const enableRGBLocation = gl.getUniformLocation(shaderProgram, SDFShaderUniform.ENABLE_RGB)
  gl.uniform1i(enableRGBLocation, channelMode === SDFChannelMode.RGB ? 1 : 0)

  // push other uniforms
  const texelWidth: number = 1 / canvas.width
  const texelHeight: number = 1 / canvas.height
  const texelSizeLocation = gl.getUniformLocation(shaderProgram, SDFShaderUniform.TEXEL_SIZE)
  gl.uniform2f(texelSizeLocation, texelWidth, texelHeight)

  // render
  gl.clearColor(0.6, 0.4, 0.5, 0.9)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
}

