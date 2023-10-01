import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Noise } from '@react-three/postprocessing'
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
  }

  return (
    <StyledThree
      {...restProps}
      onClick={() => {
        currentIndex.start((currentIndex.goal + 1) % (cards.length + 1))
      }}
    >
      <Canvas dpr={DPR} style={{ height: '100vh' }} shadows linear>
        {/* @ts-ignore */}
        <Camera />
        <Lighting />
        <Cards rotation={[-10 * DEG, -10 * DEG, 0]} {...cardsProps} />
        <Spinner visible={editing || processing} />
        <EffectComposer>
          <Noise opacity={0.025} />
        </EffectComposer>
      </Canvas>
    </StyledThree>
  )
}
