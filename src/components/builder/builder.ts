import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import { Form, Question } from '../../form-format'
import Store from '../../store'

const uuidv4 = require('../../../node_modules/uuid/v4')
const {blockstack} = window as any

const questions = <Question[]>[]

export function update() {
  const el:HTMLElement = document.querySelector(`build-form`)
  const questionsListTpl = questions.map(renderLeaf)

  const save = async (evt:MouseEvent) => {
    (evt.target as HTMLButtonElement).disabled = true
    const newForm = collectForm()
    console.debug(newForm)
    await uploadShare(newForm)
    Store.setFormsAction([...Store.store.forms, newForm])
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
  
  <div class="cell small-12">
    ${questionsListTpl}
  </div>
    
  <div class="cell small-12">  
    <div class="grid-x">
      <div class="cell auto">
          <button on-click="${() => {addField(questions); update()}}" class="hollow button" type="button">Add text</button>      
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
  const newFrom = <Form>{
    uuid: uuidv4(),
    created: new Date(),
    modified: new Date(),
    questions: [],
    name: (document.querySelector('[name=form-name]') as HTMLInputElement).value,
    introText: (document.querySelector('[name=intro-text]') as HTMLInputElement).value,
  }

  // questions
  newFrom.questions = Array.from(document.querySelectorAll('.question-item'))
    .map((el:HTMLElement) => {
      const [label] = Array.from(el.querySelectorAll('input')).map(el => el.value)
      const [type] = Array.from(el.querySelectorAll('select')).map(el => el.value)
      return <Question>{
        uuid: uuidv4(),
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
    uuid: uuidv4()
  }
  questions.push(q)
}

function renderLeaf(q:Question) {
  return html`
<div class="grid-x grid-margin-x grid-margin-y question-item"> 
  <div class="cell small-8"> 
    <label>Question label
      <input type='text' name="${q.name}" placeholder="Question label">   
    </label>
  </div>
  <div class="cell small-4">
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
</div>
  `
}

async function uploadShare (newForm:Form) {
  // console.assert(blockstack.isUserSignedIn(), "User is not logged id")
  // const authorPubkey = blockstack.getPublicKeyFromPrivate( blockstack.loadUserData().appPrivateKey )
  // const recipientPubKey = '0304eb59f9d33acdc46825c160405b1154ccabfff226fb777e4ce5df4c8f8cacd4'

  // const quickForm = {
  //   id: 43,
  //   name: "The real questions.",
  //   questions: [
  //     {label: "Do you like privacy?"},
  //   ],
  //   submissions: <Object[]>[],
  // }
  // const signedPath = signMessage('/forms', blockstack.loadUserData().appPrivateKey)
  // await putFile(`forms/${quickForm.id}.json`, quickForm)

  await blockstack.putFile(`forms/${newForm.uuid}.json`, JSON.stringify(newForm), {encrypt: false})

  // Object.values(blockstack.loadUserData().profile.apps)[0]
  // lookupProfile

  // target to find: https://gaia.blockstack.org/hub/14ktrFjBTrQhmvZYdEgVZPEvceo6uKiyLZ/forms/43.json
  // where the hash is the app public address
  console.debug(`did put stuff`)
}
