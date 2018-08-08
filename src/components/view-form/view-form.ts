import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import Store from '../../store'
import { Route } from '../router'
import { Form, deleteForm, getForm, getFormSubmissions, saveForm } from 'dappform-forms-api'
import BlockstackUtils from '../../util/blockstackUtils'
import { generateReport, weeklyStats } from './weekly-stats'

export async function update () {
  const el = document.querySelector('forms-view')
  const uuid:string = Store.store.routeParams.formId
  const form = await getForm(uuid)
  console.debug("Viewing",form)
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

  const generateReportHandler = (form:Form):Promise<void> => {
    const postmarkFrom = (el.querySelector('[name="report-email"]') as HTMLInputElement).value
    const postmarkKey = (el.querySelector('[name="postmark-key"]') as HTMLInputElement).value
    return generateReport(form, postmarkFrom, postmarkKey)
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

      <h5>Email reports</h5>
      <form>     
        <div>        
          <label>Recipient email
          <input placeholder="Email address" type="email" value="${form.weeklyReportRecipient}" name="report-email">
          </label>
        </div>
      
        <div>
          <label>
              Postmark API key
              <input placeholder="Postmark API key" type="text" name="postmark-key">
          </label>
        </div>
        
        <div>
          <button class="button hide" on-click="${(evt:Event) => handleAsyncButton(evt, toggleReporting(form))}" type="button">${(form as Form).weeklyReportRecipient ? 'Dis':'En'}able weekly report</button>
          <button class="button" on-click="${(evt:Event) => handleAsyncButton(evt, generateReportHandler(form)) }" type="button">Build report now</button>
        </div>
      </form>

    </div>

  </div>
  `
  render(tpl, el)
}

function handleAsyncButton(evt:Event, promise:Promise<any>) {
  const el = (evt.target) as HTMLButtonElement
  el.disabled = true
  promise.then(() => el.disabled = false)
}