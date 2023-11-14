import styled from 'styled-components'

type TCvLinkProps = {}

const Wrapper = styled.div`
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  text-align: center;
  color: #fff;
  font-size: 1rem;

  > a {
    color: #e0c1c6;
  }
`

export default function CvLink(props: TCvLinkProps) {
  return (
    <Wrapper {...props}>
      Made by <a href="https://read.cv/viljami">Viljami</a>
    </Wrapper>
  )
}
