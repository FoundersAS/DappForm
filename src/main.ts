const blockstack = require('blockstack')

import {default as SubmissionWorker} from "worker-loader!./workers/submission.worker";
import Store from './store'
import { Route } from './components/router'
import { getBlockstackData } from "./util/fakeLocalStorage";

function initSubmissionFetching() {
  const submissionWorker = new SubmissionWorker()

  submissionWorker.onmessage = function (e: any) {
    // TODO: Handle event to reload in view
    console.log('message from worker: ', e.data)
  }

  submissionWorker.postMessage({
    cmd: 'start',
    blockstackData: getBlockstackData(localStorage)
  })
}

function routeLoggedIn () {
  initSubmissionFetching()

  const savedRoute: number = parseInt(sessionStorage.route, 10)
  let savedRouteParams:any = sessionStorage.routeParams
  if (savedRouteParams) savedRouteParams = JSON.parse(savedRouteParams)

  const route: Route = (Route[savedRoute]) ? savedRoute : Route.FormsList
  Store.setRouteAction(route, savedRouteParams || {})
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
