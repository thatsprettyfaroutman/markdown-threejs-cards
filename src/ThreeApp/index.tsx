import { useEffect } from 'react'
import { type Vector2 } from 'three'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Noise } from '@react-three/postprocessing'
import { MeshDiscardMaterial } from '@react-three/drei'
import styled from 'styled-components'
import { useSpringValue } from 'react-spring'
import { useCards } from 'hooks/useCards'
import { Lighting } from 'ThreeApp/components/Lighting'
import { Camera } from 'ThreeApp/components/Camera'
import { Cards } from 'ThreeApp/components/Cards'
import { Spinner } from 'ThreeApp/components/Spinner'

const DEG = Math.PI / 180
const DPR = Math.min(2, window.devicePixelRatio || 0)
const SPRING_OPTIONS = { config: { precision: 0.0001 } }

type TThreeAppProps = {
  md?: string
  editing?: boolean
  onError?: () => void
}

const StyledThree = styled.div`
  position: relative;
  user-select: none;
  touch-action: none;
`

export const ThreeApp = ({
  md,
  editing = false,
  onError,
  ...restProps
}: TThreeAppProps) => {
  const { cards, processing, errored } = useCards(md)
  const currentIndex = useSpringValue(0, SPRING_OPTIONS)
  const hidden = useSpringValue(editing || processing ? 1 : 0, SPRING_OPTIONS)
  hidden.start(editing || processing ? 1 : 0)

  useEffect(() => {
    if (!md) {
      return
    }
    currentIndex.start(0)
  }, [md, currentIndex])

  useEffect(() => {
    if (errored && onError) {
      onError()
    }
  }, [errored, onError])

  const cardsProps = {
    cards,
    currentIndex,
    hidden,
    onClick: (index: number, uv: Vector2) => {
      if (index !== currentIndex.goal) {
        currentIndex.start(index)
        return
      }
      const direction = uv.x > 0.25 ? 1 : -1
      currentIndex.start(
        Math.max(0, currentIndex.goal + direction) % (cards.length + 1)
      )
    },
  }

  return (
    <StyledThree {...restProps}>
      <Canvas dpr={DPR} style={{ height: '100vh' }} shadows linear>
        {/* @ts-ignore */}
        <Camera />
        <Lighting />
        <Cards rotation={[-10 * DEG, -10 * DEG, 0]} {...cardsProps} />
        <Spinner visible={editing || processing} />
        <mesh
          position-z={-40}
          onClick={() => {
            if (currentIndex.goal === cards.length) {
              currentIndex.start(0)
            }
          }}
        >
          <planeBufferGeometry args={[100, 100]} />
          <MeshDiscardMaterial />
        </mesh>
        <EffectComposer>
          <Noise opacity={0.025} />
        </EffectComposer>
      </Canvas>
    </StyledThree>
  )
}
