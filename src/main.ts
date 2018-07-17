import Store from './store'
import { Route } from './components/router'
import { blockstackSignout } from './components/login/login'
import { create } from './components/list-forms/list-forms'

const {blockstack} = window as any

function main () {
  Store.setRouteAction( parseInt(sessionStorage.route, 10) || Route.Login )

  // nav
  const nav = document.querySelector(`nav`)
  nav.querySelector('.button-list').addEventListener('click', () => Store.setRouteAction(Route.FormsList))
  nav.querySelector('.button-signout').addEventListener('click', () => blockstackSignout())
  nav.querySelector('.button-build').addEventListener('click', () => Store.setRouteAction(Route.Build))
}




// side effects
main()