import Store from '../store'
import { update as loginInit } from './login/login'
import { init as listInit } from './list-forms/list-forms'
import { update as viewFormInit } from './view-form/view-form'

export enum Route {
  Login = 1,
  FormView,
  FormsList,
}

const map = new Map<Route, string>([ // tuples of Route + HTML template
  [Route.Login, `<login></login>`],
  [Route.FormView, `<forms-view></forms-view>`],
  [Route.FormsList, `<forms-list></forms-list>`],
])

const viewInitMap = new Map<Route, Function>([
  [Route.Login, loginInit],
  [Route.FormsList, listInit],
  [Route.FormView, viewFormInit],
])

let lastRoute:number = -1

export function update () {
  const el = document.querySelector('router')
  console.assert(!!el)

  const currentRoute:Route = Store.store.route as any

  if (lastRoute !== currentRoute) {
    const tpl = map.get(currentRoute) || `View ${Route[currentRoute]} doesn't exist`
    el.innerHTML = tpl
    console.log(lastRoute, '=>', currentRoute)
    const initFunc = viewInitMap.get(currentRoute)
    if (initFunc) {
      initFunc()
    }
    lastRoute = currentRoute
  }
}

export function persist () {
  if (Route[Store.store.route as any]) {
    sessionStorage.route = Store.store.route
  }
}
