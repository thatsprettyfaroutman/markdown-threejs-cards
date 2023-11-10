import { PropsWithChildren } from 'react'
import { Canvas } from '@react-three/fiber'
import styled from 'styled-components'
import { Lighting } from 'AppThree/components/Lighting'
import { Camera } from 'AppThree/components/Camera'

type TThreeCanvasProps = PropsWithChildren<{}>

const Wrapper = styled.div`
  position: relative;
  user-select: none;
  touch-action: none;
  height: 100vh;
`

export default function AppThree({
  children,
  ...restProps
}: TThreeCanvasProps) {
  return (
    <Wrapper {...restProps}>
      <Canvas shadows linear>
        <Camera />
        <Lighting />
        {children}
      </Canvas>
    </Wrapper>
  )
}
