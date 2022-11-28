import { expose } from 'comlink'
import canvasTxt from 'canvas-txt'
import {
  processMd,
  drawCanvas,
  measureItem,
  getCards,
  loadFonts,
  scaleContext,
} from './lib'
import { TEXT_STYLE } from './text'
import { TProcessContentProps } from './types'

export default {} as typeof Worker & { new (): Worker }

const drawText = (
  ctx: CanvasRenderingContext2D,
  style: typeof TEXT_STYLE[keyof typeof TEXT_STYLE],
  color: string,
  item: {
    content: string
    x: number
    y: number
    width: number
    height: number
  }
) => {
  ctx.save()
  const lineHeight = style.fontSize * style.lineHeightMultiplier
  ctx.font = `${style.fontSize}px/${lineHeight}px ${style.font}`
  ctx.fillStyle = color

  canvasTxt.font = style.font
  canvasTxt.fontSize = style.fontSize
  canvasTxt.fontStyle = style.fontWeight
  canvasTxt.align = style.align
  canvasTxt.vAlign = 'top'
  canvasTxt.lineHeight = lineHeight
  canvasTxt.drawText(ctx, item.content, item.x, item.y, item.width, item.height)
  ctx.restore()
}

const drawImage = (
  ctx: CanvasRenderingContext2D,
  opacity: number,
  item: {
    content: ImageBitmap
    x: number
    y: number
    width: number
    height: number
  }
) => {
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.drawImage(item.content, item.x, item.y, item.width, item.height)
  ctx.globalAlpha = 1
  ctx.restore()
}

const drawCard = (
  backgroundColor: string,
  propsWithCanvas: any,
  drawFn: (ctx) => void,
  canvas: HTMLCanvasElement | OffscreenCanvas
) =>
  drawCanvas((ctx) => {
    scaleContext(ctx, propsWithCanvas)

    // Flip the canvas so its in correct position for three-js
    ctx.translate(0, propsWithCanvas.canvasStyle.height)
    ctx.scale(1, -1)
    // Phew, glad thats over

    ctx.fillStyle = backgroundColor
    ctx.fillRect(
      0,
      0,
      propsWithCanvas.canvasStyle.width,
      propsWithCanvas.canvasStyle.height
    )

    ctx.save()
    drawFn(ctx)
    ctx.restore()
  }, canvas)

// Define API
export const api = {
  processContent: async (props: TProcessContentProps) => {
    // eslint-disable-next-line
    await loadFonts(self)

    // @ts-ignore
    const canvas = new OffscreenCanvas(
      props.canvasStyle.width,
      props.canvasStyle.height
    ) as OffscreenCanvas
    const propsWithCanvas = { ...props, canvas }

    const res = await fetch(props.mdSrc)
    const md = await res.text()
    const items = await processMd(md)

    const cards = getCards(
      items.map((x) => measureItem(x, propsWithCanvas)),
      props
    )

    return cards.map((card) => {
      const getDiffuse = () =>
        (
          drawCard(
            '#0D0E1A',
            propsWithCanvas,
            (ctx) => {
              card.items.forEach((item) => {
                if (item.type === 'img') {
                  drawImage(ctx, 0.2, item)
                  return
                }
                drawText(ctx, TEXT_STYLE[item.type], '#323232', item)
              })
            },
            canvas
          ) as typeof canvas
        ).transferToImageBitmap()

      const getSpecularColor = () =>
        (
          drawCard(
            '#0D0E19',
            propsWithCanvas,
            (ctx) => {
              card.items.forEach((item) => {
                if (item.type === 'img') {
                  drawImage(ctx, 1, item)
                  return
                }
                drawText(ctx, TEXT_STYLE[item.type], '#ffffff', item)
              })
            },
            canvas
          ) as typeof canvas
        ).transferToImageBitmap()

      const diffuse = getDiffuse() as ImageBitmap
      const specularColor = getSpecularColor() as ImageBitmap

      return {
        // ...card,
        diffuse,
        specularColor,
        props,
      }
    })
  },
}

// Expose API
expose(api)
