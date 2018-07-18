import {default as SubmissionWorker} from "worker-loader!./workers/submission.worker";
import Store from './store'
import { Route } from './components/router'
const blockstack = require('blockstack')

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

function routeLoggedIn () {
  fetchSubmissions()
  const savedRoute: number = parseInt(sessionStorage.route, 10)
  const route: Route = (Route[savedRoute]) ? savedRoute : Route.FormsList
  Store.setRouteAction(route)
}

function main () {
  // hax
  if (location.toString().includes('form-id')) {
    Store.setRouteAction( Route.Fill )
  }
  else if (blockstack.isUserSignedIn()) {
    routeLoggedIn()
  }
  else if (blockstack.isSignInPending()) {
    blockstack.handlePendingSignIn()
      .then(routeLoggedIn)
      .catch(console.warn)
  }
  else {
    Store.setRouteAction(Route.Login)
  }
}

// side effects
main()
