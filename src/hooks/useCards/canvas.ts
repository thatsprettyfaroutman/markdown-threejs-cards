import canvasTxt from 'canvas-txt'
import { TEXT_STYLE } from './text'
import { TMeasuredCard, TProcessContentProps } from './types'
import { loadImage } from './lib'

export const drawCanvas = (
  drawFn: (ctx: CanvasRenderingContext2D) => void,
  overrideCanvas?: HTMLCanvasElement | OffscreenCanvas
) => {
  if (!drawFn) {
    throw new Error('drawCanvas, `drawFn` is not a function')
  }
  const canvas = (overrideCanvas || document.createElement('canvas')) as
    | HTMLCanvasElement
    | OffscreenCanvas
  // @ts-ignore
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.save()
  drawFn(ctx)
  ctx.restore()
  return canvas
}

export const scaleContext = (
  ctx: CanvasRenderingContext2D,
  contentProps: TProcessContentProps
) => {
  const { width, height } = contentProps.canvasStyle
  const dpr = contentProps.devicePixelRatio
  ctx.canvas.width = width * dpr
  ctx.canvas.height = height * dpr
  // scale the drawing ctx so everything will work at the higher dpr
  ctx.scale(dpr, dpr)
}

const drawTextItem = (
  ctx: CanvasRenderingContext2D,
  style: (typeof TEXT_STYLE)[keyof typeof TEXT_STYLE],
  color: string,
  item: {
    content: string
    x: number
    y: number
    width: number
    height: number
    contentWidth: number
  }
) => {
  ctx.save()
  const lineHeight = style.fontSize * style.lineHeightMultiplier
  ctx.font = `${style.fontSize}px/${lineHeight}px ${style.font}`
  ctx.fillStyle = color

  canvasTxt.font = style.font
  canvasTxt.fontSize = style.fontSize
  canvasTxt.fontStyle = style.fontWeight
  canvasTxt.align = item.contentWidth < item.width ? 'center' : style.align
  canvasTxt.vAlign = 'top'
  canvasTxt.lineHeight = lineHeight
  canvasTxt.drawText(ctx, item.content, item.x, item.y, item.width, item.height)
  ctx.restore()
}

const drawImageItem = (
  ctx: CanvasRenderingContext2D,
  opacity: number,
  item: {
    bitmap: ImageBitmap
    x: number
    y: number
    width: number
    height: number
    centered?: boolean
  },
  contentProps: TProcessContentProps
) => {
  ctx.save()
  ctx.globalAlpha = opacity

  const dpr = contentProps.devicePixelRatio
  const cx = (ctx.canvas.width / dpr - item.width) * 0.5
  const cy = (ctx.canvas.height / dpr - item.height) * 0.5

  ctx.drawImage(
    item.bitmap,
    item.centered ? cx : item.x,
    item.centered ? cy : item.y,
    item.width,
    item.height
  )
  ctx.globalAlpha = 1
  ctx.restore()
}

const drawCard = <T extends HTMLCanvasElement | OffscreenCanvas>(
  backgroundColor: string,
  contentProps: TProcessContentProps,
  drawFn: (ctx: CanvasRenderingContext2D) => void
) =>
  drawCanvas((ctx) => {
    scaleContext(ctx, contentProps)

    // Flip the canvas so its in correct position for three-js
    ctx.translate(0, contentProps.canvasStyle.height)
    ctx.scale(1, -1)
    // Phew, glad thats over

    ctx.fillStyle = backgroundColor
    ctx.fillRect(
      0,
      0,
      contentProps.canvasStyle.width,
      contentProps.canvasStyle.height
    )

    ctx.save()
    drawFn(ctx)
    ctx.restore()
  }, contentProps.canvas) as T

type TTextureStyle = {
  backgroundTextureSrc?: string
  backgroundTextureRepeat?: [number, number]
  color?: string
  backgroundColor?: string
  opacity?: number
}

type TGenerateTextureProps = {
  contentProps: TProcessContentProps
  contentKey?: string
  items?: TMeasuredCard['items']
  style?: TTextureStyle
}

export const generateCardTexture = async ({
  contentProps,
  contentKey,
  items = [],
  style: {
    backgroundTextureSrc,
    backgroundTextureRepeat = [1, 1],
    color = '#fff',
    backgroundColor = '#000',
    opacity = 1,
  } = {},
}: TGenerateTextureProps) => {
  const backgroundTexture =
    backgroundTextureSrc && (await loadImage(backgroundTextureSrc))

  const textureCanvas = drawCard<OffscreenCanvas>(
    backgroundColor,
    contentProps,
    (ctx) => {
      if (backgroundTexture) {
        const dpr = contentProps.devicePixelRatio
        const { width, height } = ctx.canvas
        const [repeatX, repeatY] = backgroundTextureRepeat
        const w = width / dpr / repeatX
        const h =
          (repeatY
            ? height / repeatY
            : (w / backgroundTexture.width) * backgroundTexture.height) / dpr
        let x = 0
        let y = 0
        while (y <= height) {
          ctx.drawImage(backgroundTexture, x, y, w, h)
          x += w
          if (x >= width - w) {
            y += h
            x = 0
          }
        }
      }

      items.forEach((item) => {
        if (item.type === 'img' || item.type === 'cover') {
          const bitmap = item.content[contentKey]
          if (!bitmap) {
            return
          }
          drawImageItem(
            ctx,
            opacity,
            {
              ...item,
              centered: item.type === 'cover',
              bitmap,
            },
            contentProps
          )
          return
        }

        drawTextItem(ctx, TEXT_STYLE[item.type], color, item)
      })
    }
  )

  return textureCanvas.transferToImageBitmap()
}
