import Bench from '../../util/bench'
import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import { Answer, Form, Submission, getForm, getPublishPath } from 'dappform-forms-api'
import Store from '../../store'
import { v4 as uuid } from 'uuid'

const blockstack = require('blockstack')

export async function update () {
  const el = document.querySelector('fill-form') as HTMLFormElement

  const url = new URL(location.toString())
  const author = url.searchParams.get('author')
  let formUuid:string = url.searchParams.get('form-id')
  const app = location.origin

  const submission:Submission = Store.store.routeParams.submission

  let form:Form

  if (author && formUuid) {
    const pathToPublicForm = await blockstack.getUserAppFileUrl(getPublishPath(formUuid), author, app)
    const res = await fetch(pathToPublicForm, {
      mode: 'cors'
    })
    if (res.status === 200) {
      const json = await res.json()
      form = json
    }
  }
  else if (submission) {
    formUuid = submission.formUuid
    form = await getForm(formUuid)
  }

  const questions = ((!form) ? [] : form.questions)
    .map(q => {
      let value:string = ''
      let inputTpl = html`<input type=${q.type} class="form-answer" data-question-uuid$="${q.uuid}" data-name$="${q.name}">`
      if (submission) {
        const answered = submission.answers.find(a => a.questionUuid === q.uuid)
        if (answered) {
          value = answered.value
        }
        inputTpl = html`
            <input disabled value="${value}"
             type=${q.type} class="form-answer">`
      }
    return html`
    <div class="cell medium-12">
      <label>${q.label}</label>
      ${inputTpl}
    </div>`
  })

  const submit = async (evt:Event) => {
    evt.preventDefault();
    (el.querySelector('[type="submit"]') as HTMLButtonElement).disabled = true

    const submission = collectAnswers()
    submission.formUuid = form.uuid

    const authorPubkey = form.authorPubKey
    const bench = new Bench('', authorPubkey)
    await bench.postFile(submission)

    el.querySelector('.confirmation-text').classList.remove('hide')
    el.querySelector('.into-text').classList.add('hide')
  }

  const tpl = html`
  <h2>${form.name}</h2>

  <div class="callout success confirmation-text hide">
      <h5 class="">${form.confirmationText || "Thanks!"}</h5>
  </div>
  <div class="callout primary into-text">
      <h5 class="">${form.introText}</h5>
  </div>

  <form class="grid-x grid-margin-y" on-submit="${(evt:any)=> submit(evt)}">
      ${questions}

      ${submission ? null :html`<div class="cell small-12">
          <button type="submit" class="button submit-button">Submit</button>
      </div>`}
  </form>
  `

  render(tpl, el)

  Array.from(document.querySelectorAll('input'))
    .filter((el:HTMLInputElement) => el.getAttribute('required') !== "required")
    .forEach((el:HTMLInputElement) => el.addEventListener('blur', () => el.setAttribute('required','required'))
  )
}

function collectAnswers () {
  const answers:Answer[] = Array.from(document.querySelectorAll('.form-answer'))
    .map((el:HTMLInputElement) => {
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
