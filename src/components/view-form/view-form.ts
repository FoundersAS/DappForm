import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import Store from '../../store'
import { Route } from '../router'
import { deleteForm, getFormSubmissions } from '../../forms';
import { blockstackUsername } from '../../util/blockstack';

export async function update () {
  const el = document.querySelector('forms-view')
  const uuid:string = Store.store.routeParams.formId

  const username = blockstackUsername

  const shareURL = new URL(location.origin)
  shareURL.searchParams.append(`author`, username)
  shareURL.searchParams.append(`form-id`, uuid)

  const submissions = await getFormSubmissions(uuid)

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
            <a href="https://ipfs.io/ipfs/QmccqhJg5wm5kNjAP4k4HrYxoqaXUGNuotDUqfvYBx8jrR/qr#${shareURL.toString()}" target="_blank" class="button secondary large">QR code</a>
            <button on-click="${(evt: Event) => deleteForm(uuid)}" class="alert button large">Delete</button>
        </p>
    </div>

    <div class="cell medium-6">
      <h4>Analytics</h4>
      <h6>Submissions (${Object.keys(submissions).length})</h6>
      <button class="clear button link" on-click="${() => Store.setRouteAction(Route.SubmissionsView, { formId: uuid }) }">View Submissions</button>
    </div>

  </div>
  `
  render(tpl, el)
}
