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
      const getBitmap = () =>
        (
          drawCanvas((ctx) => {
            scaleContext(ctx, propsWithCanvas)
            card.items.forEach(({ type, x, y, width, height, content }) => {
              ctx.save()

              if (type === 'img') {
                ctx.drawImage(content, x, y, width, height)
                ctx.restore()
                return
              }

              const textStyle = TEXT_STYLE[type as keyof typeof TEXT_STYLE]
              const lineHeight =
                textStyle.fontSize * textStyle.lineHeightMultiplier
              ctx.font = `${textStyle.fontSize}px/${lineHeight}px ${textStyle.font}`
              ctx.fillStyle = '#f0f'

              canvasTxt.font = textStyle.font
              canvasTxt.fontSize = textStyle.fontSize
              canvasTxt.fontStyle = textStyle.fontWeight
              canvasTxt.align = textStyle.align
              canvasTxt.vAlign = 'top'
              canvasTxt.lineHeight = lineHeight
              canvasTxt.drawText(ctx, content, x, y, width, height)
            })

            ctx.restore()
          }, canvas) as typeof canvas
        )
          // @ts-ignore
          .transferToImageBitmap()

      // for (let i = 0; i < 100; i++) {
      //   getBitmap()
      // }

      const imageBitmap = getBitmap() as ImageBitmap

      return {
        // ...card,
        imageBitmap,
        props,
      }
    })
  },
}

// Expose API
expose(api)
