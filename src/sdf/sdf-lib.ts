import { SDFConverterOverflowMode } from './sdf-constants'

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
): [HTMLCanvasElement, WebGL2RenderingContext] {
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

  return [canvas, ctx]
}

export async function generateSDF(
  inputTexture: ImageData,
  { radiusX, radiusY, overflowMode }: SDFGenerationOptions
): Promise<ImageData> {
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
  const [canvas, ctx] = createGLCanvas(
    dstWidth,
    dstHeight
  )

  // apply the shader
  // TODO

  // read from the canvas
  const byteLength: number = dstWidth * dstHeight * 4
  const dstBuffer = {
    buffer: new Uint8ClampedArray(byteLength),
    byteLength,
    byteOffset: 0
  }
  ctx.readPixels(
    0, 0,
    dstWidth, dstHeight,
    ctx.RGBA,
    0, // ?
    dstBuffer
  )

  // prepare the return value
  const imageData: ImageData = new ImageData(dstBuffer.buffer, dstWidth, dstHeight, {
    colorSpace: 'srgb'
  })
  return imageData
}

