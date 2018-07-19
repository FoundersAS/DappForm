import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import Store from '../../store'
import { Route } from '../router'
import { getFormSubmissions, getForm } from '../../forms';

export async function update() {
  const el = document.querySelector('submissions-view')
  const uuid: string = Store.store.routeParams.formId

  const form = await getForm(uuid)
  const submissions = await getFormSubmissions(uuid)

  const columns = ['uuid', ...form.questions.map(q => q.label)]

  const tableHead = columns.map(c => html`<th>${c}</th>`)
  const tableRows = Object.keys(submissions)
    .map(uuid => { return { uuid, answers: submissions[uuid].answers } })
    .map(d => {
    return html`<tr><td>${uuid}</td>${d.answers.map(a => html`<td>${a.value}</td>`)}</tr>`
  })

  const table = html`
  <table>
    <thead>
      <tr>
        ${tableHead}
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
  `

  const tpl = html`
    <h3>Form Submissions</h3>
    <p><small><button class="clear button link" on-click="${() => Store.setRouteAction(Route.FormView, { formId: uuid })}">(uuid: ${uuid})</button></small></p>
    <div class="grid-x grid-margin-x">
      <div class="cell medium-12">
      ${table}
      </div>
    </div>
  `
  render(tpl, el)
}
