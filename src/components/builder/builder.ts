import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import { createForm, Form, getForm, Question } from 'dappform-forms-api'
import Store from '../../store'
import { Route } from '../router'

import { v4 as uuid } from 'uuid'

import BlockstackUtils from '../../util/blockstackUtils'
import * as settings from '../../settings'

const questions = <Question[]>[]

export function init () {
  questions.length = 0
  update()

  const templateFrom:string = Store.store.routeParams.formToCopy
  if (templateFrom) {
    applyTemplate(templateFrom)
  }
}

async function applyTemplate (formUuid:string) {
  const form = await getForm(formUuid);

  (document.querySelector('[name=form-name]') as HTMLInputElement).value = form.name || '';
  (document.querySelector('[name=intro-text]') as HTMLInputElement).value = form.introText || '';
  (document.querySelector('[name=confirmation-text]') as HTMLInputElement).value = form.confirmationText || '';
  (document.querySelector('[name=primary-color]') as HTMLInputElement).value = form.primaryColor || '';
  (document.querySelector('[name=intro-background-url]') as HTMLInputElement).value = form.introImageURL || '';

  form.questions.forEach(q => {
    questions.push(q)
  })

  update()
}

export function update() {
  const el:HTMLElement = document.querySelector(`build-form`)

  const save = async (evt:MouseEvent) => {
    (evt.target as HTMLButtonElement).disabled = true
    const newForm = collectForm()

    await createForm(newForm)
    await wait(0.5) // hax: give blockstack a little time to refresh forms.json file (seems to be needed even though we await updating forms.json)

    Store.setRouteAction(Route.FormsList)
  }

  const tpl = html`
<h3>Build</h3>

<form class="grid-x grid-margin-y grid-margin-x">
  <div class="cell small-6">
    <label>
        Human-readable name
        <input type="text" name="form-name" required>
    </label>
  </div>
  <div class="cell small-6">
    <label>
        Confirmation text
        <input type="text" name="confirmation-text">
    </label>
  </div>
  <div class="cell small-12">
    <label>
        Intro text
        <textarea type="text" name="intro-text"></textarea>
    </label>
  </div> 
  <div class="cell small-6">
    <label>
        Brand/primary colour
        <input type="color" name="primary-color" value="#00bfff">
    </label>
  </div>
  <div class="cell small-6">
    <label>
        Background image for the intro screen
        <input type="url" name="intro-background-url">
    </label>
  </div>
  
 
  <div class="cell small-12">
    ${questions.map(q => 
    html`
    <div class="grid-x grid-margin-x grid-margin-y question-item">
      <div class="cell auto">
        <label>Question label
          <input type='text' name="${q.name}" value="${q.label}" placeholder="Question label">
        </label>
      </div>
      <div class="cell small-3">
        <label>Type
          <select name="${q.name}-q-type">
              <option selected?="${q.type === 'text'}">text</option>
              <option selected?="${q.type === 'email'}">email</option>
              <option selected?="${q.type === 'number'}">number</option>
              <option selected?="${q.type === 'datetime-local'}">datetime-local</option>
              <option selected?="${q.type === 'tel'}">tel</option>
              <option selected?="${q.type === 'url'}">url</option>
              <option selected?="${q.type === 'file'}" value="file">file attachment</option>
          </select>
        </label>
      </div>
      <div class="cell shrink align-self-bottom">
        <button data-uuid$="${q.uuid}" on-click="${(evt:Event) => removeField(evt)}" class="hollow button warning expanded" type="button">Remove</button>
      </div>
    </div>
  `)}
    
  </div>

  <div class="cell small-12">
    <div class="grid-x">
      <div class="cell auto">
          <button on-click="${() => {addField(questions); update()}}" class="hollow button" type="button">Add question</button>
      </div>
      <div class="cell shrink">
          <button on-click="${(evt:MouseEvent) => save(evt)}" class="hollow button primary" type="button">Save</button>
      </div>
    </div>
  </div>
</form>
`

  render(tpl, el)
}

function collectForm ():Form {
  // basics
  const authorPubKey = new BlockstackUtils().publicKey
  const newFrom = <Form>{
    authorPubKey,
    uuid: uuid(),
    created: new Date(),
    modified: new Date(),
    questions: [],
    name: (document.querySelector('[name=form-name]') as HTMLInputElement).value,
    introText: (document.querySelector('[name=intro-text]') as HTMLInputElement).value,
    confirmationText: (document.querySelector('[name=confirmation-text]') as HTMLInputElement).value,
    primaryColor: (document.querySelector('[name=primary-color]') as HTMLInputElement).value,
    introImageURL: (document.querySelector('[name=intro-background-url]') as HTMLInputElement).value,
    submissionsUrl: settings.getValue('submissionTaskUrl'),
  }

  // questions
  newFrom.questions = Array.from(document.querySelectorAll('.question-item'))
    .map((el:HTMLElement) => {
      const [label] = Array.from(el.querySelectorAll('input')).map(el => el.value)
      const [type] = Array.from(el.querySelectorAll('select')).map(el => el.value)
      return <Question>{
        uuid: uuid(),
        label,
        name: label,
        type,
        created: new Date(),
        modified: new Date(),
      }
    })
  // question-item

  return newFrom
}

function addField (questions:Question[]) {
  const q = <Question>{
    uuid: uuid()
  }
  questions.push(q)
}

function removeField (event:Event) {
  (event.target as HTMLButtonElement).parentElement.parentElement.classList.add('hide');
  (event.target as HTMLButtonElement).parentElement.parentElement.classList.remove('question-item')
}

function wait (sec:number) {
  return new Promise(resolve => setTimeout(() => resolve(), sec * 1000))
}