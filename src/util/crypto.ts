const EllipticCurve = require('elliptic').ec;
const ECPair = require('bitcoinjs-lib').ECPair;
const bigi = require('bigi');
const {encryptECIES, decryptECIES} = require('../../node_modules/blockstack/lib/encryption.js')
const {blockstack} = window as any

const ecurve = new EllipticCurve('secp256k1');

const privateKey = 'f761bc2af475651a307c8bee329b2bd61739da48315d923456f4dd4ec481452c';
const message = '/list';

const keyFromPrivate = ecurve.keyFromPrivate(privateKey, 'hex');
const signature = keyFromPrivate.sign(message);

const derSign = signature.toDER();

const keyPair = new ECPair(bigi.fromHex(privateKey));
const publicKey = keyPair.getPublicKeyBuffer().toString('hex')

const keyFromPublic = ecurve.keyFromPublic(publicKey, 'hex');

keyFromPublic.verify(message, derSign);
// JSON.stringify(derSign)

export function encryptForm (toKey:string, contents:Object) {
  const jsonContents = JSON.stringify(contents)
  const encryptedOjb = encryptECIES(toKey, jsonContents)
  return encryptedOjb
}

export function signMessage (message:string, privateKey:string) {
  const keyFromPrivate = ecurve.keyFromPrivate(privateKey, 'hex')
  const signature = keyFromPrivate.sign(message)
  return signature
}

export function decryptForm (cipherObj: Object): Object | undefined {
  if (!cipherObj) {
    return
  }
  const appPrivateKey = blockstack.loadUserData().appPrivateKey
  try {
    const decrypted = decryptECIES(appPrivateKey, cipherObj)
    return decrypted
  }
  catch (e) {
    console.warn(e)
  }
}

// export function verifySignedMessage (path:string, privateKey:string) {
//   const keyFromPrivate = ecurve.keyFromPrivate(privateKey, 'hex')
//   const signature = keyFromPrivate.sign(message)
//
//   keyFromPublic.verify(message, derSign);
//   console.log(derSign)
// }