import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import Store from '../../store'
import { Route } from '../router'
import { deleteForm, getForm, getFormSubmissions } from 'dappform-forms-api'
import BlockstackUtils from '../../util/blockstackUtils'
import { weeklyStats } from './weekly-stats'
import { getValue as getSettingsValue } from '../../settings'

export async function update () {
  const el = document.querySelector('forms-view')
  const uuid:string = Store.store.routeParams.formId
  const form = await getForm(uuid)
  console.debug("Viewing",form)
  const username = new BlockstackUtils().username

  const appOrigin = (sessionStorage.hostUrl) ? sessionStorage.hostUrl : getSettingsValue('hostingTaskUrl')
  const publicFormURL = new URL(appOrigin)
  publicFormURL.searchParams.append(`author`, username)
  publicFormURL.searchParams.append(`form-id`, uuid)
  publicFormURL.searchParams.append(`origin`, encodeURIComponent(location.origin))

  const submissions = await getFormSubmissions(uuid)
  const {lastWeek, total} = weeklyStats(Object.values(submissions))

  const copy = () => {
    const el = document.querySelector('[name="copy-url"]') as HTMLInputElement
    el.select()
    document.execCommand('copy')
    el.blur()
  }

  const tpl = html`
  <h3>Form dashboard <em>${form.name}</em></h3>
  <p><small>(uuid: ${uuid})</small>

  <div class="grid-x grid-margin-x">
    <div class="cell medium-6">
    <h4>Distribution</h4>
    <form class="grid-x grid-margin-y">     
      <div class="cell small-12">
        <div class="input-group">        
          <input class="input-group-field" readonly type="url" name="copy-url" value="${publicFormURL.toString()}">
          <div class="input-group-button">
            <button type="button" class="button" on-click="${() => copy()}">Copy</button>
          </div>
        </div>
      </div>
    </form>

        <p>
            <a href="${publicFormURL}" target="_blank" class="button large">Open</a>
            <a href="https://ipfs.io/ipfs/QmccqhJg5wm5kNjAP4k4HrYxoqaXUGNuotDUqfvYBx8jrR/qr#${publicFormURL.toString()}" target="_blank" class="button secondary large">QR code</a>
            <button on-click="${(evt: Event) => deleteForm(uuid)}" class="alert button large">Delete</button>
        </p>
    </div>

    <div class="cell medium-6">
      <h4>Responses</h4>

      <p><button class="clear button link" on-click="${() => Store.setRouteAction(Route.SubmissionsView, { formId: uuid }) }">View Submissions</button>

      <p>${lastWeek} submissions last week. Total ${total}.</p>
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
