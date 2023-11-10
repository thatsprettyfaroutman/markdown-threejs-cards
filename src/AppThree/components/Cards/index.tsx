import { useRef, useEffect } from 'react'
import { type Vector2, Group } from 'three'
import { type GroupProps, useFrame, useThree } from '@react-three/fiber'
import { to, useSpringValue } from 'react-spring'
import { useCards } from 'hooks/useCards'
import { Card } from 'AppThree/components/Card'
import { MeshDiscardMaterial } from '@react-three/drei'
import lerp from 'lerp'
import clamp from 'ramda/src/clamp'

const TEMP_TRANSFORM = [0, 0, 0] as [x: number, y: number, z: number]
const DEG = Math.PI / 180
const SPRING_OPTIONS = { config: { precision: 0.0001 } }
const DEFAULT_ROTATION = [-10 * DEG, -10 * DEG, 0] as [
  x: number,
  y: number,
  z: number
]

type TCardsProps = Omit<GroupProps, 'onClick'> & {
  cards: ReturnType<typeof useCards>['cards']
  visible: boolean
}

export const Cards = ({
  cards,
  visible = true,
  rotation = DEFAULT_ROTATION,
  ...restProps
}: TCardsProps) => {
  const { viewport } = useThree()
  const ref = useRef<Group>(null)

  const currentIndexSpring = useSpringValue(0, SPRING_OPTIONS)
  const visibleSpring = useSpringValue(visible ? 1 : 0, SPRING_OPTIONS)

  useFrame((s) => {
    const cards = ref.current
    if (!cards) {
      return
    }
    cards.rotation.x = lerp(0, 1 * DEG, -s.mouse.y) + (rotation?.[0] || 0)
    cards.rotation.y = lerp(0, 1 * DEG, s.mouse.x) + (rotation?.[1] || 0)
    cards.rotation.z = rotation?.[2] || 0
  })

  // Reset current index every time cards change or visibility changes
  useEffect(() => {
    currentIndexSpring.start(0)
    visibleSpring.start(visible ? 1 : 0)
  }, [cards, visible, currentIndexSpring, visibleSpring])

  const handleCardClick = (index: number, uv: Vector2) => {
    if (index !== currentIndexSpring.goal) {
      currentIndexSpring.start(index)
      return
    }
    const direction = uv.x > 0.25 ? 1 : -1
    currentIndexSpring.start(
      Math.max(0, currentIndexSpring.goal + direction) % (cards.length + 1)
    )
  }

  return (
    <group ref={ref} {...restProps}>
      {cards.map((card, i) => {
        const direction = i % 2 === 0 ? 1 : -1
        const deltaIndex = currentIndexSpring.to((ci) => i - ci)
        const position = to([deltaIndex, visibleSpring], (di, vp) => {
          const leaving = Math.min(di, 0)
          const deltaHidden = clamp(-1, 0, i - (1 - vp) * cards.length)
          TEMP_TRANSFORM[0] = lerp(0, 0.05, di) + lerp(0, 1.5, leaving)
          TEMP_TRANSFORM[1] = lerp(0, viewport.height, deltaHidden)
          TEMP_TRANSFORM[2] = -0.26 * di
          return TEMP_TRANSFORM
        })

        const rotation = deltaIndex.to((di) => {
          const leaving = Math.min(di, 0)
          TEMP_TRANSFORM[0] = 0
          TEMP_TRANSFORM[1] = 0
          TEMP_TRANSFORM[2] =
            lerp(0, -2 * DEG, di) + lerp(0, -10 * DEG * direction, leaving)
          return TEMP_TRANSFORM
        })

        return (
          <Card
            key={i}
            position={position}
            rotation={rotation as unknown as typeof TEMP_TRANSFORM}
            card={card}
            onClick={(e) => {
              e.stopPropagation()
              handleCardClick(i, e.uv)
            }}
          />
        )
      })}

      {/* Reset plane */}
      <mesh
        position-z={-40}
        onClick={() => {
          if (currentIndexSpring.goal === cards.length) {
            currentIndexSpring.start(0)
          }
        }}
      >
        <planeBufferGeometry args={[100, 100]} />
        <MeshDiscardMaterial />
      </mesh>
    </group>
  )
}
