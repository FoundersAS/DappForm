const EllipticCurve = require('elliptic').ec
const {encryptECIES, decryptECIES} = require('../../node_modules/blockstack/lib/encryption.js')
const blockstack = require('blockstack')

const ecurve = new EllipticCurve('secp256k1')

interface SignedString {
  r: Object,
  s: Object,
  toDER: () => number[]
}

export function signString(message: string, privateKey: string): SignedString {
  const keyFromPrivate = ecurve.keyFromPrivate(privateKey, 'hex')
  return keyFromPrivate.sign(message)
}

export function encryptFile (toKey:string, contents:Object): Object {
  const jsonContents = JSON.stringify(contents)
  return encryptECIES(toKey, jsonContents)
}

export function decryptFileWithKey (privateKey: string, cipherObj:Object): Object{
  return JSON.parse(decryptECIES(privateKey, cipherObj))
}

export function decryptFile(cipherObj:Object): Object {
  const appPrivateKey = blockstack.loadUserData().appPrivateKey
  return decryptFileWithKey(appPrivateKey, cipherObj)
}
