type KeyOfMap<M extends Map<unknown, unknown>> = M extends Map<infer K, unknown>
  ? K
  : never

declare module 'lerp' {
  export default function lerp(x: number, y: number, a: number): number
}
