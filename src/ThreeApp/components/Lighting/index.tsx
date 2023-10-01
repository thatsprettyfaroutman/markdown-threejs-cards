import { type SpotLightProps } from '@react-three/fiber'
import { SpotLight } from '@react-three/drei'
import { useControls } from 'leva'
import chroma from 'chroma-js'
import { Glow } from 'ThreeApp/components/Glow'

const DEG = Math.PI / 180

type TLightingProps = SpotLightProps & {
  ambientColor?: string
}

export const Lighting = ({
  ambientColor = '#362b4d',
  ...restProps
}: TLightingProps) => {
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
      value: 0.27,
      min: 0,
      max: 180 * DEG,
    },
  })

  return (
    <>
      <ambientLight args={[ambientColor, ambientIntensity]} />
      <SpotLight
        position={[lightX, lightY, -lightZ]}
        color="#fff"
        // @ts-ignore
        intensity={lightIntensity}
        angle={lightAngle}
        penumbra={0.1}
        attenuation={4.5}
        castShadow
        {...restProps}
      />
      <Glow color={chroma(ambientColor).brighten(0.5).hex()} />
    </>
  )
}
