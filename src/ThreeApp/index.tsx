import { useEffect, useRef } from 'react'
import { MathUtils, Group } from 'three'
import { type GroupProps, Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Noise } from '@react-three/postprocessing'
import styled from 'styled-components'
import chroma from 'chroma-js'
import {
  useTexture,
  PerspectiveCamera,
  Billboard,
  SpotLight,
} from '@react-three/drei'
import { type SpringValue, useSpringValue, to } from 'react-spring'
import { useControls } from 'leva'
import { Card } from './components/Card'
import { useCards } from 'hooks/useCards'

const DEG = Math.PI / 180
const TEMP_TRANSFORM = [0, 0, 0]
const { lerp, clamp } = MathUtils

const DPR = Math.min(
  2,
  typeof window !== 'undefined' ? window.devicePixelRatio : 0
)

type TThreeAppProps = {
  md?: string
  bg?: string
  editing?: boolean
  onError?: () => void
}

type TCardsProps = GroupProps & {
  cards: ReturnType<typeof useCards>['cards']
  currentIndex: SpringValue<number>
  hidden: SpringValue<number>
}

const StyledThree = styled.div`
  position: relative;
`

const Camera = () => {
  const { size } = useThree()

  return (
    <PerspectiveCamera
      makeDefault
      position={[0, 0, 4]}
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

const Glow = ({ color, ...restProps }) => {
  const alpha = useTexture('/glow.png')
  const { viewport } = useThree()
  return (
    // @ts-ignore
    <Billboard>
      <mesh position-z={-2} {...restProps}>
        <planeGeometry args={[viewport.width * 1.5, viewport.height * 1.5]} />
        <meshBasicMaterial color={color} transparent alphaMap={alpha} />
      </mesh>
    </Billboard>
  )
}

const Cards = ({
  cards,
  currentIndex,
  hidden,
  children,
  rotation,
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
          <Card key={i} position={position} rotation={rotation} card={card} />
        )
      })}
    </group>
  )
}

export const ThreeApp = ({
  md,
  bg = '#fff',
  editing = false,
  onError,
  ...restProps
}: TThreeAppProps) => {
  const {
    lightIntensity,
    ambientIntensity,
    lightX,
    lightY,
    lightZ,
    lightAngle,
  } = useControls({
    lightIntensity: {
      value: 10,
      min: 0.01,
      max: 100,
    },
    ambientIntensity: {
      value: 6,
      min: 0.01,
      max: 100,
    },
    lightX: {
      // value: -1.4,
      value: -0.4,
      min: -8,
      max: 8,
    },
    lightY: {
      // value: 1,
      value: 1.6,
      min: -8,
      max: 8,
    },
    lightZ: {
      // value: -4,
      value: -3,
      min: -8,
      max: 8,
    },
    lightAngle: {
      value: 0.26,
      min: 0,
      max: 180 * DEG,
    },
  })

  const { cards, processing, errored } = useCards(md, { dpr: DPR })
  const currentIndex = useSpringValue(0, { config: { precision: 0.0001 } })

  const hidden = useSpringValue(editing || processing ? 1 : 0)
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

  const lightColor =
    //'#222' ||
    '#24134A'

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
        <ambientLight args={[lightColor, ambientIntensity]} />

        <SpotLight
          position={[lightX, lightY, -lightZ]}
          // @ts-ignore
          intensity={lightIntensity}
          angle={lightAngle}
          penumbra={0.1}
          attenuation={4.5}
          castShadow
        />

        <Cards rotation={[-10 * DEG, -10 * DEG, 0]} {...cardsProps} />
        <Glow
          color={chroma(lightColor).brighten(0.5).hex()}
          // color="#f0f"
        />
        <EffectComposer>
          <Noise opacity={0.05} />
        </EffectComposer>
      </Canvas>
    </StyledThree>
  )
}
