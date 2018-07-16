import { signMessage } from "./crypto";

interface SignedHeader {
  'x-ctrl-key': string,
  'x-ctrl-signature': string
}

interface SignedHeaders {
  get: SignedHeader
  clean: SignedHeader
}

interface GenFunc {
  (privateKey: string, publicKey: string): SignedHeaders
}

let generateHeaders: GenFunc
generateHeaders = function (privateKey: string, publicKey: string) {
  return {
    get: {
      'x-ctrl-key': publicKey,
      'x-ctrl-signature': signMessage('get', privateKey)
    },
    clean: {
      'x-ctrl-key': publicKey,
      'x-ctrl-signature': signMessage('clean', privateKey)
    }
  }
}

export {generateHeaders, SignedHeaders}
