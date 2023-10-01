import { useThree } from '@react-three/fiber'

export const usePx = () => {
  const { size, viewport } = useThree()
  return viewport.height / size.height
}
