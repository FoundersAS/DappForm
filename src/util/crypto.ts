import blockstackUtils from './blockstackUtils'
const EllipticCurve = require('elliptic').ec
const {encryptECIES, decryptECIES} = require('../../node_modules/blockstack/lib/encryption.js')

const ecurve = new EllipticCurve('secp256k1')

export type cipherObject = {
  iv: string
  ephemeralPK: string
  cipherText: string
  mac: string
  wasString: boolean
}

interface SignedString {
  r: Object,
  s: Object,
  toDER: () => number[]
}

export function signString(message: string, privateKey: string): SignedString {
  const keyFromPrivate = ecurve.keyFromPrivate(privateKey, 'hex')
  return keyFromPrivate.sign(message)
}

export function encryptFile (toKey:string, contents:Object): cipherObject {
  const jsonContents = JSON.stringify(contents)
  return encryptECIES(toKey, jsonContents)
}

export function decryptFileWithKey (privateKey: string, cipherObj:Object): Object {
  return JSON.parse(decryptECIES(privateKey, cipherObj))
}

export function decryptFile(cipherObj:Object): Object {
  const appPrivateKey = new blockstackUtils().privateKey
  return decryptFileWithKey(appPrivateKey, cipherObj)
}

export function decryptCipherObj(cipherObj:Object):Buffer {
  const appPrivateKey = new blockstackUtils().privateKey
  return decryptECIES(appPrivateKey, cipherObj)
}