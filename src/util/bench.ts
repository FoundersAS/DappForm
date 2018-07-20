import { signString, decryptFileWithKey, encryptFile } from "./crypto";

type SignedHeader = {
  readonly 'x-ctrl-key': string,
  readonly 'x-ctrl-signature': string
}

type SignedHeaders = {
  getSig: SignedHeader
  cleanSig: SignedHeader
}

function generateHeaders (privateKey: string, publicKey: string): SignedHeaders {
  return {
    getSig: {
      'x-ctrl-key': publicKey,
      'x-ctrl-signature': JSON.stringify(signString('/get', privateKey).toDER())
    },
    cleanSig: {
      'x-ctrl-key': publicKey,
      'x-ctrl-signature': JSON.stringify(signString('/clean', privateKey).toDER())
    }
  }
}

type BenchFile = {
  id: string,
  received: Date
  data: Object
}

export default class Bench {
  privateKey: string
  publicKey: string
  headers: SignedHeaders

  constructor(privateKey: string, publicKey:string) {
    this.privateKey = privateKey
    this.publicKey = publicKey
    if (privateKey) {
      this.headers = generateHeaders(privateKey, publicKey)
    }
  }

  private decryptBenchFiles(files: BenchFile[]): any[] {
    return files.map(s => decryptFileWithKey(this.privateKey, s.data))
  }

  async getBenchFiles(): Promise<any[]> {
    const res = await fetch('https://bench.takectrl.io/get', {
      mode: 'cors',
      headers: this.headers.getSig
    })

    if (res.status === 200) {
      const benchFiles: BenchFile[] = await res.json()
      if (benchFiles.length > 0) console.debug(`bench: ${this.publicKey} - new files: ${benchFiles.length}`)
      return this.decryptBenchFiles(benchFiles)
    }
    if (res.status === 404) return []// no files waiting / bucket not existing
    console.error(`bench: ${this.publicKey} - error fetching files:`, res)
  }

  async cleanBench() {
    // console.debug(`bench: ${this.publicKey} - cleaning`)
    const res = await fetch('https://bench.takectrl.io/clean', {
      method: 'POST',
      mode: 'cors',
      headers: this.headers.cleanSig
    })
    if (res.status === 200) return console.debug(`bench: ${this.publicKey} - cleaned`)
    console.error(`bench: ${this.publicKey} - cleaning failed:`, res)
  }

  async postFile(file: Object) {
    const res = await fetch('https://bench.takectrl.io/', {
      method: 'POST',
      body: JSON.stringify({
        key: this.publicKey,
        data: encryptFile(this.publicKey, file)
      }),
      mode: 'cors',
      headers: {
        'Content-Type': "application/json",
      }
    })
    if (res.status === 200) return console.debug(`bench: ${this.publicKey} - file posted`)
    console.error(`bench: ${this.publicKey} - file post failed: `, res)
  }
}
