import { useEffect, useRef } from 'react'
import { PCFSoftShadowMap, MathUtils, Group } from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Noise } from '@react-three/postprocessing'
import styled from 'styled-components'
import {
  OrbitControls,
  useTexture,
  PerspectiveCamera,
  Billboard,
} from '@react-three/drei'
import { useSpringValue } from 'react-spring'
import { useControls } from 'leva'
import { Card } from './components/Card'
import { useContent } from 'hooks/useContent'

const DEG = Math.PI / 180
const TEMP_TRANSFORM = [0, 0, 0]
const { lerp } = MathUtils

type TThreeAppProps = {
  bg?: string
  md?: string
}

const StyledThree = styled.div`
  position: relative;
`

const Glow = ({ color, ...restProps }) => {
  const alpha = useTexture('/textures/glow.png')
  return (
    // @ts-ignore
    <Billboard>
      <mesh position-z={-1} {...restProps}>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial color={color} transparent alphaMap={alpha} />
      </mesh>
    </Billboard>
  )
}

const Light = ({ ...restProps }) => {
  return (
    <>
      <pointLight
        {...restProps}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      >
        <mesh>
          <meshBasicMaterial color="#fff" />
          <boxGeometry args={[0.1, 0.1, 0.1]} />
        </mesh>
      </pointLight>

      {/* <directionalLight ref={ref} {...restProps}  color="#fff">
        <mesh>
          <meshBasicMaterial color="#fff" />
          <boxGeometry args={[1, 0.25, 0.25]} />
        </mesh>
      </directionalLight> */}
    </>
  )
}

const Cards = ({ children, ...restProps }) => {
  const ref = useRef<Group>(null)
  useFrame((s) => {
    const cards = ref.current
    if (!cards) {
      return
    }
    cards.rotation.x = lerp(0, 45 * DEG, -s.mouse.y)
    cards.rotation.y = lerp(0, 45 * DEG, s.mouse.x)
  })

  return (
    <group ref={ref} {...restProps}>
      {children}
    </group>
  )
}

export const ThreeApp = ({ bg, md, ...restProps }: TThreeAppProps) => {
  const { lightIntensity, lightX, lightY, lightZ, light2 } = useControls({
    lightIntensity: {
      value: 5.3,
      min: 0.01,
      max: 10,
    },
    lightX: {
      value: 0,
      min: -8,
      max: 8,
    },
    lightY: {
      value: 2,
      min: -8,
      max: 8,
    },
    lightZ: {
      value: -3.3,
      min: -8,
      max: 0,
    },
    light2: false,
  })

  const content = useContent(md)

  const cards = [
    // Default is the cover card
    // TODO: make this a real card
    undefined,

    // Cards generated from MD
    ...content.cards,
  ]

  const currentIndex = useSpringValue(0, { config: { precision: 0.0001 } })

  useEffect(() => {
    if (!md) {
      return
    }
    currentIndex.start(0)
  }, [md, currentIndex])

  return (
    <StyledThree
      {...restProps}
      onClick={(e) => {
        currentIndex.start((currentIndex.goal + 1) % (cards.length + 1))
      }}
    >
      <Canvas
        style={{ height: '100vh' }}
        // shadows={{ type: PCFSoftShadowMap }}
        shadows
      >
        {/* <OrbitControls enableZoom={true} enablePan={true} /> */}
        {/* @ts-ignore */}
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={25}>
          {/* <Light
            position={[lightX - 1, 2, -lightZ]}
            intensity={lightIntensity}
          />
          <Light
            position={[lightX + 1, 2, -lightZ]}
            intensity={lightIntensity}
          /> */}

          <Light
            position={[lightX, lightY, -lightZ]}
            intensity={lightIntensity}
          />
          {light2 && (
            <Light
              position={[lightX, -lightY, -lightZ]}
              intensity={lightIntensity}
            />
          )}
          {/* <Glow
            color={chroma(bg)
              .brighten(0.6)
              // .set('hsl.s', '+0.2')
              .css()}
            position-z={-5}
          /> */}
        </PerspectiveCamera>

        {/* <Light position={[0, 1, 2]} intensity={10} /> */}

        <ambientLight />

        <Cards>
          {cards.map((card, i) => {
            const direction = i % 2 === 0 ? 1 : -1

            const deltaIndex = currentIndex.to((ci) => i - ci)

            const position = deltaIndex.to((di) => {
              const leaving = Math.min(di, 0)
              TEMP_TRANSFORM[0] = lerp(0, 2 * direction, leaving)
              TEMP_TRANSFORM[1] = 0
              TEMP_TRANSFORM[2] = -0.05 * di
              return TEMP_TRANSFORM
            })

            const rotation = deltaIndex.to((di) => {
              const leaving = Math.min(di, 0)
              TEMP_TRANSFORM[0] = 0
              TEMP_TRANSFORM[1] = 0
              TEMP_TRANSFORM[2] =
                lerp(0, -1 * DEG, di) + lerp(0, -10 * DEG * direction, leaving)
              return TEMP_TRANSFORM
            })

            return (
              <Card
                key={i}
                position={position}
                rotation={rotation}
                card={card}
              />
            )
          })}
        </Cards>
        <EffectComposer>
          <Noise opacity={0.02} />
        </EffectComposer>
      </Canvas>
    </StyledThree>
  )
}
