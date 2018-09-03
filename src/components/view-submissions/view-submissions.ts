import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import Store from '../../store'
import { Route } from '../router'
import { getForm, getFormSubmissions } from 'dappform-forms-api'
import { getAnyFile } from '../../util/write'

const extMimeMap = new Map([
  ['txt',  'text/plain'],
  ['csv',  'text/csv'],
  ['jpeg', 'image/jpeg'],
  ['jpg',  'image/jpeg'],
  ['png',  'image/png'],
  ['js',   'application/javascript'],
  ['xml',  'application/xml'],
  ['xls',  'application/vnd.ms-excel'],
])

async function getDataUrl (url:string):Promise<string> {
  const ext = url.substr( url.lastIndexOf(".")+1 )
  const path = url.substr(url.indexOf('files/'))
  let buffer:any = await getAnyFile(path)
  if (!buffer) return url
  const blob = new Blob([buffer], {type: extMimeMap.get(ext)})
  const file = new File([blob], `attachment`, {type: extMimeMap.get(ext)})
  return URL.createObjectURL(file)
}

async function download (fileLink:string) {
  const objUrl = await getDataUrl(fileLink)
  window.open(objUrl, "_blank")
}

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
    return html`<tr><td>${uuid}</td>${d.answers.map(a => {
      if (typeof a.value === 'string' && a.value.indexOf('http') === 0 && a.value.includes('gaia')) {
        return html`<td><button class="button link clear small" on-click="${() => download(a.value)}">Download</button></td>`
      }
      return html`<td>${a.value}</td>`
    })
    }</tr>`
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
