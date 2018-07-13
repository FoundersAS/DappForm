import { update as listUpdate } from './components/list-forms/list-forms'

type Dict = {[k: string]: any}
type RODict = Readonly<{[k: string]: Readonly<Dict>}>

export default class State {
  private static _state = <Dict>{
    forms: [],
  }

  static get state():Readonly<RODict> {
    return this._state
  }

  static addForms(value:Object[]) {
    for (let f of value) {
      this._state.forms.push(f)
    }
    listUpdate()
  }
}