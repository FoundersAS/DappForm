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
  // hax
  if (location.toString().includes('form-id')) {
    Store.setRouteAction( Route.Fill )
  }
  else {
    if (!blockstack.isUserSignedIn()) {
      Store.setRouteAction(Route.Login)
    }
    else {
      fetchSubmissions()
      const savedRoute:number = parseInt(sessionStorage.route, 10)
      const route:Route = (Route[savedRoute]) ? savedRoute : Route.FormsList
      Store.setRouteAction(route)
    }
  }
}

// side effects
main()
