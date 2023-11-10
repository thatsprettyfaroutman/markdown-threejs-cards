import styled from 'styled-components'

const Wrapper = styled.div`
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

export default function Error(props) {
  return (
    <Wrapper {...props}>
      Hmm, that didn't work. Your browser might not support webworkers 😿
    </Wrapper>
  )
}
