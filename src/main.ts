import { loadSettings } from './settings'

const blockstack = require('blockstack')

import Store from './store'
import { Route } from './components/router'

function routeLoggedIn () {
  const savedRoute: number = parseInt(sessionStorage.route, 10)
  let savedRouteParams:any = sessionStorage.routeParams
  if (savedRouteParams) savedRouteParams = JSON.parse(savedRouteParams)
  const route: Route = (Route[savedRoute]) ? savedRoute : Route.FormsList
  Store.setRouteAction(route, savedRouteParams || {})

  loadSettings()
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

if (sessionStorage.debug) {
  (window as any).blockstack = blockstack
}

// side effects
main()
