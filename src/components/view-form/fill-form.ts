import { Answer, Form, getForm, getPublishPath, Submission } from 'dappform-forms-api'
import Store from '../../store'
import { v4 as uuid } from 'uuid'
import { encryptFile } from '../../util/crypto'
import {renderForm} from 'dappform-filler'

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
      console.assert(form, `Form was not found at ${pathToPublicForm}`)
    }
  }
  else if (submission) {
    formUuid = submission.formUuid
    form = await getForm(formUuid)
    console.assert(form, `Form was not found by getForm(${formUuid})`)
  }

  const onSubmit = async (answers:Answer[], form:Form) => {
    const submission = <Submission>{
      answers: answers,
      uuid: uuid(),
      created: new Date(),
      formUuid: form.uuid,
    }

    const url = form.submissionsUrl
    const encryptedObject:Object = encryptFile(form.authorPubKey, submission)

    const res = await fetch(url, <RequestInit>{
      mode: 'cors',
      method: 'POST',
      body: JSON.stringify({
        data: JSON.stringify(encryptedObject)
      }),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    })

    return (res.status < 300)
  }

  renderForm({
    form,
    submission,
    onSubmit,
  }, el)
}

