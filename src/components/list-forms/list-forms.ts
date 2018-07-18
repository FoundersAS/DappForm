import { html, render } from '../../../node_modules/lit-html/src/lit-html'
import { decryptFile, signString } from '../../util/crypto'
import Store from '../../store'
import { Route } from '../router'

const blockstack = require('blockstack')

export async function fetchForms():Promise<Array<Object>> {
  const authorPubkey = blockstack.getPublicKeyFromPrivate( blockstack.loadUserData().appPrivateKey )

  const signature = signString('/get', blockstack.loadUserData().appPrivateKey)
  const derSign = signature.toDER();
  const sigHeader = JSON.stringify(derSign)

  const res = await fetch('https://bench.takectrl.io/get', {
    mode: 'cors',
    headers: {
      'x-ctrl-key': authorPubkey,
      'x-ctrl-signature': sigHeader,
    }
  })
  if (res.status === 200) {
    const json = await res.json()

    const decrypted = json
      .map((entry:any) => entry.data)
      .filter((cipherObj:any) => typeof cipherObj === "object")
      .filter((cipherObj:any) => !!cipherObj.cipherText)
      .filter((cipherObj:any) => Object.keys(cipherObj).length > 0)
      .map((cipherObj:any) => decryptFile(cipherObj))

    const failed = decrypted.filter((form:any) => !form)

    console.info("Failed:")
    console.info(failed)

    const successfullyDecrypted = decrypted
      .filter((form:any) => !!form)
      .map((form:any) => JSON.parse(form))
    return successfullyDecrypted
  }
  throw new Error("Failed getting forms")
}

export function update () {
  const {forms} = Store.store

  const formsList = forms // convert to view model
  const tpl = html`
<h3>Forms</h3>
<button class="fetch-submissions button" type="button">Fetch latest</button>
<div>
    ${formsList.map((form:any) => html`<pre>${JSON.stringify(form, null, 2)}</pre>
    <button data-form-id="${form.id}" class="clear button">View</button>`)}
</div>
`
  const el:HTMLElement = document.querySelector('forms-list')
  render(tpl, el)

  addEventListeners()
}

export function init () {
  update()
}

const clickHandlers = new WeakSet()

function addEventListeners () {
  const fetchBtn = document.querySelector('.fetch-submissions')
  if (!clickHandlers.has(fetchBtn)) {
    clickHandlers.add(fetchBtn)
    document.querySelector('.fetch-submissions').addEventListener('click', async () => {
      const forms = await fetchForms()
      Store.setFormsAction(forms)
    })
  }

  Array.from(document.querySelectorAll('button[data-form-id]')).forEach((btn:HTMLElement) => {
    if (clickHandlers.has(btn)) return
    clickHandlers.add(btn)
    btn.addEventListener('click',
    evt =>
      Store.setRouteAction(Route.FormView, {formId: (evt.target as HTMLElement).getAttribute('data-form-id')})
    )
  })
}

type Component = {
  init: Function,
  update: Function
}
