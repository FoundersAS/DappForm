const blockstack = require('blockstack')

const userData = blockstack.loadUserData()

export const blockstackUsername = userData.username
export const blockstackPublicKey = blockstack.getPublicKeyFromPrivate(userData.appPrivateKey)
export const blockstackPrivateKey = userData.appPrivateKey
