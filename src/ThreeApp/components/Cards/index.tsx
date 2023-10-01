import { useRef } from 'react'
import { type Vector2, MathUtils, Group } from 'three'
import { type GroupProps, useFrame, useThree } from '@react-three/fiber'
import { type SpringValue, to } from 'react-spring'
import { useCards } from 'hooks/useCards'
import { Card } from 'ThreeApp/components/Card'

const DEG = Math.PI / 180
const TEMP_TRANSFORM = [0, 0, 0]
const { lerp, clamp } = MathUtils

type TCardsProps = Omit<GroupProps, 'onClick'> & {
  cards: ReturnType<typeof useCards>['cards']
  currentIndex: SpringValue<number>
  hidden: SpringValue<number>
  onClick: (index: number, uv: Vector2) => void
}

export const Cards = ({
  cards,
  currentIndex,
  hidden,
  children,
  rotation,
  onClick,
  ...restProps
}: TCardsProps) => {
  const { viewport } = useThree()

  const ref = useRef<Group>(null)
  useFrame((s) => {
    const cards = ref.current
    if (!cards) {
      return
    }
    cards.rotation.x = lerp(0, 1 * DEG, -s.mouse.y) + (rotation?.[0] || 0)
    cards.rotation.y = lerp(0, 1 * DEG, s.mouse.x) + (rotation?.[1] || 0)
    cards.rotation.z = rotation?.[2] || 0
  })

  return (
    <group ref={ref} {...restProps}>
      {cards.map((card, i) => {
        const direction = i % 2 === 0 ? 1 : -1
        const deltaIndex = currentIndex.to((ci) => i - ci)
        const position = to([deltaIndex, hidden], (di, hi) => {
          const leaving = Math.min(di, 0)

          const deltaHidden = clamp(i - hi * cards.length, -1, 0)

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
            rotation={rotation}
            card={card}
            onClick={(e) => {
              e.stopPropagation()
              // @ts-ignore type mismatch, e.uv exists
              onClick(i, e.uv)
            }}
          />
        )
      })}
    </group>
  )
}
