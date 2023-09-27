import { useEffect, useState } from 'react'
import { CanvasTexture } from 'three'
import { canvasMeasureApi } from './workers'

const CANVAS_STYLE = {
  width: 300,
  height: 420,
  gap: 24,
  padding: 32,
}

// A simple mem-cache for promises
const promiseCache = (() => {
  const cache = {}
  const get = (key: string) => cache[key]?.promise
  const add = async (key: string, promise: Promise<unknown>) => {
    cache[key] = {
      promise,
      createdAt: new Date(),
    }
    try {
      await promise
    } catch (err) {
      console.log('promiseCache, promise failed', key)
      delete cache[key]
    }
    return promise
  }
  return { add, get, _cache: cache }
})()

const prepareContentForThree = (
  content: Awaited<ReturnType<typeof canvasMeasureApi.processContent>>
) => {
  // const texturedDefaultTexture = new Map<
  //   KeyOfMap<typeof defaultTexture>,
  //   CanvasTexture
  // >()
  // for (const [name, bitmap] of defaultTexture) {
  //   texturedDefaultTexture.set(name, new CanvasTexture(bitmap))
  // }

  const defaultTexture = Object.fromEntries(
    Object.entries(content.defaultTexture).map(([name, bitmap]) => [
      name,
      new CanvasTexture(bitmap),
    ])
  )

  const cards = content.cards.map((card) => {
    return {
      ...card,
      texture: {
        ...defaultTexture,
        ...Object.fromEntries(
          Object.entries(card.texture).map(([name, bitmap]) => {
            const canvas = document.createElement('canvas')
            canvas.width = bitmap.width
            canvas.height = bitmap.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(bitmap, 0, 0)
            // document.body.appendChild(canvas)
            return [name, new CanvasTexture(bitmap)]
          })
        ),
      },
    }
  })

  return { cards }
}

export const useContent = (md?: string) => {
  const [content, setContent] = useState<
    undefined | ReturnType<typeof prepareContentForThree>
  >({ cards: [] })

  useEffect(() => {
    let mounted = true
    const props = {
      mdSrc: '/content.md',
      md,
      devicePixelRatio: devicePixelRatio || 1,
      canvasStyle: CANVAS_STYLE,
    }

    const propsString = JSON.stringify(props)

    // console.time('WW')
    // console.log('TO WW', props)
    // console.log('using cached', !!promiseCache.get(propsString))

    const cardsPromise =
      promiseCache.get(propsString) ||
      promiseCache.add(propsString, canvasMeasureApi.processContent(props))

    // setTimeout(() => {
    cardsPromise.then((content) => {
      // console.log('FROM WW', content, mounted)
      // console.log( promiseCache._cache)
      // console.timeEnd('WW')
      if (mounted) {
        setContent(prepareContentForThree(content))
      }
    })
    // }, 5000)

    return () => {
      mounted = false
    }
  }, [md])

  return content
}
