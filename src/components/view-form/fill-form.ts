import { render, html } from '../../../node_modules/lit-html/lib/lit-extended'
import { Answer, Form, Submission } from '../../form-format'
import Store from '../../store'
const {blockstack} = window as any
const uuidv4 = require('../../../node_modules/uuid/v4')

export async function update () {
  const el = document.querySelector('fill-form')

  const url = new URL(location.toString())
  const author = url.searchParams.get('author')
  const formId = url.searchParams.get('form-id')
  const app = location.origin

  const submission:Submission = Store.store.routeParams.submission

  let form:Form

  if (author && formId) {
    const pathToPublicForm = await blockstack.getUserAppFileUrl(`forms/${formId}.json`, author, app)
    const res = await fetch(pathToPublicForm, {
      mode: 'cors'
    })
    const json = await res.json()

    // make view model
    form = json
  }

  // form = <Form>{
  //   uuid: uuidv4(),
  //   name: 'A safe survey',
  //   created: new Date(),
  //   modified: new Date(),
  //   introText: 'The tough questions',
  //   confirmationText: 'Thanks a bunch!',
  //   questions: [{
  //       uuid: uuidv4(),
  //       name: 'Do you trust typeform now?',
  //       label: 'Do you trust typeform now?',
  //       type: 'text',
  //     },
  //     {
  //       uuid: uuidv4(),
  //       name: 'Ok how about now?',
  //       label: 'Ok how about now?',
  //       type: 'text',
  //     }
  //   ],
  // }

  const collectAnswers = () => {
    const answers:Answer[] = Array.from(document.querySelectorAll('.form-answer')).map((el:HTMLInputElement) => {
      return <Answer>{
        value: el.value,
        name: el.getAttribute('data-name'),
      }
    })

    const submission = <Submission>{
      uuid: uuidv4(),
      formUuid: form.uuid,
      created: new Date(),
      answers,
    }
    console.debug('submit', submission)
  }

  const questions = ((!form) ? [] : form.questions).map(q => {
    return html`
<div class="cell medium-12">
    <label>${q.label}</label>
    <input type=${q.type} class="form-answer" data-name="${q.name}" value="">
</div>`
  })

  const tpl = html`
<h2>${form.name}</h2>    
<h6>${form.introText}</h6>    
<form class="grid-x grid-margin-y">
    ${questions}
    
    <div class="cell small-12">
        <button type="button" class="button submit-button" on-click="${()=>collectAnswers()}">Submit</button>
    </div>
</form>
`

  render(tpl, el)
}
