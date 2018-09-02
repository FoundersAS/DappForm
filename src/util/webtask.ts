import * as settings from '../settings'

function getTaskUrl(taskName: string) {
  return `https://sandbox.auth0-extend.com/api/webtask/${settings.getValue('webtaskId')}/${taskName}?key=${settings.getValue('webtaskToken')}`
}

function getCronUrl(taskName: string) {
  return `https://sandbox.auth0-extend.com/api/cron/${settings.getValue('webtaskId')}/${taskName}?key=${settings.getValue('webtaskToken')}`
}

export async function createWebTaskTask(taskName: string, taskCodeUrl: string, taskPackageUrl: string, taskSecrets: any = {}) {
  let res:Response

  res = await fetch(taskPackageUrl)
  const packageJson = await res.json()

  taskSecrets.version = packageJson.version
  console.debug(`Deploying ${taskName} v${packageJson.version}`)

  res = await fetch(getTaskUrl(taskName), {
    method: 'PUT',
    body: JSON.stringify({
      url: taskCodeUrl,
      secrets: taskSecrets,
      meta: {
        'wt-node-dependencies': JSON.stringify(packageJson.dependencies).replace(/\^/g, '') // remove ^ because webtask doesn't support it
      }
    })
  })
  const deployed:{webtask_url: string} = await res.json()

  return deployed
}

export async function createCronSchedule(taskName: string, schedule: string) {
  return (await fetch(getCronUrl(taskName), {
    method: 'PUT',
    body: JSON.stringify({
      schedule
    })
  }).then((res) => res.json()))
}
