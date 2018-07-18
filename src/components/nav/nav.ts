import { Route } from '../router'
import Store from '../../store'
import { blockstackSignout } from '../login/login'
import { render, html } from '../../../node_modules/lit-html/lib/lit-extended'

export function update() {
  const nav = document.querySelector(`nav`)
  const route = Store.store.route

  const anon = html`
<div class="cell auto"></div>
<div class="cell shrink">
    <h5>Made with dapp form</h5>
</div>
`

  const normal = html`
        <div class="cell auto nav-item-list">
            <button class="clear button" on-click="${() => Store.setRouteAction(Route.FormsList)}">List forms</button>
            <button class="clear button" on-click="${() => Store.setRouteAction(Route.Build)}">Build form</button>
        </div>
        <div class="cell shrink">
            <button class="hollow button secondary button-signout" on-click="${() => blockstackSignout()}">Sign out</button>
        </div>
`

  const tpl = (location.toString().includes('form-id')) ? anon : normal
  render(tpl, nav)
}