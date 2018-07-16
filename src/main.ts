import Store from './store'
import { encryptForm } from './util/crypto'
import { Route } from './components/router'
import { blockstackSignout } from './components/login/login'

const {blockstack} = window as any

function main () {
  Store.setRouteAction( parseInt(sessionStorage.route, 10) || Route.Login )

  // nav
  document.querySelector('.nav-item-list').addEventListener('click', () => Store.setRouteAction(Route.FormsList))
  document.querySelector('.button-signout').addEventListener('click', () => blockstackSignout())
}

async function uploadEncrypt () {
  console.assert(blockstack.isUserSignedIn(), "User is not logged id")
  // const authorPubkey = blockstack.getPublicKeyFromPrivate( blockstack.loadUserData().appPrivateKey )
  const recipientPubKey = '0304eb59f9d33acdc46825c160405b1154ccabfff226fb777e4ce5df4c8f8cacd4'

  const quickForm = {
    id: 42,
    name: "The real questions.",
    questions: [
      {label: "Do you like privacy?"},
    ],
    submissions: <Object[]>[],
  }

  // const signedPath = signMessage('/forms', blockstack.loadUserData().appPrivateKey)
  const cipherObj = encryptForm(recipientPubKey, quickForm)
  const body = {
    data: cipherObj,
    key: recipientPubKey,
  }

  const res1 = await fetch('https://bench.takectrl.io/', {
    method: 'POST',
    body: JSON.stringify(body),
    mode: 'cors',
    headers: {
      'Content-Type': "application/json",
    }
  })
  if (res1.status !== 200) {
    throw new Error('failed upload')
  }
  console.debug(res1)
}
async function uploadShare () {
  console.assert(blockstack.isUserSignedIn(), "User is not logged id")
  // const authorPubkey = blockstack.getPublicKeyFromPrivate( blockstack.loadUserData().appPrivateKey )
  const recipientPubKey = '0304eb59f9d33acdc46825c160405b1154ccabfff226fb777e4ce5df4c8f8cacd4'

  const quickForm = {
    id: 42,
    name: "The real questions.",
    questions: [
      {label: "Do you like privacy?"},
    ],
    submissions: <Object[]>[],
  }

  // const signedPath = signMessage('/forms', blockstack.loadUserData().appPrivateKey)
  const cipherObj = encryptForm(recipientPubKey, quickForm)
  const body = {
    data: cipherObj,
    key: recipientPubKey,
  }

  const res1 = await fetch('https://bench.takectrl.io/', {
    method: 'POST',
    body: JSON.stringify(body),
    mode: 'cors',
    headers: {
      'Content-Type': "application/json",
    }
  })
  if (res1.status !== 200) {
    throw new Error('failed upload')
  }
  console.debug(res1)
}
(window as any).upload = uploadShare
// upload()

// side effects

main()