import { html } from '../../../node_modules/lit-html/src/lit-html'
import { Form, Question } from '../../form-format'
const uuidv4 = require('../../../node_modules/uuid/v4')

export function update() {

}

function addField (name:string, form:Form) {
  const q = <Question>{
    name: '',
    uuid: uuidv4()
  }
  form.questions.push(q)
}

function renderLeaf(type:string) {
  return html`<input type='${type}'>`
}