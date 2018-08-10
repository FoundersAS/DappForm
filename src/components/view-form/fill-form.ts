import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import { Answer, Form, Submission, getForm, getPublishPath } from 'dappform-forms-api'
import Store from '../../store'
import { v4 as uuid } from 'uuid'
import { encryptFile } from '../../util/crypto'

const blockstack = require('blockstack')

export async function update () {
  const el = document.querySelector('fill-form') as HTMLFormElement

  const url = new URL(location.toString())
  const author = url.searchParams.get('author')
  let formUuid:string = url.searchParams.get('form-id')
  const appOrigin = decodeURIComponent(url.searchParams.get('origin'))
  console.debug("origin", appOrigin)

  const submission:Submission = Store.store.routeParams.submission

  let form:Form

  if (author && formUuid && appOrigin) {
    const pathToPublicForm = await blockstack.getUserAppFileUrl(getPublishPath(formUuid), author, appOrigin)
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


  const submit = async (evt:Event, form:Form) => {
    evt.preventDefault();
    (el.querySelector('[type="submit"]') as HTMLButtonElement).disabled = true

    const submission = <Submission>{
      answers: collectAnswers(),
      uuid: uuid(),
      created: new Date(),
      formUuid: form.uuid,
    }

    const url = form.submissionsUrl
    const encryptedFile = encryptFile(form.authorPubKey, JSON.stringify(submission))

    const res = await fetch(url, <RequestInit>{
      mode: 'cors',
      method: 'POST',
      body: JSON.stringify({
        data: encryptedFile
      }),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    })

    el.querySelector('.confirmation-text').classList.remove('hide')
    el.querySelector('.into-text').classList.add('hide')
  }

  const tpl = html`
  <h2>${form.name}</h2>

  <div class="callout success confirmation-text hide">
      <h5 class="">${form.confirmationText || "Thanks, we've recieved your answers!"}</h5>
  </div>
  <div class="callout primary into-text">
      <h5 class="">${form.introText}</h5>
  </div>

  <form class="grid-x grid-margin-y" on-submit="${(evt:Event) => submit(evt, form)}">
      ${questions}

      ${submission ? null : html`<div class="cell small-12">
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

function collectAnswers ():Answer[] {
  const answers:Answer[] = Array.from(document.querySelectorAll('.form-answer'))
    .map((el:HTMLInputElement) => {
    return <Answer>{
      value: el.value,
      name: el.getAttribute('data-name'),
      questionUuid: el.getAttribute('data-question-uuid'),
    }
  })

  return answers
}
