const blockstack = require('blockstack')
import { render, html } from '../../../node_modules/lit-html/lib/lit-extended'

export function update() {
  const el = document.querySelector('login')

  const login = (evt:Event) => {
    (evt.target as HTMLButtonElement).disabled = true
    blockStackSignin()
  }

  const tpl = html`
  <h1>Login</h1>
  <button on-click="${(evt:Event) => login(evt)}" type="button" class="login-button button large">Blockstack</button>
  `
  render(tpl, el)
}

export function blockStackSignin() {
  blockstack.redirectToSignIn(location.origin, location.origin + "/manifest.json", [
    'store_write',
    'publish_data',
  ])
}

export function blockstackSignout () {
  blockstack.signUserOut(location.origin)
}
