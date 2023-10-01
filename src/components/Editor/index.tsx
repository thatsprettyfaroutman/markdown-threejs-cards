import { type Dispatch, type SetStateAction, useState, useEffect } from 'react'
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
  width: 400px;
  height: 100%;
`

const Content = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  background: transparent;
  color: #fff;

  &:focus,
  &:active {
    outline: none;
  }
`

const AContent = a(Content)

export const Editor = ({ onChange }: TEditorProps) => {
  const [value, setValue] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  // TODO: set editor open!
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
          x: editorVisible.to((p) => lerp(-400, 0, p)),
        }}
      >
        <TextArea
          value={loading ? 'loading' : value}
          onChange={(e) => {
            setValue(e.target.value)
          }}
        />
      </AContent>
    </Wrapper>
  )
}
