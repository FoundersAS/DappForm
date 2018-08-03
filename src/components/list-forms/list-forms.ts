import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import { Form, getForms } from 'dappform-forms-api'
import { Route } from '../router'
import Store from '../../store'

export async function init () {
  update()// initial render
  // console.log(Route.FormsList)
  const forms: Partial<Form>[] = await getForms()

  forms.filter(form => form.created && form.uuid && form.name)
    .map(form => {
      form.created = new Date(form.created)
      form.modified = new Date(form.modified)
      return form
    }) as Partial<Form>[] // now they're sanitized

  Store.setFormsAction(forms)
}

export function update () {
  const {forms} = Store.store

  const formsList: Partial<Form>[] = forms

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
          <button class="clear button link" on-click="${() => Store.setRouteAction(2, {formId: form.uuid}) }">View</button>
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
