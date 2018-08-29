import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import { Form, getForms, getFormSubmissions, SubmissionMap } from 'dappform-forms-api'
import { Route } from '../router'
import Store from '../../store'
import { getFile } from '../../util/write'

export interface FormRow extends Partial<Form> {
  views?: number
  submissions?: number
  replyRatio?: number
}

type FormStats = {
  numViews: number
  numSubmissions: number
}

export async function init () {
  const forms: Partial<Form>[] = await getForms()

  // first render forms
  const rows = forms.filter(form => form.created && form.uuid && form.name)
    .map(form => {
      form.created = new Date(form.created)
      form.modified = new Date(form.modified)
      return form
    })
    .map(form => (<FormRow>{
      ...form,
    }))

    Promise.all(rows.map(form => Promise.all([getFormSubmissions(form.uuid), getFile(  `views/${form.uuid}.json`), form])))
      .then(maps => {
        const updatedRows = maps
          .map(([map, viewsObj, row]:[SubmissionMap, FormStats|false, FormRow]) => [map, viewsObj || <FormStats>{numViews: 0,}, row])
          .map(([map, viewsObj, row]:[SubmissionMap, FormStats, FormRow]) => {
            row.submissions = Object.values(map).length
            row.views = viewsObj.numViews
            row.replyRatio = (row.views > 0) ? Math.round( (row.submissions/row.views) * 10 ** 2 ) : 0
            return row
        })
        Store.setListViewAction(updatedRows)
        update()
      })
      .catch(err => console.error(err))


  Store.setListViewAction(rows)
  update()
}

export function update () {
  const {listView} = Store.store

  const tpl = html`
  <h3>Your forms (${listView.length})</h3>
  
  <!--headers-->
  <div class="grid-x grid-margin-y">
      <div class="cell small-4">
          <small>Name</small>
      </div>
      <div class="cell small-1">
          <small>Views</small>
      </div>
      <div class="cell small-2">
          <small>Submissions</small>
      </div>
      <div class="cell small-1">
          <small>Ratio</small>
      </div>
      <div class="cell small-2">
          <small>Created</small>
      </div>
      <div class="cell small-2 text-right">
          <small>Actions</small>
      </div>
  </div>
  <!--rows-->
  ${listView
    .sort((a, b) => a.created.getTime() - b.created.getTime())
    .map(form => html`
    <div class="grid-x grid-margin-y">
      <div class="cell medium-4 small-12" style="overflow: hidden;white-space: nowrap">
          ${form.name}
      </div>
      <div class="cell small-1 small-offset-4 hide-for-medium">      
          ${form.views}
      </div>
        <div class="cell small-1 hide-for-small-only">      
            ${form.views}
        </div>
      <div class="cell small-2">
          ${form.submissions}
      </div>
      <div class="cell small-1">
          ${form.replyRatio}%
      </div>
      <div class="cell small-2">
          ${formatDate(form.created)}
      </div>
      <div class="cell small-2 text-right">
          <button class="clear button link" on-click="${() => Store.setRouteAction(Route.FormView, {formId: form.uuid}) }">View</button>
      </div>
    </div>
    `)}
  `
  const el:HTMLElement = document.querySelector('forms-list')
  render(tpl, el)
}

function formatDate (date: Date | string):string {
  const d = new Date(date).toJSON()
  return d.substr(0, d.indexOf("T"))
}
