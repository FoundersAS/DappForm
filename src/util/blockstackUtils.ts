const blockstack = require('blockstack')

export default class {
  username:string
  privateKey:string
  publicKey:string

  constructor() {
    const userData = blockstack.loadUserData()
    this.username = userData.username
    this.publicKey = blockstack.getPublicKeyFromPrivate(userData.appPrivateKey)
    this.privateKey = userData.appPrivateKey
  }
}
