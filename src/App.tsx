import { useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { useDebounce } from '@uidotdev/usehooks'
import chroma from 'chroma-js'
import { Leva, useControls } from 'leva'
import { ThreeApp } from 'ThreeApp'
import { Editor } from 'components/Editor'

const GlobalStyle = createGlobalStyle<{ bg: string }>`
  html, body {
    margin: 0;
    font-family: Montserrat, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    background-color: ${(p) => p.bg};
    overflow: hidden;
  }
`

const StyledApp = styled.div`
  position: relative;
`

const ErrorMessage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000c;
  color: #fff;
`

export const App = (props) => {
  const { bgDarken } = useControls({
    bgDarken: {
      value: 0.51,
      min: -2,
      max: 2,
      step: 0.01,
    },
  })

  const bg = chroma('#110825').darken(bgDarken).css()
  const levaBg = chroma(bg).brighten(0.2).css()

  const [md, setMd] = useState<string | undefined>()
  const [errored, setErrored] = useState(false)
  const debouncedMd = useDebounce(md, 1000)
  const editing = md !== debouncedMd

  return (
    <>
      <GlobalStyle bg={bg} />
      <StyledApp {...props}>
        <ThreeApp
          md={debouncedMd}
          editing={editing}
          onError={() => {
            setErrored(true)
          }}
        />

        <Editor onChange={(value) => setMd(value)} />

        {errored && (
          <ErrorMessage>
            Hmm, that didn't work. Your browser might not support webworkers 😿
          </ErrorMessage>
        )}
      </StyledApp>
      <Leva
        collapsed
        flat
        theme={{
          colors: {
            elevation1: levaBg, // bg color of the root panel (main title bar)
            elevation2: levaBg, // bg color of the rows (main panel color)
          },
        }}
      />
    </>
  )
}
