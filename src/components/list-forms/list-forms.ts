import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import Store from '../../store'
import { Route } from '../router'
import { Form } from '../../form-format'
import { getForms } from '../../forms';

export async function init () {
  update()// initial render

  const list = await getForms()

  const forms:Form[] = list
    .filter(form => form.created && form.uuid && form.name)
    .map(form => {
      form.created = new Date(form.created)
      form.modified = new Date(form.modified)
      return form
    }) as Form[] // now they're sanitized

  Store.setFormsAction(forms)
}

export function update () {
  const {forms} = Store.store

  const formsList:Form[] = forms

  const formsListTpl = formsList
    .sort((a, b) => a.created.getTime() - b.created.getTime())
    .map(form => html`
    <div class="grid-x">
      <div class="cell auto">
          ${form.name}
      </div>
      <div class="cell auto">
          ${form.created.toUTCString()}
      </div>
      <div class="cell shrink">
          <button class="clear button link" on-click="${() => Store.setRouteAction(Route.FormView, {formId: form.uuid}) }">View</button>
      </div>
    </div>
    `)

  const tpl = html`
  <h3>Your forms (${forms.length})</h3>
  ${formsListTpl}
  `
  const el:HTMLElement = document.querySelector('forms-list')
  render(tpl, el)
}
