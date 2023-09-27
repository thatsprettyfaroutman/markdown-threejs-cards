import { expose } from 'comlink'
import canvasTxt from 'canvas-txt'
import {
  processMd,
  drawCanvas,
  measureItem,
  getCards,
  loadFonts,
  scaleContext,
  loadImage,
} from './lib'
import { TEXT_STYLE } from './text'
import { TProcessContentProps } from './types'

export default {} as typeof Worker & { new (): Worker }

const drawText = (
  ctx: CanvasRenderingContext2D,
  style: (typeof TEXT_STYLE)[keyof typeof TEXT_STYLE],
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

const getMarkdown = async ({ md, mdSrc }: TProcessContentProps) => {
  if (md) {
    return md
  }
  const res = await fetch(mdSrc)
  return res.text()
}

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

    const md = await getMarkdown(props)
    const items = await processMd(md)

    const cardSizes = getCards(
      items.map((x) => measureItem(x, propsWithCanvas)),
      props
    )

    const normal = await (async () => {
      const normalTexture = await loadImage('/textures/paper-normal.jpg')
      const ctx = canvas.getContext('2d')
      const img = normalTexture
      if (img) {
        const w = props.canvasStyle.width * 0.25
        const h = (w / img.width) * img.height
        let x = 0
        let y = 0
        while (y < props.canvasStyle.height) {
          ctx.drawImage(img, x, y, w, h)
          x += w
          if (x > props.canvasStyle.width - w) {
            y += h
            x = 0
          }
        }
      }
      return canvas.transferToImageBitmap()
    })()

    const cards = cardSizes.map((card) => {
      const diffuse = (
        drawCard(
          '#0D0E1A',
          propsWithCanvas,
          (ctx) => {
            card.items.forEach((item) => {
              if (item.type === 'img') {
                const content = item.content.diffuse
                if (!content) {
                  return
                }
                drawImage(ctx, 0.2, {
                  ...item,
                  content,
                })
                return
              }
              drawText(ctx, TEXT_STYLE[item.type], '#323232', item)
            })
          },
          canvas
        ) as typeof canvas
      ).transferToImageBitmap()

      const specularColor = (
        drawCard(
          '#000000',
          propsWithCanvas,
          (ctx) => {
            card.items.forEach((item) => {
              if (item.type === 'img') {
                const content = item.content.specularColor
                if (!content) {
                  return
                }
                drawImage(ctx, 0.2, {
                  ...item,
                  content,
                })
                return
              }
              drawText(ctx, TEXT_STYLE[item.type], '#ffffff', item)
            })
          },
          canvas
        ) as typeof canvas
      ).transferToImageBitmap()

      return {
        texture: {
          diffuse,
          specularColor,
        },
        // ...card,
        props,
      }
    })

    return { cards, defaultTexture: { normal } }
  },
}

// Expose API
expose(api)
