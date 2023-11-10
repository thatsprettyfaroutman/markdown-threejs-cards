import { useThree } from '@react-three/fiber'
import { useTexture, Billboard } from '@react-three/drei'

const ALPHA_TEXTURE_PATH = '/texture/glow.png'
useTexture.preload(ALPHA_TEXTURE_PATH)

export const Glow = ({ color, ...restProps }) => {
  const alphaMap = useTexture(ALPHA_TEXTURE_PATH)
  const { viewport } = useThree()
  return (
    <Billboard>
      <mesh position-z={-2} {...restProps}>
        <planeGeometry args={[viewport.width * 1.5, viewport.height * 1.5]} />
        <meshBasicMaterial color={color} transparent alphaMap={alphaMap} />
      </mesh>
    </Billboard>
  )
}
