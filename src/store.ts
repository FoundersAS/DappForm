import { Form } from 'dappform-forms-api'
import { persist, Route, update as routeUpdate } from './components/router'
import { update as navUpdate } from './components/nav/nav'

interface Dict {[k: string]: any}

interface DefaultState extends Dict {
  forms: Partial<Form>[]
  route: Route
  routeParams: Dict
}

interface ReadonlyList<T> {
  readonly [n: number]: T
}

// interface ReadOnlyState extends DefaultState {
//   forms: ReadonlyList<Form[]>
// }

// a class for holding
export default class Store {
  static reducers:Map<Function, Set<Function>> = new Map()

  private static _store = <DefaultState> { // default state
    forms: <Partial<Form>>[],
    route: Route.Login,
    routeParams: <Dict>{},
  }

  static get store():Readonly<DefaultState> {
    return this._store
  }

  static callReducers(action:Function) {
    const reducers = Store.reducers.get(action)
    reducers.forEach(reducer => reducer(this.store))
  }

  // Actions

  static setFormsAction(value: Partial<Form>[]) {
    this._store.forms.length = 0
    for (let f of value) {
      this._store.forms.push(f)
    }
    Store.callReducers(Store.setFormsAction)
  }

  static setRouteAction(value:Route, routeParams:Object = {}) {
    this._store.route = value
    this._store.routeParams = routeParams
    Store.callReducers(Store.setRouteAction)
  }
}

// glue together actions and reducers
Store.reducers.set(Store.setFormsAction, new Set([
  (store:DefaultState) => (store.route === Route.FormsList),
]))

Store.reducers.set(Store.setRouteAction, new Set([
  routeUpdate,
  navUpdate,
  persist,
]))
