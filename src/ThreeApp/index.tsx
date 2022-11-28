import { useEffect, useRef } from 'react'
import { PCFSoftShadowMap, PointLight } from 'three'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Noise } from '@react-three/postprocessing'
import { range } from 'ramda'
import styled from 'styled-components'
import chroma from 'chroma-js'
import {
  OrbitControls,
  useTexture,
  PerspectiveCamera,
  Billboard,
} from '@react-three/drei'
import { useControls } from 'leva'
import { Card } from './components/Card'
import { useContent } from 'hooks/useContent'

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
  const ref = useRef<PointLight>()

  useEffect(() => {
    if (!ref.current || !restProps.castShadow) {
      return
    }

    ref.current.shadow.mapSize.width = 1024 * 4
    ref.current.shadow.mapSize.height = 1024 * 4
  }, [restProps.castShadow])

  return (
    <>
      <pointLight ref={ref} {...restProps}>
        <mesh>
          <meshBasicMaterial color="#fff" />
          <boxGeometry args={[1, 0.25, 0.25]} />
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
  return <group {...restProps}>{children}</group>
}

export const ThreeApp = ({ bg, ...restProps }) => {
  const { lightIntensity, lightX, lightY, lightZ, light2 } = useControls({
    lightIntensity: {
      value: 1.5,
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

  const cards = useContent()

  return (
    <StyledThree {...restProps}>
      <Canvas style={{ height: '100vh' }} shadows={{ type: PCFSoftShadowMap }}>
        <OrbitControls enableZoom={true} enablePan={true} />
        {/* @ts-ignore */}
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={30}>
          {/* <Light
            position={[lightX - 1, 2, -lightZ]}
            intensity={lightIntensity}
          />
          <Light
            position={[lightX + 1, 2, -lightZ]}
            intensity={lightIntensity}
          /> */}
          <Light
            castShadow
            position={[lightX, lightY, -lightZ]}
            intensity={lightIntensity}
          />
          {light2 && (
            <Light
              castShadow
              position={[lightX, -lightY, -lightZ]}
              intensity={lightIntensity}
            />
          )}
        </PerspectiveCamera>

        <ambientLight />
        <Glow color={chroma(bg).brighten(0.5).css()} />

        <Cards>
          {/* <Card />
          <Card position-z={-0.01 * 5} rotation-z={0.1 * 0.5} />
          <Card position-z={-0.02 * 5} rotation-z={0.2 * 0.5} />
          <Card position-z={-0.03 * 5} rotation-z={0.3 * 0.5} /> */}

          {range(0, (cards?.length || 0) + 1).map((i, _, all) => {
            const n = 3
            const x = i % n
            const y = ~~(i / n)
            return (
              <Card
                key={i}
                position-x={x * 1.25}
                position-y={y * -1.65}
                card={i !== 0 ? cards[i - 1] : undefined}
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
