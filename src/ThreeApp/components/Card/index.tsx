import { useRef, useMemo } from 'react'
import { NearestFilter, Group, Vector2, Vector3, CanvasTexture } from 'three'
import { type GroupProps, useFrame } from '@react-three/fiber'
import { useTexture, useGLTF, MeshDiscardMaterial } from '@react-three/drei'
import { a } from '@react-spring/three'
import { useControls } from 'leva'
// import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise'

// const improvedNoise = new ImprovedNoise()

// for (let i = 0; i < 100; i++) {
//   console.log(improvedNoise.noise(i * 0.01, 0.2, 0.3))
// }

type TCardProps = GroupProps & {
  card: any
}

const textureConfig = (texture) => {
  texture.minFilter = NearestFilter
}

const ORIGIN_3 = new Vector3()

export const Card = ({ card, ...restProps }: TCardProps) => {
  // @ts-ignore
  const { nodes } = useGLTF('/models/card.gltf')

  // const generatedDiffuse = useMemo(() => {
  //   if (!card?.diffuse) {
  //     return
  //   }
  //   const texture = new CanvasTexture(card.diffuse)
  //   return texture
  // }, [card])

  // const generatedSpecularColor = useMemo(() => {
  //   if (!card?.diffuse) {
  //     return
  //   }
  //   const texture = new CanvasTexture(card.specularColor)
  //   return texture
  // }, [card])

  const levaProps = useControls({
    roughness: { value: 0.5, min: 0, max: 1 },
    metalness: { value: 0, min: 0, max: 1 },
    specularIntensity: { value: 1, min: 0, max: 10 },
    bumpScale: { value: 0.001, min: -0.001, max: 0.001 },
  })

  const [texture, specularColor, metal, roughness, bump] = useTexture(
    [
      '/textures/diffuseStroke.png',
      '/textures/specularColorStroke.png',
      '/textures/metalStroke.png',
      '/textures/roughnessStroke.png',
      '/textures/bumpStroke.png',
    ],
    textureConfig
  )
  const [backTexture, backSpecularColor, backMetal, backRoughness, backBump] =
    useTexture(
      [
        '/textures/backDiffuseStroke.png',
        '/textures/backSpecularColorStroke.png',
        '/textures/backMetalStroke.png',
        '/textures/backRoughnessStroke.png',
        '/textures/backBumpStroke.png',
      ],
      textureConfig
    )

  const modelCorrections = {
    'rotation-y': Math.PI * -0.5,
    'rotation-z': Math.PI,
    'scale-x': -0.25,
  }

  return (
    // @ts-ignore
    <a.group {...restProps} dispose={null}>
      <group {...modelCorrections}>
        <mesh castShadow receiveShadow geometry={nodes.Cube002.geometry}>
          <meshPhysicalMaterial
            attach="material"
            map={card?.texture['diffuse'] || texture}
            // roughness={0.5}
            roughnessMap={roughness}
            metalnessMap={metal}
            specularColorMap={card?.texture['specularColor'] || specularColor}
            bumpMap={card?.texture['normal']}
            // bumpMap={bump}
            {...levaProps}
          />
        </mesh>
        {/* <mesh castShadow receiveShadow geometry={nodes.Cube002_1.geometry}>
            <meshPhysicalMaterial
              attach="material"
              map={backTexture}
              roughness={0.5}
              roughnessMap={backRoughness}
              metalnessMap={backMetal}
              specularColorMap={backSpecularColor}
              specularIntensity={levaProps.specularIntensity}
              bumpMap={backBump}
              bumpScale={levaProps.bumpScale}
            />
          </mesh> */}
        {/* <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube002_2.geometry}
            // material={materials.Edge}
          >
            <meshPhysicalMaterial
              attach="material"
              roughness={0.6}
              metalness={0}
              color="#0D0E1A"
            />
          </mesh> */}
      </group>
    </a.group>
  )
}

useGLTF.preload('/models/card.gltf')
