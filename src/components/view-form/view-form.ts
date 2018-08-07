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

  const generateReport = async (form:Form) => {
    const postmarkFrom = (el.querySelector('[name="report-email"]') as HTMLInputElement).value
    const postmarkKey = (el.querySelector('[name="postmark-key"]') as HTMLInputElement).value
    const endpoint = new URL('https://wt-c0c4a39020d4e9619a8996325cdfa5dc-0.sandbox.auth0-extend.com/dapp-form-reporting')

    const body = {
      'blockstack': localStorage.getItem('blockstack'),
      'blockstack-gaia-hub-config': localStorage.getItem('blockstack-gaia-hub-config'),
      'blockstack-transit-private-key': localStorage.getItem('blockstack-transit-private-key'),
      'postmark-key': postmarkKey,
      'postmark-from': form.weeklyReportRecipient || postmarkFrom,
    }

    const res = await fetch(endpoint.toString(), <RequestInit>{
      mode: 'cors',
      method: "POST",
      body: JSON.stringify(body),
      headers: new Headers({
        "Content-Type": 'application/json',
      }),
    })
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
          <input placeholder="Email address" type="email" value="${form.weeklyReportRecipient || 'postmark2018@ragelse.dk'}" name="report-email">
          </label>
        </div>
      
        <div>
          <label>
              Postmark API key
              <input placeholder="Postmark API key" type="text" name="postmark-key" value="812c2d21-ae85-4923-ba95-8f433e4def73">
          </label>
        </div>
        
        <div>
          <button class="button hide" on-click="${(evt:Event) => handleAsyncButton(evt, toggleReporting(form))}" type="button">${(form as Form).weeklyReportRecipient ? 'Dis':'En'}able weekly report</button>
          <button class="button" on-click="${(evt:Event) => handleAsyncButton(evt, generateReport(form)) }" type="button">Build report now</button>
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