import { getFile, putFile } from './write.js'

const {blockstack} = window as any

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

async function main () {
  const name = 'tmp/' + 'junk' + new Date().getTime()
  await putFile(name, {random: Math.random()})
  console.log('Wrote some junk!')

  const retrieved = await getFile(name)
  console.log('got', retrieved)
}
