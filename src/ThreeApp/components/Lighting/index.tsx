import { SpotLight } from '@react-three/drei'
import { useControls } from 'leva'
import chroma from 'chroma-js'
import { Glow } from 'ThreeApp/components/Glow'

const DEG = Math.PI / 180

type TLightingProps = {
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
  } = useControls(
    'Lighting',
    {
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
        value: -0.4,
        min: -8,
        max: 8,
      },
      lightY: {
        value: 1.6,
        min: -8,
        max: 8,
      },
      lightZ: {
        value: -3,
        min: -8,
        max: 8,
      },
      lightAngle: {
        value: 0.27,
        min: 0,
        max: 180 * DEG,
      },
    },
    { collapsed: true }
  )

  return (
    <>
      <ambientLight args={[ambientColor, ambientIntensity]} />
      <SpotLight
        position={[lightX, lightY, -lightZ]}
        intensity={lightIntensity}
        angle={lightAngle}
        penumbra={0.1}
        attenuation={4.5}
        castShadow
        shadow-bias={-0.0001}
        {...restProps}
      />
      <Glow color={chroma(ambientColor).brighten(0.5).hex()} />
    </>
  )
}
