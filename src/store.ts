import { update as listUpdate } from './components/list-forms/list-forms'
import { persist, Route, update as routeUpdate } from './components/router'
const {blockstack} = window as any
type Dict = {[k: string]: any}
type RODict = Readonly<{[k: string]: Readonly<Dict>}>

// a class for holding
export default class Store {

  static reducers:Map<Function, Set<Function>> = new Map()

  private static _store = <Dict>{ // default state
    forms: [],
    route: Route.Login,
  }

  static get store():Readonly<RODict> {
    return this._store
  }

  static callReducers(action:Function) {
    const reducers = Store.reducers.get(action)
    reducers.forEach(reducer => reducer(this.store))
  }

  // Actions

  static setFormsAction(value:Object[]) {
    this._store.forms.length = 0
    for (let f of value) {
      this._store.forms.push(f)
    }
    Store.callReducers(Store.setFormsAction)
  }

  static setRouteAction(value:Route, routeParams:Object = {}) {
    if (!blockstack.isUserSignedIn()) { // simple redirect if user not logged in
      value = Route.Login
    }
    this._store.route = value
    this._store.routeParams = routeParams
    Store.callReducers(Store.setRouteAction)
  }
}

// glue together actions and reducers
Store.reducers.set(Store.setFormsAction, new Set([
  listUpdate,
]))

Store.reducers.set(Store.setRouteAction, new Set([
  routeUpdate,
  persist,
]))