import md5 from 'md5'

export default {
  getHash: (pubKey: string, privKey: string, timestamp: number) => {
    return md5(`${timestamp}${privKey}${pubKey}`)
  },
  getTimestamp: () => Date.now()
}