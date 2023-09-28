import canvasTxt from 'canvas-txt'
import { last } from 'ramda'
import { TMeasuredCard, TProcessContentProps, TProcessedMd } from './types'
import { TEXT_STYLE } from './text'
import { drawCanvas, scaleContext } from './canvas'

const measureText = (
  text: string,
  contentProps: TProcessContentProps,
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
  let { width, height } = contentProps.canvasStyle
  width -= contentProps.canvasStyle.padding * 2
  height -= contentProps.canvasStyle.padding * 2

  let resultHeight = 0

  drawCanvas((ctx) => {
    scaleContext(ctx, contentProps)

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
  }, contentProps.canvas)

  return { width, height: resultHeight }
}

const measureImage = (
  imgMap: { [key: string]: ImageBitmap },
  contentProps: TProcessContentProps
) => {
  const testImg = Object.values(imgMap)[0]

  let { width: maxWidth, height: maxHeight } = contentProps.canvasStyle
  maxWidth -= contentProps.canvasStyle.padding * 2
  maxHeight -= contentProps.canvasStyle.padding * 2

  const hr = maxWidth / testImg.width
  const vr = maxHeight / testImg.height
  const ratio = Math.min(hr, vr)
  const width = testImg.width * ratio
  const height = testImg.height * ratio
  const x = 0 // (maxWidth - width) * 0.5
  const y = 0 // (maxHeight - height) * 0.5

  drawCanvas((ctx) => {
    scaleContext(ctx, contentProps)
    ctx.fillStyle = '#f0f'
    ctx.strokeStyle = '#f0f'
    ctx.strokeRect(0, 0, maxWidth, maxHeight)
    ctx.drawImage(testImg, x, y, width, height)
    ctx.strokeRect(x, y, width, height)
    ctx.fillText(`${width} x ${height}`, 0, y + height + 16)
  }, contentProps.canvas)

  return {
    width,
    height,
  }
}

export const measureItem = (
  item: TProcessedMd[number],
  contentProps: TProcessContentProps
) => {
  const [type, content] = item

  if (type === 'h1') {
    return {
      type,
      content,
      ...measureText(content, contentProps, TEXT_STYLE.h1),
    }
  }

  if (type === 'h2') {
    return {
      type,
      content,
      ...measureText(content, contentProps, TEXT_STYLE.h2),
    }
  }

  if (type === 'p') {
    return {
      type,
      content,
      ...measureText(content, contentProps, TEXT_STYLE.p),
    }
  }

  if (type === 'img') {
    return {
      type,
      content,
      ...measureImage(content, contentProps),
    }
  }

  if (type === 'cover') {
    return {
      type,
      content,
      ...measureImage(content, {
        ...contentProps,
        canvasStyle: {
          ...contentProps.canvasStyle,
          padding: 0,
        },
      }),
    }
  }
}

export const getMeasuredCards = (
  processedMd: TProcessedMd,
  contentProps: TProcessContentProps
) => {
  const x = contentProps.canvasStyle.padding
  const y = contentProps.canvasStyle.padding

  const measuredItems = processedMd.map((item) =>
    measureItem(item, contentProps)
  )

  return (
    measuredItems
      // Divide items into cards
      .reduce((acc: TMeasuredCard[], item, i, all) => {
        const previousCard = last(acc)
        const isCover = item.type === 'cover'
        const itemWithCoords = {
          ...item,
          x: isCover ? 0 : x,
          y: isCover ? 0 : y,
        }
        let { height } = contentProps.canvasStyle
        height -= contentProps.canvasStyle.padding * 2
        let fits = (previousCard?.height || 0) + item.height <= height

        if (['img', 'cover', 'h1'].includes(item.type)) {
          // Push images and h1s to next card
          fits = false
        }

        if (fits && item.type === 'h2') {
          const nextItem = all[i + 1]
          const nextFits =
            !nextItem ||
            previousCard.height +
              item.height +
              contentProps.canvasStyle.gap +
              nextItem.height <=
              height
          if (!nextFits || !nextItem) {
            // Push h2s to next card if last item on card
            fits = false
          }
        }

        if (!previousCard || !fits) {
          acc.push({
            items: [itemWithCoords],
            height: item.height + contentProps.canvasStyle.gap,
          })
          return acc
        }

        previousCard.items.push({
          ...itemWithCoords,
          y: itemWithCoords.y + previousCard.height,
        })
        previousCard.height += item.height + contentProps.canvasStyle.gap

        return acc
      }, [])

      // Remove bottom contentProps.canvasStyle.gap from each card
      .map((card) => {
        card.height -= contentProps.canvasStyle.gap
        return card
      })

      // Center content
      .map((card) => {
        let { height } = contentProps.canvasStyle
        // Sub top and bottom paddings
        height -= contentProps.canvasStyle.padding * 2
        const yOffset = (height - card.height) * 0.5
        return {
          ...card,
          items: card.items.map((item) => {
            return {
              ...item,
              y: yOffset + item.y,
            }
          }),
        }
      })
  )
}
