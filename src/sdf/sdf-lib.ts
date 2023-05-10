import { SDFConverterOverflowMode } from './sdf-constants'
import vertexShaderSource from './shaders/sdf-vertex-shader.glsl'
import fragmentShaderSource from './shaders/sdf-fragment-shader.glsl'

console.log(vertexShaderSource)
console.log(fragmentShaderSource)

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
 * @param options.overflowMode 
 * @returns 
 */
export async function generateSDF(
  inputTexture: HTMLImageElement,
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
  inputTexture: HTMLImageElement,
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
  const shaderProgram = gl.createProgram()
  if (!shaderProgram) {
    throw new Error('Unable to create shader program.')
  }
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)
  gl.useProgram(shaderProgram)

  // set up destination framebuffer
  const fragColorLocation = gl.getFragDataLocation(shaderProgram, 'outColor')
  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)

  // set up destination texture
  const {
    width: dstWidth,
    height: dstHeight
  } = canvas
  const destinationTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, destinationTexture)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0, // lod
    gl.RGBA, // internal format
    dstWidth,
    dstHeight,
    0, // border
    gl.RGBA, // format
    gl.UNSIGNED_BYTE,
    null
  )
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER, // target
    gl.COLOR_ATTACHMENT0 + fragColorLocation, // attachment slot
    gl.TEXTURE_2D, // textarget
    destinationTexture,
    0
  )
  const fbStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
  if (fbStatus !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error('Framebuffer not ready!')
  }

  // create texture
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
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR)
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST_MIPMAP_LINEAR)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, inputTexture)
  gl.generateMipmap(gl.TEXTURE_2D)

  // create buffers
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

  // set up texture
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  const textureLocation = gl.getUniformLocation(shaderProgram, "uTexture")
  gl.uniform1i(textureLocation, 0)

  // render
  gl.clearColor(0.6, 0.4, 0.5, 0.9)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)

  // unbind
  //gl.bindBuffer(gl.ARRAY_BUFFER, null)
  //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
}

