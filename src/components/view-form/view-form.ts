import { render, html } from '../../../node_modules/lit-html/lib/lit-extended'
import Store from '../../store'
import { Submission } from '../../form-format'
import { Route } from '../router'
const {blockstack} = window as any

export function update () {
  const el = document.querySelector('forms-view')
  const id = Store.store.routeParams.formId

  const username = blockstack.loadUserData().username

  const shareURL = new URL(location.origin)
  shareURL.searchParams.append(`author`, username)
  shareURL.searchParams.append(`form-id`, id)

  const submissions = <Submission[]>[{
    formUuid: `123`,
    uuid: `123`,
    created: new Date(),
    answers: [{}, {}]
  }]

  const goToForm = (formId: string, submissionId: string) => {
    Store.setRouteAction(Route.Fill, {formId: formId, submission: submissions.find(s => s.uuid === submissionId)})
  }

  const submissionsListTpl = submissions
    .sort(((a, b) => a.created.getTime() - b.created.getTime()))
    .map(submission => {
      return html`<div class="grid-x">
        <div class="cell auto">Submitted on ${submission.created.toDateString()}</div> 
        <div class="cell shrink">
          <button class="clear button link" on-click="${() => goToForm(submission.formUuid, submission.uuid)}">View submission</button>
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