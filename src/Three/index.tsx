import { useEffect, useRef } from 'react'
import { NearestFilter, PCFSoftShadowMap, PointLight } from 'three'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Noise } from '@react-three/postprocessing'

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

    console.log(ref.current)
    ref.current.shadow.mapSize.width = 1024 * 4
    ref.current.shadow.mapSize.height = 1024 * 4
  }, [restProps.castShadow])

  return (
    <pointLight ref={ref} {...restProps}>
      <mesh>
        <meshBasicMaterial color="#fff" />
        <boxGeometry args={[1, 0.25, 0.25]} />
      </mesh>
    </pointLight>
  )
}

export const Three = ({ bg, ...restProps }) => {
  const { lightIntensity, lightX, lightZ } = useControls({
    lightIntensity: {
      value: 1,
      min: 0.01,
      max: 10,
    },
    lightX: {
      value: 0,
      min: -8,
      max: 8,
    },
    lightZ: {
      value: -3.3,
      min: -8,
      max: 0,
    },
  })

  return (
    <StyledThree {...restProps}>
      <Canvas style={{ height: '100vh' }} shadows={{ type: PCFSoftShadowMap }}>
        <OrbitControls enableZoom={false} enablePan={false} />
        {/* @ts-ignore */}
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={30}>
          <Light
            castShadow
            position={[lightX, 2, -lightZ]}
            intensity={lightIntensity}
          />
          <Light
            position={[lightX - 1, 2, -lightZ]}
            intensity={lightIntensity}
          />
          <Light
            position={[lightX + 1, 2, -lightZ]}
            intensity={lightIntensity}
          />
        </PerspectiveCamera>

        <ambientLight />
        <Glow color={chroma(bg).brighten(0.5).css()} />

        <Card />
        <Card position-z={-0.01 * 5} rotation-z={0.1 * 0.5} />
        <Card position-z={-0.02 * 5} rotation-z={0.2 * 0.5} />
        <Card position-z={-0.03 * 5} rotation-z={0.3 * 0.5} />

        <EffectComposer>
          <Noise opacity={0.02} />
        </EffectComposer>
      </Canvas>
    </StyledThree>
  )
}
