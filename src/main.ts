import Store from './store'
import { Route } from './components/router'

function main () {
  Store.setRouteAction( parseInt(sessionStorage.route, 10) || Route.Login )
}

// side effects
main()