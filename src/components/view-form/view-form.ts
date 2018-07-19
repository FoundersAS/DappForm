import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import Store from '../../store'
import { Submission } from '../../form-format'
import { Route } from '../router'
import { getFile } from '../../util/write';

const blockstack = require('blockstack')

export async function update () {
  const submissions = <Submission[]>[]

  const el = document.querySelector('forms-view')
  const id = Store.store.routeParams.formId

  const username = blockstack.loadUserData().username

  const shareURL = new URL(location.origin)
  shareURL.searchParams.append(`author`, username)
  shareURL.searchParams.append(`form-id`, id)

  const submissionsPath = `submissions/${id}.json`

  let submissionsToForm:Submission[] = await getFile(submissionsPath) as Submission[] || {}
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
    <p><small>(id: ${id})</small>

<div class="grid-x grid-margin-x">
  <div class="cell medium-6">
  <h4>Distribution</h4>
  <p>Share URL<br>
      <code>${shareURL.toString()}</code></p>
      <p><a href="${shareURL}" target="_blank" class="button large">Open</a></p>
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
