const EllipticCurve = require('elliptic').ec;
const ECPair = require('bitcoinjs-lib').ECPair;
const bigi = require('bigi');

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

export function signMessage (message:string, privateKey:string) {
  const keyFromPrivate = ecurve.keyFromPrivate(privateKey, 'hex')
  const signature = keyFromPrivate.sign(message)
  return signature
}

// export function verifySignedMessage (path:string, privateKey:string) {
//   const keyFromPrivate = ecurve.keyFromPrivate(privateKey, 'hex')
//   const signature = keyFromPrivate.sign(message)
//
//   keyFromPublic.verify(message, derSign);
//   console.log(derSign)
// }