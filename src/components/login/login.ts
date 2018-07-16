import { Route } from '../router'
import Store from '../../store'
import { render, html } from '../../../node_modules/lit-html/src/lit-html'
const {blockstack} = window as any

const clickHandlers = new WeakSet<Element>()

export function update() {
  const el = document.querySelector('login')

  const tpl = html`<h1>Login</h1>
    <button type="button" class="login-button button">Blockstack</button>
`
  render(tpl, el)

  if (!clickHandlers.has(el)) {
    document.querySelector('.login-button').addEventListener('click', (evt) => {
      (evt.target as HTMLButtonElement).disabled = true
      blockstackLogin();
    })
  }

}

export function blockstackSignout () {
  blockstack.signUserOut(location.origin)
}

function blockstackLogin () {
  if (blockstack.isUserSignedIn()) {
    // const userData = blockstack.loadUserData()
    // const user = new blockstack.Person(this.userData.profile)
    // const user.username = this.userData.username
    Store.setRouteAction(Route.FormsList)
  }
  else if (blockstack.isSignInPending()) {
    blockstack.handlePendingSignIn()
      .then(() => {
        Store.setRouteAction(Route.FormsList)
      })
      .catch(console.warn)
  }
  else {
    blockstack.redirectToSignIn(location.origin, location.origin + "/manifest.json", [
      'store_write',
      'publish_data',
    ])
  }
}

