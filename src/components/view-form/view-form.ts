import { render, html } from '../../../node_modules/lit-html/src/lit-html'

export function update () {
  const el = document.querySelector('.forms-view')
  const id = el.getAttribute('form-id')

  const formView = {id}

  const tpl = html`<h3>View form ${id}</h3>
<pre>${JSON.stringify(formView,null,2)}</pre>
`
  render(tpl, el)
}

async function check () {

}

setInterval(check, 10000)