import { Route } from '../router'
import Store from '../../store'

const blockstack = require('blockstack')
import { render, html } from '../../../node_modules/lit-html/lib/lit-extended'

export function update() {
  if (blockstack.isUserSignedIn()) {
    Store.setRouteAction(Route.FormsList)
  }
  else if (blockstack.isSignInPending()) {
    blockstack.handlePendingSignIn()
    .then(() => {
      Store.setRouteAction(Route.FormsList)
    })
    .catch(console.warn)
  }

  const el = document.querySelector('login')

  const login = (evt:Event) => {
    (evt.target as HTMLButtonElement).disabled = true
    blockstack.redirectToSignIn(location.origin, location.origin + "/manifest.json", [
      'store_write',
      'publish_data',
    ])
  }

  const tpl = html`<h1>Login</h1>
    <button on-click="${(evt:Event) => login(evt)}" type="button" class="login-button button large">Blockstack</button>
`
  render(tpl, el)
}

export function blockstackSignout () {
  blockstack.signUserOut(location.origin)
}
