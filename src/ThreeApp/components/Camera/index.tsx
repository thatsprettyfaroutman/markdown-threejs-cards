import { useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { useMediaQuery } from '@uidotdev/usehooks'
import { MEDIA } from 'styles/media'

export const Camera = () => {
  const { size, camera } = useThree()
  const phone = !useMediaQuery(MEDIA.tablet)

  const updateCameraOffset = (c: typeof camera) => {
    c.setViewOffset(
      size.width,
      size.height,
      phone ? 0 : -200,
      0,
      size.width,
      size.height
    )
  }
  updateCameraOffset(camera)

  return (
    <PerspectiveCamera
      makeDefault
      position={[0, 0, 4]}
      fov={25}
      onUpdate={updateCameraOffset}
    />
  )
}
