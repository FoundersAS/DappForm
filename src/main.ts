const css = require('./css/style.css')

import {default as SubmissionWorker} from "worker-loader!./workers/submission.worker";
import Store from './store'
import { Route } from './components/router'

const blockstack = require('blockstack')

declare global {
  interface Window { ctrl: any; }
}

window.ctrl = window.ctrl || {};
window.ctrl.blockstack = blockstack

function fetchSubmissions() {
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

function main () {
  Store.setRouteAction( parseInt(sessionStorage.route, 10) || Route.Login )

  if (blockstack.isUserSignedIn()) fetchSubmissions()
}

// side effects
main()
