import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import Store from '../../store'
import { Submission } from '../../form-format'
import { Route } from '../router'

import { deleteForm, getFormSubmissions } from '../../forms';

const blockstack = require('blockstack')

export async function update () {
  const submissions = <Submission[]>[]

  const el = document.querySelector('forms-view')
  const uuid:string = Store.store.routeParams.formId

  const username = blockstack.loadUserData().username

  const shareURL = new URL(location.origin)
  shareURL.searchParams.append(`author`, username)
  shareURL.searchParams.append(`form-id`, uuid)

  const submissionsToForm = await getFormSubmissions(uuid)
  Object.values(submissionsToForm).forEach(s => submissions.push(s as any))

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

  const tpl = html`
    <h3>Form dashboard</h3>
    <p><small>(uuid: ${uuid})</small>

<div class="grid-x grid-margin-x">
  <div class="cell medium-6">
  <h4>Distribution</h4>
  <form class="grid-x grid-margin-y">
    <div class="cell small-12">
      <label>Share URL
            <input value="${shareURL.toString()}" type="text">
      </label>
    </div>
  </form>
  
      <p>
          <a href="${shareURL}" target="_blank" class="button large">Open</a>
          <button on-click="${(evt: Event) => deleteForm(uuid)}" class="alert button large">Delete</button>
      </p>
  </div>

  <div class="cell medium-6">
    <h4>Analytics</h4>
    <h6>Submissions (${submissionsListTpl.length})</h6>
    ${submissionsListTpl}
  </div>

</div>
`
  render(tpl, el)
}
