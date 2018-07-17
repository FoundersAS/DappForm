const blockstack = require('blockstack')
import Bench from '../util/bench'
import { localStorage } from '../util/fakeLocalStorage'
import { createDummySubmission, updateSubmissionsFromBench } from '../forms'
import { Submission } from '../form-format';

// Start LocalStorage hack for Blockstack
declare global {
  interface WorkerGlobalScope { window:any, localStorage:any }
}

(self.localStorage as any) = localStorage as any
(self.window as any) = { localStorage: localStorage, location: ''}
// End Hack

const ctx: Worker = self as any;

ctx.onmessage = (e: any) => {
  const data = e.data

  switch(data.cmd) {
    case 'start':
      initLocalStorage(data.blockstackData)
      console.debug('blockstack signed in: ', blockstack.isUserSignedIn())
      startPolling()
  }
}

function initLocalStorage (blockstackData: any) {
  localStorage.setItem('blockstack', blockstackData.blockstack)
  localStorage.setItem('blockstack-gaia-hub-config', blockstackData.gaia)
  localStorage.setItem('blockstack-transit-private-key', blockstackData.key)
}

function startPolling () {
  const privateKey = blockstack.loadUserData().appPrivateKey
  const publicKey = blockstack.getPublicKeyFromPrivate(privateKey)

  const bench = new Bench(privateKey, publicKey)
  bench.postFile(createDummySubmission('12345'))
  setInterval(()=> {
    bench.postFile(createDummySubmission('12345'))
  }, 1000*60*5)

  doPoll()

  async function doPoll () {
    console.debug('Polling for new submissions ...')

    const files = await bench.getBenchFiles() as Submission[]
    await updateSubmissionsFromBench(files)
    if (files.length) {
      await bench.cleanBench()
      ctx.postMessage('new submissions ready')
    }

    setTimeout(doPoll, 5000);
  }
}

export default null as any;
