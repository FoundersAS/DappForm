import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import Store from '../../store'
import { Route } from '../router'
import { Form, deleteForm, getForm, getFormSubmissions, saveForm } from 'dappform-forms-api'
import BlockstackUtils from '../../util/blockstackUtils'
import { weeklyStats } from './weekly-stats'

export async function update () {
  const el = document.querySelector('forms-view')
  const uuid:string = Store.store.routeParams.formId
  const form = await getForm(uuid)

  const username = new BlockstackUtils().username

  const shareURL = new URL(location.origin)
  shareURL.searchParams.append(`author`, username)
  shareURL.searchParams.append(`form-id`, uuid)

  const submissions = await getFormSubmissions(uuid)
  const {lastWeek, total} = weeklyStats(Object.values(submissions))

  const toggleReporting = async (form:Form) => {
    if (form.weeklyReportRecipient) {
      delete form.weeklyReportRecipient
    }
    else {
      const email = (el.querySelector('input[name="report-email"]') as HTMLInputElement).value
      form.weeklyReportRecipient = email
    }
    await saveForm(form)
    update()
  }

  const tpl = html`
  <h3>Form dashboard <em>${form.name}</em></h3>
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
            <a href="https://ipfs.io/ipfs/QmccqhJg5wm5kNjAP4k4HrYxoqaXUGNuotDUqfvYBx8jrR/qr#${shareURL.toString()}" target="_blank" class="button secondary large">QR code</a>
            <button on-click="${(evt: Event) => deleteForm(uuid)}" class="alert button large">Delete</button>
        </p>
    </div>

    <div class="cell medium-6">
      <h4>Responses</h4>

      <p><button class="clear button link" on-click="${() => Store.setRouteAction(Route.SubmissionsView, { formId: uuid }) }">View Submissions</button>

      <p>${lastWeek} submissions last week. Total ${total}.</p>

      <div class="input-group">       
        <input class="input-group-field" placeholder="Email address" type="email" value="${form.weeklyReportRecipient || ''}" name="report-email">
        <div class="input-group-button">
          <button class="button" on-click="${() => toggleReporting(form)}">${(form as Form).weeklyReportRecipient ? 'dis':'en'}able weekly report</button>
        </div>
      </div>

    </div>

  </div>
  `
  render(tpl, el)
}
