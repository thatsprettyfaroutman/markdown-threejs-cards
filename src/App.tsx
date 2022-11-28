import styled, { createGlobalStyle } from 'styled-components'
import { ThreeApp } from 'ThreeApp'
import chroma from 'chroma-js'
import { useControls } from 'leva'

const GlobalStyle = createGlobalStyle<{ bg: string }>`
  html, body {
    margin: 0;
    font-family: Montserrat, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    background-color: ${(p) => p.bg};
  }
`

const StyledApp = styled.div``

export const App = (props) => {
  const { bgDarken } = useControls({
    bgDarken: {
      value: 0.65,
      min: -2,
      max: 2,
      step: 0.01,
    },
  })

  const bg = chroma('#141328').darken(bgDarken).css()

  return (
    <>
      <GlobalStyle bg={bg} />
      <StyledApp {...props}>
        <ThreeApp bg={bg} />
      </StyledApp>
    </>
  )
}
