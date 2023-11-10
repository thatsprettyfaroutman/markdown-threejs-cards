import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle<{ background: string }>`
  html, body {
    margin: 0;
    font-family: Montserrat, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    background-color: ${(p) => p.background};
    overflow: hidden;
  }
`

export default GlobalStyle
