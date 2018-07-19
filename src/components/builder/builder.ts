import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import { Form, Question } from '../../form-format'
import Store from '../../store'
import { Route } from '../router'

import { v4 as uuid } from 'uuid'
import { createForm } from '../../forms';
const blockstack = require('blockstack')

const questions = <Question[]>[]

export function update() {
  const el:HTMLElement = document.querySelector(`build-form`)
  const questionsListTpl = questions.map(renderLeaf)

  const save = async (evt:MouseEvent) => {
    (evt.target as HTMLButtonElement).disabled = true
    const newForm = collectForm()

    await createForm(newForm)

    Store.setRouteAction(Route.FormsList)
  }

  const tpl = html`
<h3>Build</h3>

<form class="grid-x grid-margin-y grid-margin-x">
  <div class="cell small-6">
    <label>
        Human-readable name
        <input type="text" name="form-name">
    </label>
  </div>
  <div class="cell small-6">
    <label>
        Intro text
        <input type="text" name="intro-text">
    </label>
  </div>
  <div class="cell small-6">
    <label>
        Confirmation text
        <input type="text" name="confirmation-text">
    </label>
  </div>

  <div class="cell small-12">
    ${questionsListTpl}
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
  const authorPubKey = blockstack.getPublicKeyFromPrivate( blockstack.loadUserData().appPrivateKey ) // be visible to me self!! YArrrrg
  const newFrom = <Form>{
    authorPubKey,
    uuid: uuid(),
    created: new Date(),
    modified: new Date(),
    questions: [],
    name: (document.querySelector('[name=form-name]') as HTMLInputElement).value,
    introText: (document.querySelector('[name=intro-text]') as HTMLInputElement).value,
    confirmationText: (document.querySelector('[name=confirmation-text]') as HTMLInputElement).value,
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

function renderLeaf(q:Question) {
  return html`
<div class="grid-x grid-margin-x grid-margin-y question-item">
  <div class="cell auto">
    <label>Question label
      <input type='text' name="${q.name}" placeholder="Question label">
    </label>
  </div>
  <div class="cell small-3">
    <label>Type
      <select name="${q.name}-q-type">
          <option>text</option>
          <option>email</option>
          <option>number</option>
          <option>datetime-local</option>
          <option>tel</option>
          <option>url</option>
      </select>
    </label>
  </div>
  <div class="cell shrink align-self-bottom">
    <button data-uuid$="${q.uuid}" on-click="${(evt:Event) => removeField(evt)}" class="hollow button warning expanded" type="button">Remove</button>
  </div>
</div>
  `
}
