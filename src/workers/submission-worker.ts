onmessage = (e) => {
  const data = e.data

  switch(data.cmd) {
    case 'start':
      startPolling(data.publicKey, data.headers)
  }
}

interface SignedHeaders {}

const postBack = Worker.prototype.postMessage

function startPolling (publicKey: string, headers: object) {

  async function doPoll () {
    const res = await fetch('https://bench.takectrl.io/get', {
      mode: 'cors',
      headers: headers.get
    })
    if (res.status === 200) {
      const json = await res.json()
      postBack(json);


    }
  }
}


