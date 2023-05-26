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

const CONTAINER_ID = `_canvas_container_StETqE4M`

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

/**
 * Copies the contents of one canvas to a 2D canvas
 * @param sourceCanvas
 * @param destCanvas 
 */
export function blit2D(
  sourceCanvas: HTMLCanvasElement,
  destCanvas: HTMLCanvasElement
) {
  const destCtx = destCanvas.getContext('2d')
  if (!destCtx) {
    throw new Error(`Unable to get a 2D context`)
  }
  destCtx?.drawImage(
    sourceCanvas,
    0,
    0
  )
}

export function clear2DCanvas(
  canvas: HTMLCanvasElement
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error(`Unable to get a 2D context`)
  }

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  )
}

export function createCanvas(
  width: number,
  height: number,
  contextType: '2d' | 'webgl' | 'webgl2'
): HTMLCanvasElement {
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.setAttribute('data-context-type', contextType)

  const canvasContainer: HTMLDivElement = getOrCreateCanvasContainer()
  canvasContainer.appendChild(canvas)

  const ctx = canvas.getContext(contextType)
  if (!ctx) {
    canvas.setAttribute('data-context-type', 'error')
    throw new Error(`Unable to create context of type ${contextType}`)
  }

  return canvas
}

export function createShaderProgram(
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
): WebGLProgram {
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

  return shaderProgram
}

export function drawFullQuad(
  gl: WebGL2RenderingContext,
  shaderProgram: WebGLProgram | null
) {
  gl.useProgram(shaderProgram)

  // set up geometry buffers
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VERTICES), gl.STATIC_DRAW)
  const uvBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(UVs), gl.STATIC_DRAW)
  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(INDICES), gl.STATIC_DRAW)
  
  // shader attrs
  if (shaderProgram) {
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
  }

  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
}

export function getOrCreateCanvasContainer(): HTMLDivElement {
  let documentCanvasContainer = document.getElementById(CONTAINER_ID)
  if (documentCanvasContainer) {
    return documentCanvasContainer as HTMLDivElement
  }

  const canvasContainer: HTMLDivElement = document.createElement('div')
  makeHTMLElementInvisible(canvasContainer)
  document.body.appendChild(canvasContainer)

  return canvasContainer
}

export function setUniform1f(
  gl: WebGL2RenderingContext,
  shaderProgram: WebGLProgram,
  uniform: SDFShaderUniform,
  value: number
) {
  gl.useProgram(shaderProgram)
  const uniformLocation = gl.getUniformLocation(
    shaderProgram,
    uniform
  )
  gl.uniform1f(uniformLocation, value)
}

export function setUniform1i(
  gl: WebGL2RenderingContext,
  shaderProgram: WebGLProgram,
  uniform: SDFShaderUniform,
  value: number
) {
  gl.useProgram(shaderProgram)
  const uniformLocation = gl.getUniformLocation(
    shaderProgram,
    uniform
  )
  gl.uniform1i(uniformLocation, value)
}

export function setUniform2f(
  gl: WebGL2RenderingContext,
  shaderProgram: WebGLProgram,
  uniform: SDFShaderUniform,
  x: number,
  y: number
) {
  gl.useProgram(shaderProgram)
  const uniformLocation = gl.getUniformLocation(
    shaderProgram,
    uniform
  )
  gl.uniform2f(uniformLocation, x, y)
}

export async function waitForFrame(
) {
  await new Promise(resolve => requestAnimationFrame(resolve))
}
