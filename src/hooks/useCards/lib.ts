import { last } from 'ramda'
import camelCase from 'lodash.camelcase'

export const loadImage = async (src: string) => {
  const imgRes = await fetch(src)
  const imgBlob = await imgRes.blob()
  return createImageBitmap(imgBlob)
}

export const loadFonts = (self: Pick<Window & typeof globalThis, 'fonts'>) => {
  const headingFont = new FontFace(
    'Heading Font',
    "url(/font/montserrat-700.woff2) format('woff2')",
    {
      weight: '700',
    }
  )
  self.fonts.add(headingFont)

  const bodyFont = new FontFace(
    'Body Font',
    "url(/font/montserrat-400.woff2) format('woff2')",
    {
      weight: '400',
    }
  )
  self.fonts.add(bodyFont)

  return Promise.all([headingFont.load(), bodyFont.load()])
}

export const processMd = async (md: string) => {
  const items = await Promise.all(
    md
      .split('\n')
      .map((x) => x.trim())
      .map(async (x) => {
        if (x.startsWith('## ')) {
          return ['h2', x.split('## ')[1]] as ['h2', string]
        }

        if (x.startsWith('# ')) {
          return ['h1', x.split('# ')[1]] as ['h1', string]
        }

        if (x.startsWith('![')) {
          const [, alt, srcsString] = x.match(/!\[(.*)\]\((.*)\)/)
          const srcs = srcsString.split(',').map((x) => x.trim())
          const imgs = await Promise.all(
            srcs.map(async (src) => {
              const ext = last(src.split('.'))
              const name = camelCase(last(src.split(`.${ext}`)[0].split('.')))
              const img = await loadImage(src)
              return [name, img] as [string, typeof img]
            })
          )
          const imgMap = Object.fromEntries(imgs)

          const type = alt.toLowerCase() === 'cover' ? 'cover' : 'img'

          return [type, imgMap, alt] as [typeof type, typeof imgMap, string]
        }

        if (!x) {
          return undefined
        }

        return ['p', x] as ['p', string]
      })
  )

  return items.filter(Boolean)
}
