import { render, html } from '../../../node_modules/lit-html/src/lit-html'
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

  const submissions = <Submission[]>[]
  const submissionsTpl = submissions.map(s => {
    return html`<div>Submitted on ${s.created} 
        <button class="clear button" data-form-id="${s.formUuid}" data-submission-id="${s.uuid}">View submission</button>
    </div>`
  })

  const tpl = html`
    <h4>Form dashboard</h4>
    <p><small>(id: ${id})</small>
    <br></p>
    
    <p>Share URL <br>
    <code>${shareURL}</code></p>
    
    <h4>Submissions (0)</h4>
    <div>${submissionsTpl}</div>
`
  render(tpl, el)

  el.addEventListener('click', evt => {
    const formId = (evt.target as HTMLElement).getAttribute('data-form-id')
    const submissionId = (evt.target as HTMLElement).getAttribute('data-submission-id')
    Store.setRouteAction(Route.Fill, {formId: formId, submission: submissions.find(s => s.uuid === submissionId)})
  })
}