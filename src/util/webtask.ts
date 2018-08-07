import * as settings from '../settings'

function getWebTaskCreateUrl(taskName: string) {
  return `https://sandbox.auth0-extend.com/api/webtask/${settings.getWebtaskId()}/${taskName}?key=${settings.getWebtaskToken()}`
}

export async function createWebTaskTask(taskName: string, taskCodeUrl: string, taskPackageUrl: string, taskSecrets: any = {}) {
  const url = getWebTaskCreateUrl(taskName)
  const p = await fetch(taskPackageUrl).then((res) => { return res.json() })

  return (await fetch(url, {
    method: 'PUT',
    body: JSON.stringify({
      url: taskCodeUrl,
      secrets: taskSecrets,
      meta: {
        'wt-node-dependencies': JSON.stringify(p.dependencies).replace(/\^/g, '')
      }
    })
  }).then((res) => res.json()))
}
