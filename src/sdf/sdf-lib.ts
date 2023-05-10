import { SDFConverterOverflowMode } from './sdf-constants'
import vertexShaderSource from './sdf-vertex-shader.glsl'
import fragmentShaderSource from './sdf-fragment-shader.glsl'

const VERTICES = [
  -0.5,0.5,0.0,
  -0.5,-0.5,0.0,
  0.5,-0.5,0.0,
];
const INDICES = [
  0, 1, 2
]

/**
 * TODO docs
 */
export interface SDFGenerationOptions {
  radiusX: number,
  radiusY: number,
  overflowMode: SDFConverterOverflowMode
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

function setCorrectCanvasSize(
  inputTexture: ImageData,
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
 * @param options.overflowMode 
 * @returns 
 */
export async function generateSDF(
  inputTexture: ImageData,
  { radiusX, radiusY, overflowMode }: SDFGenerationOptions
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
    { radiusX, radiusY, overflowMode },
    canvas
  )

  // read from the canvas
  const byteLength: number = dstWidth * dstHeight * 4
  const dstBuffer = {
    buffer: new Uint8ClampedArray(byteLength),
    byteLength,
    byteOffset: 0
  }
  return canvas.toDataURL()
}

export async function renderSDFToCanvas(
  inputTexture: ImageData,
  { radiusX, radiusY, overflowMode }: SDFGenerationOptions,
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

  // create buffers
  const vertexBuffer = gl.createBuffer()
  const indexBuffer = gl.createBuffer()
  
  // bind
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // populate buffers
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VERTICES), gl.STATIC_DRAW)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(INDICES), gl.STATIC_DRAW)

  // render
  gl.clearColor(0.5, 0.5, 0.5, 0.9)
  gl.enable(gl.DEPTH_TEST)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.drawElements(gl.TRIANGLE_STRIP, INDICES.length, gl.UNSIGNED_SHORT,0)

  // unbind
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
}

