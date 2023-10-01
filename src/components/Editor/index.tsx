import { useState, useEffect } from 'react'
import styled from 'styled-components'
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
  background-color: #0008;
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

  &:focus,
  &:active {
    outline: none;
  }
`

const Toggle = styled.div`
  position: absolute;
  left: 16px;
  bottom: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  aspect-ratio: 0.714286;
  min-width: 64px;
  border: 2px solid #f8afac;
  background-color: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #f8afac;
  cursor: pointer;
  user-select: none;

  @media ${MEDIA.tablet} {
    display: none;
  }
`

const AContent = a(Content)

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
      <Toggle
        onClick={() => {
          setEditorOpen((s) => !s)
        }}
      >
        {editorOpen ? 'Done' : 'Edit'}
      </Toggle>
    </Wrapper>
  )
}
