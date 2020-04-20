import * as React from 'react'
import { GetServerSideProps } from 'next'
import { Card, Container } from 'semantic-ui-react'

import marvelApi from '../lib/marvel-api'
import { Unpacked } from '../types/type-utils'

interface Props {
  comics: Unpacked<Unpacked<typeof marvelApi.getComics>>
}

export default class Home extends React.Component<Props> {
  render() {
    const cards = this.props.comics.data.results.map((item) => (
      <Card
        image={`${item.thumbnail.path}.${item.thumbnail.extension}`}
        header={item.title}
      />
    ))

    return (
      <Container>
        <Card.Group>{cards}</Card.Group>
      </Container>
    )
  }
}

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  console.log(JSON.stringify(await marvelApi.getComicDetails(82967)))
  return {
    props: {
      comics: await marvelApi.getComics()
    }
  }
}