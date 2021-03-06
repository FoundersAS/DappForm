import Store from '../store'
import { update as loginInit } from './login/login'
import { update as viewFormInit } from './view-form/view-form'
import { init as listFormsInit } from './list-forms/list-forms'
import { init as buildInit } from './builder/builder'
import { update as viewSubmissionInit } from './view-submissions/view-submissions'
import { update as settingsViewInit } from './settings/settings'

export enum Route {
  Login = 1,
  FormView,
  FormsList,
  Build,
  SubmissionsView,
  SettingsView
}

const map = new Map<Route, string>([ // tuples of Route + HTML template
  [Route.Login, `<login></login>`],
  [Route.FormView, `<forms-view></forms-view>`],
  [Route.FormsList, `<forms-list></forms-list>`],
  [Route.Build, `<build-form></build-form>`],
  [Route.SubmissionsView, `<submissions-view></submissions-view>`],
  [Route.SettingsView, `<settings-view></settings-view>`]
])

const viewInitMap = new Map<Route, Function>([
  [Route.Login, loginInit],
  [Route.FormView, viewFormInit],
  [Route.FormsList, listFormsInit],
  [Route.Build, buildInit],
  [Route.SubmissionsView, viewSubmissionInit],
  [Route.SettingsView, settingsViewInit],
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
  sessionStorage.route = Store.store.route
  sessionStorage.routeParams = JSON.stringify(Store.store.routeParams)
}
