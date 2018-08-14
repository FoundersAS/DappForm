import * as settings from '../settings'

function getTaskUrl(taskName: string) {
  return `https://sandbox.auth0-extend.com/api/webtask/${settings.getValue('webtaskId')}/${taskName}?key=${settings.getValue('webtaskToken')}`
}

function getCronUrl(taskName: string) {
  return `https://sandbox.auth0-extend.com/api/cron/${settings.getValue('webtaskId')}/${taskName}?key=${settings.getValue('webtaskToken')}`
}

export async function createWebTaskTask(taskName: string, taskCodeUrl: string, taskPackageUrl: string, taskSecrets: any = {}) {
  const p = await fetch(taskPackageUrl).then((res) => { return res.json() })
  taskSecrets.version = p.version
  console.debug(`Deploying ${taskName} v${p.version}`)
  return (await fetch(getTaskUrl(taskName), {
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

export async function createCronSchedule(taskName: string, schedule: string) {
  return (await fetch(getCronUrl(taskName), {
    method: 'PUT',
    body: JSON.stringify({
      schedule
    })
  }).then((res) => res.json()))
}
