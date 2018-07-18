import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import Store from '../../store'
import { Route } from '../router'
import { Form } from '../../form-format'

const blockstack = require('blockstack')

export async function create() {
  const authorPubkey = blockstack.getPublicKeyFromPrivate( blockstack.loadUserData().appPrivateKey )
  const body = {key: authorPubkey}
  const res1 = await fetch('https://bench.takectrl.io/create', {
    method: 'POST',
    body: JSON.stringify(body),
    mode: 'cors',
    headers: {
      'Content-Type': "application/json",
    }
  })
  if (res1.status === 409) {
    console.log("OK already created")
  }
}

const formsListRemoteFile = 'forms.json'

async function getList ():Promise<Partial<Form>[]> {
  let list = <Partial<Form>[]>[]
  try {
    const json = await blockstack.getFile(formsListRemoteFile)
    if (json) {
      list = JSON.parse(json)
    }
  }
  catch (e) {
    console.info('Problem getting list:')
    console.info(e)
  }
  return list
}

export async function init () {
  update()// initial render

  const list = await getList()

  const forms:Form[] = list
    .filter(form => form.created && form.uuid && form.name)
    .map(form => {
      form.created = new Date(form.created)
      form.modified = new Date(form.modified)
      form.questions = (form.questions instanceof Array) ? form.questions : []
      return form
    }) as Form[] // now they're sanitized

  console.debug("In:",list)
  console.debug("Valid:",forms)

  Store.setFormsAction(forms)
}

export function update () {
  const {forms} = Store.store

  const formsList:Form[] = forms as any // convert to view model

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
