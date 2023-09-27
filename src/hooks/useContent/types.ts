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
}

export type TProcessContentPropsWithCanvas = TProcessContentProps & {
  canvas: HTMLCanvasElement | OffscreenCanvas
}
