import { useRef } from 'react'
import { NearestFilter } from 'three'
import { useFrame } from '@react-three/fiber'

import { useTexture } from '@react-three/drei'

const textureConfig = (texture) => {
  texture.minFilter = NearestFilter
}

export const Card = ({ ...restProps }) => {
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
      receiveShadow
      castShadow
      // onPointerMove={(e) => console.log(e.pointer)}
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
