import { expose } from 'comlink'
import { processMd, loadFonts } from './lib'
import { TProcessContentProps } from './types'
import { generateCardTexture } from './canvas'
import { getMeasuredCards } from './measure'

export default {} as typeof Worker & { new (): Worker }

const getMarkdown = async ({
  md,
  mdSrc,
}: Pick<TProcessContentProps, 'md' | 'mdSrc'>) => {
  if (md) {
    return md
  }
  const res = await fetch(mdSrc)
  return res.text()
}

// Define API
export const api = {
  processContent: async (
    contentPropsParam: Omit<TProcessContentProps, 'canvas'>
  ) => {
    // eslint-disable-next-line
    await loadFonts(self)

    // @ts-ignore
    const canvas = new OffscreenCanvas(
      contentPropsParam.canvasStyle.width,
      contentPropsParam.canvasStyle.height
    ) as OffscreenCanvas
    const contentProps = { ...contentPropsParam, canvas }

    // Compute card measurements
    // -------------------------

    const md = await getMarkdown(contentProps)
    const processedMd = await processMd(md)
    const measuredCards = getMeasuredCards(processedMd, contentProps)

    // Generate default textures
    // -------------------------

    const normal = await generateCardTexture({
      contentProps,
      style: {
        backgroundTextureSrc: '/paper-normal.jpg',
        backgroundTextureRepeat: [6, 0],
      },
    })

    // Generate card specific textures
    // -------------------------------

    const MAP_STYLES = {
      diffuse: {
        // TODO: background color not needed if using backgroundTexture, and backgroundTexture is more interesting, maybe remove backgroundColor?
        backgroundColor: '#080818',
        color: '#323232',
        opacity: 0.2,
        backgroundTextureSrc: '/diffuse.jpg',
      },
      specularColor: {
        // TODO: background color not needed if using backgroundTexture, and backgroundTexture is more interesting, maybe remove backgroundColor?
        backgroundColor: '#000000',
        color: '#ffffff',
        opacity: 1,
        backgroundTextureSrc: '/specularColor.jpg',
      },
    } as const

    const cards = await Promise.all(
      measuredCards.map(async (card) => {
        const textureEntries = await Promise.all(
          Object.entries(MAP_STYLES).map(async ([key, style]) => {
            const texture = await generateCardTexture({
              contentProps,
              contentKey: key,
              items: card.items,
              style,
            })
            return [key, texture]
          })
        )
        return { textureMap: Object.fromEntries(textureEntries) }
      })
    )

    return { cards, defaultTextureMap: { normal } }
  },
}

// Expose API
expose(api)
