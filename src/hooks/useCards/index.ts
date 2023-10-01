import { useEffect, useState } from 'react'
import { CanvasTexture } from 'three'
import { canvasMeasureApi } from './workers'

const CANVAS_STYLE = {
  width: 300,
  height: 420,
  gap: 24,
  padding: 32,
}

const imageMapToTextureMap = (imageMap: Record<string, ImageBitmap>) =>
  Object.fromEntries(
    Object.entries(imageMap).map(([key, bitmap]) => [
      key,
      new CanvasTexture(bitmap),
    ])
  )

const prepareCardsForThree = (
  content: Awaited<ReturnType<typeof canvasMeasureApi.processContent>>
) => {
  const defaultTextureMap = imageMapToTextureMap(content.defaultTextureMap)
  const cards = content.cards.map((card) => {
    return {
      ...card,
      textureMap: {
        ...defaultTextureMap,
        ...imageMapToTextureMap(card.textureMap),
      },
    }
  })

  return cards
}

export const useCards = (md?: string) => {
  const [errored, setErrored] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [cards, setCards] = useState<ReturnType<typeof prepareCardsForThree>>(
    []
  )

  useEffect(() => {
    let mounted = true
    setProcessing(true)
    ;(async () => {
      try {
        const content = await canvasMeasureApi.processContent({
          mdSrc: '/content.md',
          md,
          devicePixelRatio: 2,
          canvasStyle: CANVAS_STYLE,
        })
        if (mounted) {
          setCards(prepareCardsForThree(content))
          setProcessing(false)
        }
      } catch (error) {
        console.error(error)
        if (mounted) {
          setErrored(true)
        }
      }
    })()
    return () => {
      mounted = false
    }
  }, [md])

  return { cards, processing, errored }
}
