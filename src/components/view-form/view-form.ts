import { render, html } from '../../../node_modules/lit-html/src/lit-html'
import Store from '../../store'
const blockstack = require('blockstack')

export function update () {
  const el = document.querySelector('forms-view')
  const id = Store.store.routeParams.formId

  const username = blockstack.loadUserData().username

  const shareURL = new URL(location.origin)
  shareURL.searchParams.append(`author`, username)
  shareURL.searchParams.append(`form-id`, id)

  const tpl = html`
    <h3>View form</h3>
    <p>Share URL <br>
    <code>${shareURL}</code></p>
`
  render(tpl, el)
}
