import { useRef, useMemo } from 'react'
import { NearestFilter, Group, Vector2, Vector3, CanvasTexture } from 'three'
import { useFrame } from '@react-three/fiber'
import { useTexture, useGLTF } from '@react-three/drei'
import { useControls } from 'leva'

const textureConfig = (texture) => {
  texture.minFilter = NearestFilter
}

const ORIGIN_3 = new Vector3()

export const Card = ({ card, ...restProps }) => {
  const { nodes } = useGLTF('/models/card.gltf')

  const generatedDiffuse = useMemo(() => {
    if (!card?.diffuse) {
      return
    }
    const texture = new CanvasTexture(card.diffuse)
    return texture
  }, [card])

  const generatedSpecularColor = useMemo(() => {
    if (!card?.diffuse) {
      return
    }
    const texture = new CanvasTexture(card.specularColor)
    return texture
  }, [card])

  const levaProps = useControls({
    specularIntensity: { value: 1, min: 0, max: 10 },
    bumpScale: { value: 0.0005, min: -0.001, max: 0.001 },
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

  const cardFacesGroupRef = useRef<Group | undefined>()
  const pointerRef = useRef<Vector2 | undefined>()

  useFrame(() => {
    const cardFaces = cardFacesGroupRef.current
    const pointer = pointerRef.current
    if (!cardFaces) {
      return
    }

    if (!pointer) {
      cardFaces.rotation.x *= 0.9
      cardFaces.rotation.y *= 0.9
      return
    }

    const tx = -pointer.y * 0.4
    const ty = pointer.x * 0.3

    const dx = tx - cardFaces.rotation.x
    const dy = ty - cardFaces.rotation.y

    cardFaces.rotation.x += dx * 0.1
    cardFaces.rotation.y += dy * 0.1
  })

  const modelCorrections = {
    'rotation-y': Math.PI * -0.5,
    'rotation-z': Math.PI,
    'scale-x': -0.25,
  }

  return (
    <group {...restProps} dispose={null}>
      <mesh
        {...modelCorrections}
        geometry={nodes.Cube002.geometry}
        onPointerMove={(e) => {
          pointerRef.current =
            // @ts-ignore
            e.point.clone().sub(e.object.getWorldPosition(ORIGIN_3))
        }}
        onPointerLeave={() => (pointerRef.current = undefined)}
      >
        <meshBasicMaterial color="#f0f" transparent opacity={0} />
      </mesh>

      <group ref={cardFacesGroupRef}>
        <group {...modelCorrections}>
          <mesh castShadow receiveShadow geometry={nodes.Cube002.geometry}>
            <meshPhysicalMaterial
              attach="material"
              map={generatedDiffuse || texture}
              roughness={0.5}
              roughnessMap={roughness}
              metalnessMap={metal}
              specularColorMap={generatedSpecularColor || specularColor}
              specularIntensity={levaProps.specularIntensity}
              bumpMap={bump}
              bumpScale={levaProps.bumpScale}
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
              specularIntensity={levaProps.specularIntensity}
              bumpMap={backBump}
              bumpScale={levaProps.bumpScale}
            />
          </mesh>
          <mesh
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
          </mesh>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/card.gltf')
