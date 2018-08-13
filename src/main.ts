import { loadSettings } from './settings'

const blockstack = require('blockstack')

import Store from './store'
import { Route } from './components/router'

async function routeLoggedIn () {
  const savedRoute: number = parseInt(sessionStorage.route, 10)
  let savedRouteParams:any = sessionStorage.routeParams
  if (savedRouteParams) savedRouteParams = JSON.parse(savedRouteParams)
  const route: Route = (Route[savedRoute]) ? savedRoute : Route.FormsList

  await loadSettings()
  Store.setRouteAction(route, savedRouteParams || {})
}

function main () {
  // hax
  if (blockstack.isUserSignedIn()) {
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

if (sessionStorage.debug) {
  (window as any).blockstack = blockstack
}

// side effects
main()
