import * as React from 'react'
import { GetServerSideProps } from 'next'
import Router from 'next/router'
import {
  Card,
  Container,
  Header,
  Button,
  Icon,
  Segment,
  Modal,
  Image,
  Input,
  Grid
} from 'semantic-ui-react'

import marvelApi from '../lib/marvel-api'
import { Unpacked } from '../types/type-utils'

type Comics = Unpacked<Unpacked<typeof marvelApi.getComics>>
type Comic = Unpacked<Comics['data']['results']>

interface Props {
  comics: Comics;
  page: number;
}

interface State {
  activeComic: Comic | null,

  loading: boolean
}

export default class Home extends React.Component<Props> {
  state: State = {
    activeComic: null,
    loading: false
  }

  cardClickHandler = (activeComic: Comic) => () => {
    this.setState({ activeComic })
  }

  nextPageHandler = () => {
    this.setState({ loading: true }, () => {
      Router.push(`/?page=${this.props.page + 1}`).then(() => window.scrollTo(0, 0))
    })
  }

  prevPageHandler = () => {
    this.setState({ loading: true }, () => {
      Router.push(`/?page=${this.props.page - 1}`).then(() => window.scrollTo(0, 0))
    })
  }

  render() {
    return (
      <>
        <Container>
          <Grid style={{ marginTop: '1em' }}>
            <Grid.Row columns={2}>
              <Grid.Column>
                <Header as="h1">Marvel Comics</Header>
              </Grid.Column>
              <Grid.Column>
                <Input placeholder='Search by Name' transparent/>
                <Input placeholder='Search by Date' transparent type="number"/>
                <Button><Icon name="search"/></Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <Card.Group>{this.renderCards()}</Card.Group>

          <Segment basic textAlign={"center"}>
            <Button
              animated
              onClick={this.prevPageHandler}
              disabled={this.props.page <= 1}
            >
              <Button.Content visible>Prev. Page</Button.Content>
              <Button.Content hidden>
                <Icon name='arrow left' />
              </Button.Content>
            </Button>

            <Button animated onClick={this.nextPageHandler}>
              <Button.Content visible>Next Page</Button.Content>
              <Button.Content hidden>
                <Icon name='arrow right' />
              </Button.Content>
            </Button>
          </Segment>
        </Container>

        {this.renderModal()}
      </>
    )
  }

  renderCards() {
    return this.props.comics.data.results.map((item) => (
      <Card
        image={`${item.thumbnail.path}.${item.thumbnail.extension}`}
        header={item.title}
        key={item.id}
        onClick={item.description ? this.cardClickHandler(item) : undefined}
      />
    ))
  }

  renderModal() {
    const comic = this.state.activeComic

    if (!comic) {
      return null
    }

    return (
      <Modal defaultOpen={true} onClose={() => this.setState({ activeComic: null })}>
        <Modal.Header>{comic.title}</Modal.Header>
        <Modal.Content image>
          <Image wrapped size='medium' src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`} />

          <Modal.Description>
            {comic.variantDescription && <Header>{comic.variantDescription}</Header>}
            <p>{comic.description}</p>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    )
  }
}

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const qPage = context.query.page || "1"
  const page = parseInt(Array.isArray(qPage) ? qPage[0] : qPage, 10)

  return {
    props: {
      comics: await marvelApi.getComics(page),
      page
    }
  }
}