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
      description: t.union([t.string, t.null]),
      variantDescription: t.string,
      thumbnail: t.interface({
        path: t.string,
        extension: t.string
      })
    }))
  })
})
type ComicsResponse = t.TypeOf<typeof ComicsResponse>

export default {
  getComics: async (page = 1) => {
    const url = 'http://gateway.marvel.com/v1/public/comics'
    const cacheKey = `${url}::${page}`
    const cachedData = myCache.get<ComicsResponse>(cacheKey)

    if (cachedData) {
      return cachedData
    }

    const ts = marvelAuth.getTimestamp()
    const hash = marvelAuth.getHash(apikey, apiPrivKey, ts)
    const numItems = 21

    const res = await client.get(url, {
      params: {
        apikey,
        ts,
        hash,
        limit: numItems,
        offset: (page - 1) * numItems
      }
    })
    const data = await tPromise.decode(ComicsResponse, res.data)

    myCache.set(cacheKey, data)

    return data
  }
}