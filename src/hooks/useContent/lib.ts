import canvasTxt from 'canvas-txt'
import { last } from 'ramda'
import camelCase from 'lodash.camelcase'
import { TProcessContentProps, TProcessContentPropsWithCanvas } from './types'
import { TEXT_STYLE } from './text'

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
  props: TProcessContentProps
) => {
  const { width, height } = props.canvasStyle
  const ratio = props.devicePixelRatio

  if (ratio !== 1) {
    // set the 'real' canvas size to the higher width/height
    ctx.canvas.width = width * ratio
    ctx.canvas.height = height * ratio
    // ...then scale it back down with CSS
    if (ctx.canvas.style) {
      ctx.canvas.style.width = width + 'px'
      ctx.canvas.style.height = height + 'px'
    }
  } else {
    // this is a normal 1:1 device; just scale it simply
    ctx.canvas.width = width
    ctx.canvas.height = height
    if (ctx.canvas.style) {
      ctx.canvas.style.width = ''
      ctx.canvas.style.height = ''
    }
  }
  // scale the drawing ctx so everything will work at the higher ratio
  ctx.scale(ratio, ratio)
}

export const loadImage = async (src: string) => {
  const imgRes = await fetch(src)
  const imgBlob = await imgRes.blob()
  return createImageBitmap(imgBlob)
}

export const processMd = async (md: string) => {
  const items = await Promise.all(
    md
      .split('\n')
      .map((x) => x.trim())
      .map(async (x) => {
        if (x.startsWith('## ')) {
          return ['h2', x.split('## ')[1]] as ['h2', string]
        }

        if (x.startsWith('# ')) {
          return ['h1', x.split('# ')[1]] as ['h1', string]
        }

        if (x.startsWith('![')) {
          const [, alt, srcsString] = x.match(/!\[(.*)\]\((.*)\)/)
          const srcs = srcsString.split(',').map((x) => x.trim())
          const imgs = await Promise.all(
            srcs.map(async (src) => {
              const name = camelCase(last(src.split('.png')[0].split('.')))
              const img = await loadImage(src)
              return [name, img] as [string, typeof img]
            })
          )
          const imgMap = Object.fromEntries(imgs)
          return ['img', imgMap, alt] as ['img', typeof imgMap, string]
        }

        if (!x) {
          return undefined
        }

        return ['p', x] as ['p', string]
      })
  )

  return items.filter(Boolean)
}

export const measureText = (
  text: string,
  props: TProcessContentPropsWithCanvas,
  {
    font,
    fontSize,
    lineHeightMultiplier,
    fontWeight,
    align,
  }: {
    font: string
    fontSize: number
    lineHeightMultiplier: number
    fontWeight: string
    align: 'left' | 'right' | 'center'
  }
) => {
  let { width, height } = props.canvasStyle
  width -= props.canvasStyle.padding * 2
  height -= props.canvasStyle.padding * 2

  let resultHeight = 0

  drawCanvas((ctx) => {
    scaleContext(ctx, props)

    ctx.strokeStyle = '#f0f'
    ctx.fillStyle = '#f0f'

    ctx.strokeRect(0, 0, width, height)

    ctx.save()

    const lineHeight = fontSize * lineHeightMultiplier

    ctx.font = `${
      fontWeight ? `${fontWeight} ` : ''
    }${fontSize}px/${lineHeight}px ${font}`

    canvasTxt.font = font
    canvasTxt.fontSize = fontSize
    if (fontWeight) {
      canvasTxt.fontStyle = fontWeight
    }
    canvasTxt.align = align
    canvasTxt.vAlign = 'top'
    canvasTxt.lineHeight = lineHeight
    const { height: textHeight } = canvasTxt.drawText(
      ctx,
      text,
      0,
      0,
      width,
      lineHeight
    )

    ctx.restore()
    ctx.strokeRect(0, 0, width, textHeight)
    ctx.fillText(`${width} x ${textHeight}`, 0, textHeight + 16)

    resultHeight = Math.ceil(textHeight)
  }, props.canvas)

  return { width, height: resultHeight }
}

export const measureImage = (
  imgMap: { [key: string]: ImageBitmap },
  props: TProcessContentPropsWithCanvas
) => {
  const testImg = Object.values(imgMap)[0]

  let { width: maxWidth, height: maxHeight } = props.canvasStyle
  maxWidth -= props.canvasStyle.padding * 2
  maxHeight -= props.canvasStyle.padding * 2

  const hr = maxWidth / testImg.width
  const vr = maxHeight / testImg.height
  const ratio = Math.min(hr, vr)
  const width = testImg.width * ratio
  const height = testImg.height * ratio
  const x = 0 // (maxWidth - width) * 0.5
  const y = 0 // (maxHeight - height) * 0.5

  drawCanvas((ctx) => {
    scaleContext(ctx, props)
    ctx.fillStyle = '#f0f'
    ctx.strokeStyle = '#f0f'
    ctx.strokeRect(0, 0, maxWidth, maxHeight)
    ctx.drawImage(testImg, x, y, width, height)
    ctx.strokeRect(x, y, width, height)
    ctx.fillText(`${width} x ${height}`, 0, y + height + 16)
  }, props.canvas)

  return {
    width,
    height,
  }
}

export const measureItem = (
  item: Awaited<ReturnType<typeof processMd>>[number],
  props: TProcessContentPropsWithCanvas
) => {
  const [type, content] = item

  if (type === 'h1') {
    return {
      type,
      content,
      ...measureText(content as string, props, TEXT_STYLE.h1),
    }
  }

  if (type === 'h2') {
    return {
      type,
      content,
      ...measureText(content as string, props, TEXT_STYLE.h2),
    }
  }

  if (type === 'p') {
    return {
      type,
      content,
      ...measureText(content as string, props, TEXT_STYLE.p),
    }
  }

  if (type === 'img') {
    return {
      type,
      content,
      ...measureImage(content, props),
    }
  }
}

export const getCards = (
  items: Array<ReturnType<typeof measureItem>>,
  props: TProcessContentProps
) => {
  const x = props.canvasStyle.padding
  const y = props.canvasStyle.padding

  return (
    items
      .reduce(
        (
          acc: Array<{
            items: Array<
              (typeof items)[number] & {
                x: number
                y: number
              }
            >
            height: number
          }>,
          item,
          i,
          all
        ) => {
          const lastCard = last(acc)

          let { height } = props.canvasStyle
          height -= props.canvasStyle.padding * 2

          let fits = (lastCard?.height || 0) + item.height <= height

          if (['img', 'h1'].includes(item.type)) {
            fits = false
          }

          if (fits && item.type === 'h2') {
            const nextItem = all[i + 1]
            const nextFits =
              !nextItem ||
              lastCard.height +
                item.height +
                props.canvasStyle.gap +
                nextItem.height <=
                height
            if (!nextFits || !nextItem) {
              // Push h2 to next card, don't let it be the last item
              fits = false
            }
          }

          if (!lastCard || !fits) {
            acc.push({
              items: [{ ...item, x, y }],
              height: item.height + props.canvasStyle.gap,
            })
            return acc
          }

          lastCard.items.push({ ...item, x, y: y + lastCard.height })
          lastCard.height += item.height + props.canvasStyle.gap

          return acc
        },
        []
      )

      // Remove bottom props.canvasStyle.gap from each card
      .map((card) => {
        card.height -= props.canvasStyle.gap
        return card
      })

      // Center content
      .map((card) => {
        let { height } = props.canvasStyle
        height -= props.canvasStyle.padding * 2
        const y = (height - card.height) * 0.5
        return {
          ...card,
          items: card.items.map((item) => {
            return {
              ...item,
              y: y + item.y,
            }
          }),
        }
      })
  )
}

export const loadFonts = (self: Pick<Window & typeof globalThis, 'fonts'>) => {
  const headingFont = new FontFace(
    'Heading Font',
    "url(https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459WlhyyTh89Y.woff2) format('woff2')",
    {
      weight: '700',
    }
  )
  self.fonts.add(headingFont)

  const bodyFont = new FontFace(
    'Body Font',
    "url(https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXp-p7K4KLg.woff2) format('woff2')",
    {
      weight: '400',
    }
  )
  self.fonts.add(bodyFont)

  return Promise.all([headingFont.load(), bodyFont.load()])
}
