import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { type Object3D, MathUtils } from 'three'
import { a, easings } from '@react-spring/three'
import { useTexture } from '@react-three/drei'
import { usePx } from 'hooks/usePx'
import { useSpringValue } from 'react-spring'

const { lerp } = MathUtils

const DEG = Math.PI / 180
const NORMAL_TEXTURE_PATH = '/texture/paper-normal.jpg'
const ITEMS = [...new Array(4).keys()]

type TSpinnerProps = { visible?: boolean }

export const Spinner = ({ visible = true, ...restProps }: TSpinnerProps) => {
  const ref = useRef<Object3D>()
  const px = usePx()
  const normalMap = useTexture(NORMAL_TEXTURE_PATH)

  const visibleSpring = useSpringValue(visible ? 1 : 0, {
    config: { precision: 0.0001 },
  })
  visibleSpring.start(visible ? 1 : 0)

  useFrame((s) => {
    const group = ref.current
    if (!group) {
      return
    }

    if (visibleSpring.get() < 0.001) {
      return
    }

    const t = s.clock.getElapsedTime()
    const currentIndex = 1 - ((t * 1.5) % 1)

    for (let i = 0; i < ITEMS.length; i++) {
      const item = group.children[i]
      if (!item) {
        continue
      }

      const deltaIndex = i - currentIndex

      const moving = Math.max(deltaIndex, 0)
      const entering = easings.easeInCubic(Math.abs(Math.min(deltaIndex, 0)))
      const leaving = Math.min(ITEMS.length - 1 - moving, 1)

      item.position.x = deltaIndex * 0.125 + entering * -1
      item.position.z = moving * -0.5
      item.position.y = moving * -0.125
      item.rotation.z = entering * 0.5
      item.material.opacity = leaving * Math.min(1, (1 - entering) * 2)
    }
  })

  return (
    // @ts-ignore
    <a.group
      // @ts-ignore
      ref={ref}
      // @ts-ignore
      scale={80 * px}
      // @ts-ignore
      {...restProps}
      rotation-x={-22.5 * DEG}
      rotation-y={-22.5 * DEG}
      // @ts-ignore
      position-z={visibleSpring.to((p) => lerp(-10, 0, p))}
    >
      {ITEMS.map((i) => (
        <mesh key={i}>
          <boxGeometry args={[1, 1.4, 0.05]} />
          <meshPhysicalMaterial
            color="#FE7877"
            transparent
            bumpMap={normalMap}
            bumpScale={0.025}
          />
        </mesh>
      ))}
    </a.group>
  )
}

useTexture.preload(NORMAL_TEXTURE_PATH)
