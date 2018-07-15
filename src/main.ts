
import { fetchForms } from './components/list-forms/list-forms'
import Store from './store'
import { encryptForm } from './util/crypto'

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
  Store.setFormsAction(forms)
  console.debug(forms)
  // })
}

async function upload () {
  console.assert(blockstack.isUserSignedIn(), "User is not logged id")
  // const authorPubkey = blockstack.getPublicKeyFromPrivate( blockstack.loadUserData().appPrivateKey )
  const recipientPubKey = '0304eb59f9d33acdc46825c160405b1154ccabfff226fb777e4ce5df4c8f8cacd4'

  const quickForm = {
    id: 42,
    name: "The real questions.",
    questions: [
      {label: "Do you like privacy?"},
    ],
    submissions: <Object[]>[],
  }

  // const signedPath = signMessage('/forms', blockstack.loadUserData().appPrivateKey)
  const cipherObj = encryptForm(recipientPubKey, quickForm)
  const body = {
    data: cipherObj,
    key: recipientPubKey,
  }

  const res1 = await fetch('https://bench.takectrl.io/', {
    method: 'POST',
    body: JSON.stringify(body),
    mode: 'cors',
    headers: {
      'Content-Type': "application/json",
    }
  })
  if (res1.status !== 200) {
    throw new Error('failed upload')
  }
  console.debug(res1)
}
(window as any).upload = upload
// upload()

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