import { signMessage } from './util/sign-path'

const {blockstack} = window as any // hax
const encryption = require('../node_modules/blockstack/lib/encryption.js')

export async function putFile (path: string, contents: Object) {
  await blockstack.putFile(path, JSON.stringify(contents))
}

export async function putEncryptedFile (toKey:string, path:string, contents:Object) {
  const jsonContents = JSON.stringify(contents)
  const encryptedOjb = encryption.encryptECIES(toKey, jsonContents)
  console.debug(encryptedOjb)
  const jsonEncrypted = JSON.stringify(encryptedOjb)
  await putFileOnParkBench("tmp/test.txt", jsonEncrypted)
  console.debug("saved in park ",jsonEncrypted)
}

export async function putFileOnParkBench(path:string, contents:string) {

  const signedPath = signMessage('/forms', blockstack.loadUserData().appPrivateKey)

  sessionStorage[path] = JSON.stringify(contents)
}

export async function getFile (path: string) {
  const contents = await blockstack.getFile(path)
  return JSON.parse(contents)
}
