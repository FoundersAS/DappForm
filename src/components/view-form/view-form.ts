import { render, html } from '../../../node_modules/lit-html/lib/lit-extended'
import Store from '../../store'
import { Form, Submission } from '../../form-format'
import { Route } from '../router'
import { decryptForm, signMessage } from '../../util/crypto'
const {blockstack} = window as any

async function fetchSubmissions():Promise<Submission[]> {
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
    console.debug(json)
    const decrypted = json
      .map((entry:any) => entry.data)
      .filter((cipherObj:any) => typeof cipherObj === "object")
      .filter((cipherObj:any) => !!cipherObj.cipherText)
      .filter((cipherObj:any) => Object.keys(cipherObj).length > 0)
      .map((cipherObj:any) => decryptForm(cipherObj))

    const failed = decrypted.filter((form:any) => !form)

    if (failed.length > 0) {
      console.info("Failed to decrypt:")
      console.info(failed)
    }

    const successfullyDecrypted = decrypted
      .filter((form:any) => !!form)
      .map((form:any) => JSON.parse(form))

    return successfullyDecrypted
  }
  throw new Error("Failed getting forms")
}

const submissions = <Submission[]>[]

export function update (fetch:boolean = true) {
  const el = document.querySelector('forms-view')
  const id = Store.store.routeParams.formId

  const username = blockstack.loadUserData().username

  const shareURL = new URL(location.origin)
  shareURL.searchParams.append(`author`, username)
  shareURL.searchParams.append(`form-id`, id)

  if (fetch) {
    fetchSubmissions().then(ss => {
      console.log(ss)
      ss.forEach(s => submissions.push(s))
      console.debug(submissions)
      update(false)
    })
  }

  const seeSubmissions = (formId: string, submissionId: string) => {
    Store.setRouteAction(Route.Fill, {submission: submissions.find(s => s.uuid === submissionId)})
  }

  const submissionsListTpl = submissions
    .map(submission => {
      return html`<div class="grid-x">
        <div class="cell auto">Submitted on ${submission.created}</div> 
        <div class="cell shrink">
          <button class="clear button link" on-click="${() => seeSubmissions(submission.formUuid, submission.uuid)}">View submission</button>
        </div>
    </div>`
    })

  console.debug(submissionsListTpl, submissions)

  const tpl = html`
    <h3>Form dashboard</h3>
    <p><small>(id: ${id})</small>

<div class="grid-x grid-margin-x">
  <div class="cell medium-6">
  <h4>Distribution</h4>
  <p>Share URL<br>
      <code>${shareURL.toString()}</code></p>
  </div>
  
  <div class="cell medium-6">
    <h4>Analytics</h4>
    <h5>Submissions (${submissionsListTpl.length})</h5>
    ${submissionsListTpl}
  </div>    
    
</div>    
`
  render(tpl, el)
}