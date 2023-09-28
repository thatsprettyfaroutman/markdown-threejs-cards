import { type processMd } from './lib'
import { type measureItem } from './measure'

export type TProcessContentProps = {
  mdSrc: string
  md?: string
  devicePixelRatio: number
  canvasStyle: {
    width: number
    height: number
    gap: number
    padding: number
  }
  canvas: HTMLCanvasElement | OffscreenCanvas
}

export type TMeasuredItem = ReturnType<typeof measureItem>

export type TMeasuredCard = {
  items: (TMeasuredItem & {
    x: number
    y: number
  })[]
  /**
   * // TODO: rename to contentHeight
   * Content height
   */
  height: number
}

export type TProcessedMd = Awaited<ReturnType<typeof processMd>>
