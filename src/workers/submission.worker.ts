const blockstack = require('blockstack')

import Bench from '../util/bench'
import { createLocalStorage } from '../util/fakeLocalStorage'
import { updateSubmissionsFromBench } from '../forms'
import { Submission } from '../form-format';

declare global {
  interface WorkerGlobalScope { window: any, localStorage: any }
}

function blockstackLocalStorageHack(blockstackData: any) {
  (self.localStorage as any) = createLocalStorage(blockstackData) as any
  (self.window as any) = { localStorage: self.localStorage, location: '' }
}

const ctx: Worker = self as any;

ctx.onmessage = (e: any) => {
  const data = e.data

  switch (data.cmd) {
    case 'start':
      blockstackLocalStorageHack(data.blockstackData)
      console.debug('SubmissionWorker: Blockstack signin: ', blockstack.isUserSignedIn())
      startPolling()
  }
}

function startPolling() {
  doPoll()

  // TODO: Potential race condition when cleaning bench - could be new submissions
  async function doPoll() {
    console.debug('SubmissionWorker: Polling ...')
    const privateKey = blockstack.loadUserData().appPrivateKey
    const publicKey = blockstack.getPublicKeyFromPrivate(privateKey)
    const bench = new Bench(privateKey, publicKey)
    const files = await bench.getBenchFiles() as Submission[]
    await updateSubmissionsFromBench(files)
    if (files.length) {
      await bench.cleanBench()
      ctx.postMessage('new submissions ready')
    }

    console.debug('SubmissionWorker: Polling Done')
    setTimeout(doPoll, 5000);
  }
}

export default null as any;
