import Bench from '../../util/bench'
import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import { Answer, Form, Submission } from '../../form-format'
import Store from '../../store'
import { v4 as uuid } from 'uuid'

const blockstack = require('blockstack')

export async function update () {
  const el = document.querySelector('fill-form')

  const url = new URL(location.toString())
  const author = url.searchParams.get('author')
  const formId = url.searchParams.get('form-id')
  const app = location.origin

  const submission:Submission = Store.store.routeParams.submission

  let form:Form

  if (author && formId) {
    const pathToPublicForm = await blockstack.getUserAppFileUrl(`published/${formId}.json`, author, app)
    const res = await fetch(pathToPublicForm, {
      mode: 'cors'
    })
    if (res.status === 200) {
      const json = await res.json()
      form = json
    }
  }
  else if (submission) {
    form = Store.store.forms.find((f:any) => f.uuid === submission.formUuid)
  }

  const questions = ((!form) ? [] : form.questions).map(q => {
    return html`
<div class="cell medium-12">
    <label>${q.label}</label>
    <input type=${q.type} class="form-answer" data-question-uuid="${q.uuid}" data-name="${q.name}" value="">
</div>`
  })

  const submit = async (evt:Event) => {
    (evt.target as HTMLButtonElement).disabled = true
    const submission = collectAnswers()
    submission.formUuid = form.uuid
    const authorPubkey = blockstack.getPublicKeyFromPrivate( blockstack.loadUserData().appPrivateKey ) // be visible to me self!! YArrrrg
    const bench = new Bench('', authorPubkey)
    await bench.postFile(submission)
  }

  const tpl = html`
<h2>${form.name}</h2>
<h6>${form.introText}</h6>
<form class="grid-x grid-margin-y">
    ${questions}

    <div class="cell small-12">
        <button type="button" class="button submit-button" on-click="${(evt:any)=>submit(evt)}">Submit</button>
    </div>
</form>

<p>Submissions:</p>
<pre>${JSON.stringify(submission,null,2)}</pre>
`

  render(tpl, el)

  if (submission) {
    // fill out
  }
}

function collectAnswers () {
  const answers:Answer[] = Array.from(document.querySelectorAll('.form-answer')).map((el:HTMLInputElement) => {
    return <Answer>{
      value: el.value,
      name: el.getAttribute('data-name'),
      questionUuid: el.getAttribute('data-question-uuid'),
    }
  })

  const submission = <Submission>{
    uuid: uuid(),
    created: new Date(),
    answers,
  }

  return submission
}
