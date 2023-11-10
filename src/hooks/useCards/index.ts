import { useEffect, useState } from 'react'
import { CanvasTexture } from 'three'
import { canvasMeasureApi } from './workers'
import { useDebounce } from '@uidotdev/usehooks'

const CANVAS_STYLE = {
  dpr: 2,
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

type TCards = ReturnType<typeof prepareCardsForThree>

export const useCards = (markdown?: string) => {
  const [errored, setErrored] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [cards, setCards] = useState<TCards>([])
  const debouncedProcessing = useDebounce(processing, 500)

  useEffect(() => {
    let mounted = true
    setProcessing(true)

    if (!markdown) {
      return () => {
        mounted = false
      }
    }

    const processMarkdown = async (markdown: string) => {
      const content = await canvasMeasureApi.processContent({
        md: markdown,
        canvasStyle: CANVAS_STYLE,
      })
      if (mounted) {
        setCards(prepareCardsForThree(content))
        setProcessing(false)
      }
    }

    try {
      console.log(markdown)
      processMarkdown(markdown)
    } catch (error) {
      console.error(error)
      if (mounted) {
        setErrored(true)
      }
    }

    return () => {
      mounted = false
    }
  }, [markdown])

  return { cards, processing: debouncedProcessing || processing, errored }
}
