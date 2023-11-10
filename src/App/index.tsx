import styled from 'styled-components'
import { Leva } from 'leva'
import GlobalStyle from 'styles/globalStyle'
import AppThree from 'AppThree'
import Editor from 'components/Editor'
import Error from 'components/Error'
import useApp from './useApp'
import { useCards } from 'hooks/useCards'
import { Loading } from 'AppThree/components/Loading'
import { Cards } from 'AppThree/components/Cards'

const Wrapper = styled.div`
  position: relative;
  user-select: none;
`

export default function App(props) {
  const { markdown, handleMarkdownChange, background, levaTheme } = useApp()

  const { cards, processing, errored } = useCards(markdown)
  const contentReady = !processing && !errored

  return (
    <>
      <GlobalStyle background={background} />

      <Wrapper {...props}>
        <AppThree>
          <Loading visible={processing} />
          <Cards visible={contentReady} cards={cards} />
        </AppThree>

        <Editor onChange={handleMarkdownChange} />
        {errored && <Error />}
      </Wrapper>

      {/* Debug tools */}
      <Leva collapsed flat theme={levaTheme} />
    </>
  )
}
