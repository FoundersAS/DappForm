import { html, render } from '../../../node_modules/lit-html/src/lit-html'
import { decryptForm, signMessage } from '../../util/crypto'
import Store from '../../store'

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

export async function fetchForms():Promise<Array<Object>> {
  try {
    await create()
  }
  catch (e) {
    console.error('err creating', e)
  }
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
  console.debug(forms.func)
  const formsList = forms // convert to view model

  const tpl = html`<h3>List <button class="fetch-submissions" type="button">Fetch latest</button></h3>   
<pre>${JSON.stringify(formsList, null, 2)}</pre>
`
  render(tpl, document.querySelector('.forms-list'))

  document.querySelector('.fetch-submissions').addEventListener('click', async () => {
    const forms = await fetchForms()
    Store.setFormsAction(forms)
  })
}
