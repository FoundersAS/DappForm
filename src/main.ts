const css = require('./css/style.css')

import {default as SubmissionWorker} from "worker-loader!./workers/submission.worker";
import Store from './store'
import { encryptFile } from './util/crypto'
import { Route } from './components/router'
import { blockstackSignout } from './components/login/login'

const blockstack = require('blockstack')

declare global {
  interface Window { ctrl: any; }
}

window.ctrl = window.ctrl || {};

window.ctrl.blockstack = blockstack

function main () {
  Store.setRouteAction( parseInt(sessionStorage.route, 10) || Route.Login )

  // nav
  document.querySelector('.nav-item-list').addEventListener('click', () => Store.setRouteAction(Route.FormsList))
  document.querySelector('.button-signout').addEventListener('click', () => blockstackSignout())

  fetchSubmissions()
}


function fetchSubmissions () {
  const submissionWorker = new SubmissionWorker()

  submissionWorker.onmessage = function (e: any) {
    console.log('message from worker: ', e.data)
  }

  const blockstackData = {
    blockstack: localStorage.getItem('blockstack'),
    gaia: localStorage.getItem('blockstack-gaia-hub-config'),
    key: localStorage.getItem('blockstack-transit-private-key')
  }

  submissionWorker.postMessage({
    cmd: 'start',
    blockstackData
  })
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
  const cipherObj = encryptFile(recipientPubKey, quickForm)
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
(window as any).upload = uploadEncrypt

async function uploadShare () {
  console.assert(blockstack.isUserSignedIn(), "User is not logged id")
  const authorPubkey = blockstack.getPublicKeyFromPrivate( blockstack.loadUserData().appPrivateKey )
  const recipientPubKey = '0304eb59f9d33acdc46825c160405b1154ccabfff226fb777e4ce5df4c8f8cacd4'

  const quickForm = {
    id: 43,
    name: "The real questions.",
    questions: [
      {label: "Do you like privacy?"},
    ],
    submissions: <Object[]>[],
  }

  // const signedPath = signMessage('/forms', blockstack.loadUserData().appPrivateKey)
  // await putFile(`forms/${quickForm.id}.json`, quickForm)
  await blockstack.putFile(`forms/${quickForm.id}.json`, JSON.stringify(quickForm), {encrypt: false})

  // Object.values(blockstack.loadUserData().profile.apps)[0]

  // lookupProfile
  // target to find: https://gaia.blockstack.org/hub/14ktrFjBTrQhmvZYdEgVZPEvceo6uKiyLZ/forms/43.json
  // where the hash is the app public address
  console.debug(`did put stuff`)
}
(window as any).share = uploadShare


// side effects
main()
