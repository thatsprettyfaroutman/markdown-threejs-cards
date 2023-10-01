import { useRef } from 'react'
import { type Geometry, NearestFilter, Vector2, Vector3, Group } from 'three'
import { type GroupProps, useFrame, useThree } from '@react-three/fiber'
import { useTexture, useGLTF, MeshDiscardMaterial } from '@react-three/drei'
import { a } from '@react-spring/three'
import { useControls } from 'leva'
import { usePx } from 'hooks/usePx'

const MODEL_PATH = '/model/card.gltf'
const METALNESS_ROUGHNESS_TEXTURE_PATH = '/texture/metalnessRoughness.jpg'
const TEMP_3 = new Vector3()
const ORIGIN = new Vector3()
const MODEL_TRANSFORMS = {
  'rotation-y': Math.PI * -0.5,
  'rotation-z': Math.PI,
  'scale-x': -0.25,
}

type TCardProps = GroupProps & {
  card: any
}

type TModelGltf = {
  nodes: {
    Cube002: {
      geometry: Geometry
    }
    Cube002_1: {
      geometry: Geometry
    }
  }
}

useTexture.preload(METALNESS_ROUGHNESS_TEXTURE_PATH)
useGLTF.preload(MODEL_PATH)

export const Card = ({ card, ...restProps }: TCardProps) => {
  const levaProps = useControls({
    roughness: { value: 0.5, min: 0, max: 1 },
    metalness: { value: 0, min: 0, max: 1 },
    specularIntensity: { value: 2.6, min: 0, max: 10 },
    bumpScale: { value: 0.001, min: -0.001, max: 0.001 },
  })
  const px = usePx()
  // @ts-ignore mismatching types
  const { nodes } = useGLTF(MODEL_PATH) as TModelGltf
  const modelSize = nodes.Cube002.geometry.boundingBox.getSize(TEMP_3) || TEMP_3
  const width = modelSize.z
  const height = modelSize.y
  const { viewport } = useThree()
  const scale = Math.min(
    // Fit horizontally
    viewport.width - 64 * px,

    // Fit vertically
    viewport.height - 256 * px,

    // Make sure cards are not taller than 640px
    (640 * px) / height
  )

  const metalnessRoughnessMap = useTexture(METALNESS_ROUGHNESS_TEXTURE_PATH)
  metalnessRoughnessMap.minFilter = NearestFilter

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

  return (
    // @ts-ignore
    <a.group {...restProps} dispose={null}>
      <group scale={scale}>
        <mesh
          // rotation-x={-90 * DEG}
          onPointerMove={(e) => {
            pointerRef.current =
              // @ts-ignore
              e.point.clone().sub(e.object.getWorldPosition(ORIGIN))
          }}
          onPointerLeave={() => (pointerRef.current = undefined)}
        >
          <planeGeometry args={[width, height]} />
          {/* <meshBasicMaterial color="#f0f" wireframe /> */}
          <MeshDiscardMaterial />
        </mesh>

        <group ref={cardFacesGroupRef}>
          <group {...MODEL_TRANSFORMS}>
            <mesh castShadow receiveShadow geometry={nodes.Cube002.geometry}>
              <meshPhysicalMaterial
                map={card?.textureMap?.diffuse}
                metalnessMap={metalnessRoughnessMap}
                roughnessMap={metalnessRoughnessMap}
                specularColorMap={card?.textureMap?.specularColor}
                bumpMap={card?.textureMap?.normal}
                // side={DoubleSide}
                {...levaProps}
              />
            </mesh>

            <mesh castShadow receiveShadow geometry={nodes.Cube002_1.geometry}>
              <meshStandardMaterial color="#000" />
            </mesh>
          </group>
        </group>
      </group>
    </a.group>
  )
}
