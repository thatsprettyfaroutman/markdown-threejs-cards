import { useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import chroma from 'chroma-js'
import { useControls } from 'leva'

export default function useApp() {
  const { darken } = useControls(
    'Background',
    {
      darken: {
        value: 0.51,
        min: -2,
        max: 2,
        step: 0.01,
      },
    },
    { collapsed: true }
  )
  const bg = chroma('#110825').darken(darken).css()
  const levaBg = chroma(bg).brighten(0.2).css()

  const [markdown, setMarkdown] = useState<string | undefined>()
  const debouncedMarkdown = useDebounce(markdown, 1000)

  return {
    markdown: debouncedMarkdown,
    handleMarkdownChange: setMarkdown,

    background: chroma('#110825').darken(darken).css(),
    levaTheme: {
      colors: {
        elevation1: levaBg,
        elevation2: levaBg,
      },
    },
  }
}
