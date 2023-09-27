import { useState, useEffect, useMemo } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { useDebounce } from '@uidotdev/usehooks'
import { ThreeApp } from 'ThreeApp'
import chroma from 'chroma-js'
import { Leva, useControls } from 'leva'

const GlobalStyle = createGlobalStyle<{ bg: string }>`
  html, body {
    margin: 0;
    font-family: Montserrat, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    background-color: ${(p) => p.bg};
  }
`

const StyledApp = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
`

export const App = (props) => {
  const { bgDarken } = useControls({
    bgDarken: {
      value: -0.2,
      min: -2,
      max: 2,
      step: 0.01,
    },
  })

  const bg = chroma('#110825').darken(bgDarken).css()
  const levaBg = chroma(bg).brighten(0.1).css()

  const [mdLoading, setMdLoading] = useState(true)
  const [md, setMd] = useState<string | undefined>()

  useEffect(() => {
    const updateInitialMd = async () => {
      const res = await fetch('/content.md')
      const text = await res.text()
      setMdLoading(false)
      setMd(text)
    }
    updateInitialMd()
  }, [])

  const debouncedMd = useDebounce(md, 1000)

  return (
    <>
      <GlobalStyle bg={bg} />
      <StyledApp {...props}>
        <textarea
          value={mdLoading ? 'loading' : md}
          onChange={(e) => {
            setMd(e.target.value)
          }}
        />
        <ThreeApp bg={bg} md={debouncedMd} />
      </StyledApp>
      <Leva
        collapsed
        flat
        theme={{
          colors: {
            elevation1: levaBg, // bg color of the root panel (main title bar)
            elevation2: levaBg, // bg color of the rows (main panel color)
            // elevation3: 'var(--figma-color-bg)', // bg color of the inputs
            // accent1: '#f0f',
            // accent2: '#222',
            // accent3: 'var(--figma-color-bg-brand)',
          },
        }}
      />
    </>
  )
}
