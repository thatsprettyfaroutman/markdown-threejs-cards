import { useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'

export const Camera = () => {
  const { size } = useThree()

  return (
    <PerspectiveCamera
      makeDefault
      position={[0, 0, 4]}
      // @ts-ignore
      fov={25}
      onUpdate={(c) =>
        c.setViewOffset(
          size.width,
          size.height,
          -200,
          0,
          size.width,
          size.height
        )
      }
    />
  )
}
