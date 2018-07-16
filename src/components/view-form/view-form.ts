import { render, html } from '../../../node_modules/lit-html/src/lit-html'
import Store from '../../store'

export function update () {
  const el = document.querySelector('forms-view')
  const id = Store.store.routeParams.formId

  const tpl = html`
<h3>View form ${id}</h3>
`
  render(tpl, el)
  console.debug(el)
}
