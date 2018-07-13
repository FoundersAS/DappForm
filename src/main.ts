import { getFile, putEncryptedFile, putFile } from './write'
import { addForm } from './db'
import { fetchForms, update as listUpdate } from './components/list-forms/list-forms'
import { update as viewUpdate } from './components/view-form/view-form'
import State from './state'

const {blockstack} = window as any

async function main () {
  const name = 'tmp/' + 'junk' + new Date().getTime()
  // await putFile(name, {random: Math.random()})
  // console.log('Wrote some junk!')
  //
  // const retrieved = await getFile(name)
  // console.log('got', retrieved)
  //
  // addForm('test')

  // document.addEventListener('DOMContentLoaded', () => {
  //   console.debug("onload")
  // fetchNewSubmissionsUpdate()
  const forms = await fetchForms()
  State.addForms(forms)
  console.debug(forms)
  // })
}

async function upload () {
  console.assert(blockstack.isUserSignedIn(), "User is not logged id")
  const authorPubkey = blockstack.getPublicKeyFromPrivate( blockstack.loadUserData().appPrivateKey )
  const quickForm = {
    id: 42,
    name: "The real questions.",
    authorPubkey,
    questions: [
      {label: "Do you like privacy?"},
    ],
    submissions: <Object[]>[],
  }
  await putEncryptedFile(authorPubkey, '/get', quickForm)
  console.debug("File was put.")
}

// (window as any).upload = upload

// side effects

if (blockstack.isUserSignedIn()) {
  // const userData = blockstack.loadUserData()
  // const user = new blockstack.Person(this.userData.profile)
  // const user.username = this.userData.username
  main()
}
else if (blockstack.isSignInPending()) {
  blockstack.handlePendingSignIn()
    .then((userData: any) => {
      console.log('signed in!')
      console.log(userData)
      window.location.reload()
    })
    .catch((err:any) => console.error(err))
}
else {
  blockstack.redirectToSignIn()
}