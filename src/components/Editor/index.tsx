import { useState, useEffect } from 'react'
import styled, { css } from 'styled-components'
import { useMediaQuery } from '@uidotdev/usehooks'
import lerp from 'lerp'
import { a, useSpring } from 'react-spring'
import { MEDIA } from 'styles/media'

type TEditorProps = {
  onChange?: (md: string) => void
}

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
`

const Content = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100%;
  max-width: 400px;
  transition: background-color 0.2s ease-out;
  background-color: #000c;
  backdrop-filter: blur(16px);

  @media ${MEDIA.tablet} {
    background-color: transparent;
  }
`

const TextArea = styled.textarea`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: none;
  padding: 32px;
  padding-bottom: 128px;
  background: transparent;
  color: #fff;
  resize: none;
  font-size: 12px;
  font-family: monospace;
  line-height: 1.4;

  &:focus,
  &:active {
    outline: none;
  }
`

const Toggle = styled.div<{ $active: boolean }>`
  position: absolute;
  left: calc(100vw - 80px);
  bottom: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  aspect-ratio: 0.714286;
  min-width: 64px;
  border: 2px solid #f8afac;
  background-color: #f8afac00;
  font-size: 14px;
  font-weight: 500;
  color: #f8afac;
  cursor: pointer;
  user-select: none;

  transition: background-color 0.2s ease-out, color 0.2s ease-out;

  ${(p) =>
    p.$active &&
    css`
      background-color: #f8afac;
      color: #000;
    `};

  @media ${MEDIA.tablet} {
    display: none;
  }
`

const AContent = a(Content)
const AToggle = a(Toggle)

export const Editor = ({ onChange }: TEditorProps) => {
  const [value, setValue] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  const [editorOpen, setEditorOpen] = useState(false)
  const phone = !useMediaQuery(MEDIA.tablet)
  const { editorVisible } = useSpring({
    editorVisible: editorOpen || !phone ? 1 : 0,
  })

  useEffect(() => {
    const updateInitialMd = async () => {
      const res = await fetch('/content.md')
      const text = await res.text()
      setLoading(false)
      setValue(text)
    }
    updateInitialMd()
  }, [])

  useEffect(() => {
    if (onChange) {
      onChange(value)
    }
  }, [value, onChange])

  return (
    <Wrapper>
      <AContent
        style={{
          x: editorVisible.to((p) => {
            return lerp(-400, 0, p)
          }),
        }}
      >
        <TextArea
          value={loading ? 'loading' : value}
          onChange={(e) => {
            setValue(e.target.value)
          }}
        />
      </AContent>
      <AToggle
        $active={editorOpen}
        onClick={() => {
          setEditorOpen((s) => !s)
        }}
        style={{
          y: editorVisible.to((p) => {
            // bounce on y axis

            const t = Math.sin(p * Math.PI)
            return lerp(0, -16, t)
          }),
        }}
      >
        {editorOpen ? 'Done' : 'Edit'}
      </AToggle>
    </Wrapper>
  )
}
