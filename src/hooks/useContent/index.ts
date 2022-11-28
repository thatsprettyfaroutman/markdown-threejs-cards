import { useEffect, useState, useRef } from 'react'
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

export const useContent = () => {
  const [cards, setCards] = useState<
    undefined | Awaited<ReturnType<typeof canvasMeasureApi.processContent>>
  >()

  const mounted = useRef(true)
  useEffect(
    () => () => {
      mounted.current = false
    },
    []
  )

  useEffect(() => {
    const props = {
      mdSrc: '/content.md',
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
    cardsPromise.then((cards) => {
      // console.log('FROM WW', cards)
      // console.log(promiseCache._cache)
      // console.timeEnd('WW')
      if (mounted.current) {
        setCards(cards)
      }
    })
    // }, 5000)
  }, [])

  return cards
}
