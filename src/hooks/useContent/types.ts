export type TProcessContentProps = {
  mdSrc: string
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
