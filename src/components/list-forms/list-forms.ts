import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import { decryptForm, signMessage } from '../../util/crypto'
import Store from '../../store'
import { Route } from '../router'
import { Form } from '../../form-format'

const {blockstack} = window as any

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

async function fetchSubmissions():Promise<Form[]> {
  const authorPubkey = blockstack.getPublicKeyFromPrivate( blockstack.loadUserData().appPrivateKey )

  const signature = signMessage('/get', blockstack.loadUserData().appPrivateKey)
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
      .map((cipherObj:any) => decryptForm(cipherObj))

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

  // test test
  sessionStorage.data && forms.length === 0 && forms.push(<Form>{
    created: new Date(),
    name: "The hard questions,",
    uuid: '123',
    },
    <Form>{
    created: new Date(),
    name: "Typeform tilfredshedsundersøgelse",
    uuid: '234',
  })

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

(window as any).fetchFromBench = async () => {
  const forms = await fetchSubmissions()
  Store.setFormsAction(forms)
}