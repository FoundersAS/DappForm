import Store from '../store'
import { update as loginInit } from './login/login'
import { init as listInit } from './list-forms/list-forms'
import { update as viewFormInit } from './view-form/view-form'
import { update as fillInit } from './view-form/fill-form'
import { update as buildInit } from './builder/builder'

export enum Route {
  Login = 1,
  FormView,
  FormsList,
  Fill,
  Build,
}

const map = new Map<Route, string>([ // tuples of Route + HTML template
  [Route.Login, `<login></login>`],
  [Route.FormView, `<forms-view></forms-view>`],
  [Route.FormsList, `<forms-list></forms-list>`],
  [Route.Fill, `<fill-form></fill-form>`],
  [Route.Build, `<build-form></build-form>`],
])

const viewInitMap = new Map<Route, Function>([
  [Route.Login, loginInit],
  [Route.FormsList, listInit],
  [Route.FormView, viewFormInit],
  [Route.Fill, fillInit],
  [Route.Build, buildInit],
])

let lastRoute:number = -1

export function update () {
  const el = document.querySelector('router')
  console.assert(!!el)

  let currentRoute:Route = Store.store.route

  if (lastRoute !== currentRoute) {
    const tpl = map.get(currentRoute) || `View ${Route[currentRoute]} doesn't exist`
    el.innerHTML = tpl
    localStorage.debug && console.debug(lastRoute, '=>', currentRoute)
    const initFunc = viewInitMap.get(currentRoute)
    initFunc()
    lastRoute = currentRoute
  }
}

export function persist () {
  const route = Store.store.route
  if (route === Route.FormsList || route === Route.Build) {
    sessionStorage.route = Store.store.route
  }
}
