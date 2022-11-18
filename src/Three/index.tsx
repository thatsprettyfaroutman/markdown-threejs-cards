import { useRef } from 'react'
import { NearestFilter } from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Noise, Vignette } from '@react-three/postprocessing'

import styled from 'styled-components'
import chroma from 'chroma-js'
import {
  OrbitControls,
  useTexture,
  PerspectiveCamera,
  Billboard,
} from '@react-three/drei'
import { useControls } from 'leva'

const StyledThree = styled.div`
  position: relative;
`

const textureConfig = (texture) => {
  texture.minFilter = NearestFilter
}

const Card = ({ ...restProps }) => {
  const [texture, specularColor, metal, roughness] = useTexture(
    [
      '/textures/diffuseStroke.png',
      '/textures/specularColorStroke.png',
      '/textures/metalStroke.png',
      '/textures/roughnessStroke.png',
    ],
    textureConfig
  )
  const [backTexture, backSpecularColor, backMetal, backRoughness] = useTexture(
    [
      '/textures/backDiffuseStroke.png',
      '/textures/backSpecularColorStroke.png',
      '/textures/backMetalStroke.png',
      '/textures/backRoughnessStroke.png',
    ],
    textureConfig
  )

  // This reference will give us direct access to the mesh
  const mesh = useRef()
  // Set up state for the hovered and active state
  // const [hovered, setHover] = useState(false)
  // const [active, setActive] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => {
    if (!mesh.current) {
      return
    }

    // @ts-ignore
    // mesh.current.rotation.x += 0.01
  })
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...restProps}
      ref={mesh}
      // scale={active ? 1.5 : 1}
      // onClick={(event) => setActive(!active)}
      // onPointerOver={(event) => setHover(true)}
      // onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 1.4, 0.005]} />

      <meshPhysicalMaterial attach="material-0" color="#0D0E1A" specular={1} />
      <meshPhysicalMaterial attach="material-1" color="#0D0E1A" specular={1} />
      <meshPhysicalMaterial attach="material-2" color="#0D0E1A" specular={1} />
      <meshPhysicalMaterial attach="material-3" color="#0D0E1A" specular={1} />
      <meshPhysicalMaterial attach="material-4" color="#0D0E1A" specular={1} />
      <meshPhysicalMaterial
        attach="material-4"
        map={texture}
        roughness={0.5}
        roughnessMap={roughness}
        metalnessMap={metal}
        specularColorMap={specularColor}
        transparent
      />
      <meshPhysicalMaterial
        attach="material-5"
        map={backTexture}
        roughness={0.5}
        roughnessMap={backRoughness}
        metalnessMap={backMetal}
        specularColorMap={backSpecularColor}
        transparent
      />
    </mesh>
  )
}

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

export const Three = ({ bg, ...restProps }) => {
  const { lightDistance } = useControls({
    lightDistance: {
      value: -3.3,
      min: -8,
      max: 0,
      step: 0.1,
    },
  })

  return (
    <StyledThree {...restProps}>
      <Canvas style={{ height: '100vh' }}>
        <OrbitControls enableZoom={false} enablePan={false} />
        {/* @ts-ignore */}
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={30}>
          <pointLight position={[0, 2, -lightDistance]}>
            <mesh>
              <meshBasicMaterial color="#fff" />
              <boxGeometry args={[1, 1, 1]} />
            </mesh>
          </pointLight>
        </PerspectiveCamera>

        <ambientLight />
        <Glow color={chroma(bg).brighten(0.5).css()} />

        <Card />

        <EffectComposer>
          <Noise opacity={0.02} />
          {/* <Vignette eskil={false} offset={0.1} darkness={0.1} /> */}
        </EffectComposer>
      </Canvas>
    </StyledThree>
  )
}
