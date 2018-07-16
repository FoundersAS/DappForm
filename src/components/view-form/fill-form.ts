import { render, html } from '../../../node_modules/lit-html/src/lit-html'
const {blockstack} = window as any

export async function update () {
  const el = document.querySelector('fill-form')

  const url = new URL(location.toString())
  const author = url.searchParams.get('author')
  const formId = url.searchParams.get('form-id')
  const app = location.origin

  let form

  if (author && formId) {
    // const form = await see(formId, author)
    const pathToPublicForm = await blockstack.getUserAppFileUrl(`forms/${formId}.json`, author, app)
    const res = await fetch(pathToPublicForm, {
      mode: 'cors'
    })
    const json = await res.json()

    // make view model
    form = json
  }

  const tpl = html`
    <h3>Fill in form</h3>
    <pre>${form ? JSON.stringify(form, null, 2) : "Not found"}</pre>
`

  render(tpl, el)
}

// works for loggedin users
async function see(formID:string, username:string):Promise<Object> {
  const form = await blockstack.getFile(`forms/${formID}.json`, {
    app: location.origin,
    decrypt: false,
    username: username,
  })
  return form
}
