import * as t from 'io-ts'
import * as tPromise from 'io-ts-promise'
import axios from 'axios'
import NodeCache from 'node-cache'
import getConfig from 'next/config'
import marvelAuth from '../utils/marvel-auth'

const client = axios.create({
  timeout: 30000
})
const myCache = new NodeCache({ stdTTL: 360, checkperiod: 120, deleteOnExpire: true });
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()
const apikey = publicRuntimeConfig.marvelPubKey
const apiPrivKey = serverRuntimeConfig.marvelPrivKey

const ComicsResponse = t.interface({
  code: t.number,
  status: t.string,
  data: t.interface({
    offset: t.number,
    limit: t.number,
    total: t.number,
    count: t.number,
    results: t.array(t.interface({
      id: t.number,
      title: t.string,
      description: t.string,
      thumbnail: t.interface({
        path: t.string,
        extension: t.string
      })
    }))
  })
})
type ComicsResponse = t.TypeOf<typeof ComicsResponse>

export default {
  getComics: async () => {
    const url = 'http://gateway.marvel.com/v1/public/comics'
    const cachedData = myCache.get<ComicsResponse>(url)

    if (cachedData) {
      return cachedData
    }

    const ts = marvelAuth.getTimestamp()
    const hash = marvelAuth.getHash(apikey, apiPrivKey, ts)

    const res = await client.get(url, {
      params: {
        apikey,
        ts,
        hash
      }
    })
    const data = await tPromise.decode(ComicsResponse, res.data)

    myCache.set(url, data)

    return data
  },
  getComicDetails: async (id: number) => {
    const url = `http://marvel.com/comics/issue/82967/marvel_previews_2017?utm_campaign=apiRef&utm_source=32bae27493293783bce2ea6332e42618`
    const cachedData = myCache.get<ComicsResponse>(url);

    if (cachedData) {
      return cachedData;
    }

    const ts = marvelAuth.getTimestamp()
    const hash = marvelAuth.getHash(apikey, apiPrivKey, ts)

    const res = await client.get(url, {
      params: {
        apikey,
        ts,
        hash
      }
    });
    // const data = await tPromise.decode(ComicsResponse, res.data);
    const data = res.data

    myCache.set(url, data)

    return data;
  }
}