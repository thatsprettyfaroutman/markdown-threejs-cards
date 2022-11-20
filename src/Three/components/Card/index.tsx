import { NearestFilter } from 'three'
import { useTexture, useGLTF } from '@react-three/drei'

const textureConfig = (texture) => {
  texture.minFilter = NearestFilter
}

export const Card = (props) => {
  const { nodes, materials } = useGLTF('/models/card.gltf')

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

  return (
    <group {...props} dispose={null}>
      <group rotation-y={Math.PI * -0.5} rotation-z={Math.PI} scale-x={-1}>
        <mesh castShadow receiveShadow geometry={nodes.Cube002.geometry}>
          <meshPhysicalMaterial
            attach="material"
            map={texture}
            roughness={0.5}
            roughnessMap={roughness}
            metalnessMap={metal}
            specularColorMap={specularColor}
            transparent
          />
        </mesh>
        <mesh castShadow receiveShadow geometry={nodes.Cube002_1.geometry}>
          <meshPhysicalMaterial
            attach="material"
            map={backTexture}
            roughness={0.5}
            roughnessMap={backRoughness}
            metalnessMap={backMetal}
            specularColorMap={backSpecularColor}
            transparent
          />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube002_2.geometry}
          material={materials.Edge}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/models/card.gltf')
