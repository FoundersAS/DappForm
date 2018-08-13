const blockstack = require('blockstack')

export default class {
  username:string
  privateKey:string
  publicKey:string

  constructor() {
    if (blockstack.isUserSignedIn()) {
      const userData = blockstack.loadUserData()
      this.username = userData.username
      this.publicKey = blockstack.getPublicKeyFromPrivate(userData.appPrivateKey)
      this.privateKey = userData.appPrivateKey
    }
  }

  public static getBlockstackLocalStorage():Object {
    return {
      BLOCKSTACK: localStorage.getItem('blockstack'),
      BLOCKSTACK_GAIA_HUB_CONFIG: localStorage.getItem('blockstack-gaia-hub-config'),
      BLOCKSTACK_TRANSIT_PRIVATE_KEY: localStorage.getItem('blockstack-transit-private-key')
    }
  }
}
