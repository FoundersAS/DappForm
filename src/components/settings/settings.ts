import BlockstackUtils from '../../util/blockstackUtils'
import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import { getFile, putFile } from '../../util/write'

interface Settings {
  webtaskId: string,
  webtaskToken: string,
  submissionTaskUrl: string,
  hostingTaskUrl: string,
  statsTaskUrl: string
}

let settings: Settings = {
  webtaskId: '',
  webtaskToken: '',
  hostingTaskUrl: '',
  submissionTaskUrl: '',
  statsTaskUrl: ''
}

async function createHostingTask(webtaskApiUrl: string, webtaskToken: string) {
  const createSubmissionTaskUrl = `${webtaskApiUrl}/dappform-host-task?key=${webtaskToken}`

  const p = await fetch('https://raw.githubusercontent.com/FoundersAS/dappform-submission-receiver/master/package.json').then((res) => { return res.json() })

  settings.hostingTaskUrl = (await fetch(createSubmissionTaskUrl, {
    method: 'PUT',
    body: JSON.stringify({
      url: 'https://raw.githubusercontent.com/FoundersAS/dappform-submission-receiver/master/index.js',
      secrets: {
        BLOCKSTACK_USERNAME: new BlockstackUtils().username
      },
      meta: {
        'wt-node-dependencies': JSON.stringify(p.dependencies).replace(/\^/g, '')
      }
    })
  }).then((res) => res.json())).webtask_url
}

async function createSubmissionTask(webtaskApiUrl: string, webtaskToken: string) {
  const createSubmissionTaskUrl = `${webtaskApiUrl}/dappform-submission-task?key=${webtaskToken}`

  const p = await fetch('https://raw.githubusercontent.com/FoundersAS/dappform-submission-receiver/master/package.json').then((res) => { return res.json() })

  settings.submissionTaskUrl = (await fetch(createSubmissionTaskUrl, {
    method: 'PUT',
    body: JSON.stringify({
      url: 'https://raw.githubusercontent.com/FoundersAS/dappform-submission-receiver/master/index.js',
      secrets: {
        BLOCKSTACK: localStorage.getItem('blockstack'),
        BLOCKSTACK_GAIA_HUB_CONFIG: localStorage.getItem('blockstack-gaia-hub-config'),
        BLOCKSTACK_TRANSIT_PRIVATE_KEY: localStorage.getItem('blockstack-transit-private-key'),
        BLOCKSTACK_APP_PRIVATE_KEY: localStorage.getItem('blockstack-app-private-key')
      },
      meta: {
        'wt-node-dependencies': JSON.stringify(p.dependencies).replace(/\^/g, '')
      }
    })
  }).then((res) => res.json())).webtask_url
}

async function createStatsTask(webtaskApiUrl: string, webtaskToken: string) {
  const createSubmissionTaskUrl = `${webtaskApiUrl}/dappform-stats-taskr?key=${webtaskToken}`

  const p = await fetch('https://raw.githubusercontent.com/FoundersAS/dappform-stats/master/package.json').then((res) => { return res.json() })

  settings.statsTaskUrl = (await fetch(createSubmissionTaskUrl, {
    method: 'PUT',
    body: JSON.stringify({
      url: 'https://raw.githubusercontent.com/FoundersAS/dappform-stats/master/main.js',
      secrets: {
        BLOCKSTACK: localStorage.getItem('blockstack'),
        BLOCKSTACK_GAIA_HUB_CONFIG: localStorage.getItem('blockstack-gaia-hub-config'),
        BLOCKSTACK_TRANSIT_PRIVATE_KEY: localStorage.getItem('blockstack-transit-private-key'),
        BLOCKSTACK_APP_PRIVATE_KEY: localStorage.getItem('blockstack-app-private-key')
      },
      meta: {
        'wt-node-dependencies': JSON.stringify(p.dependencies).replace(/\^/g, '')
      }
    })
  }).then((res) => res.json())).webtask_url
}

async function createWebTaskTasks() {
  console.log('deploying tasks')
  const webtaskToken = (document.querySelector('[name=webtask-token]') as HTMLInputElement).value
  console.log('token: ', webtaskToken)

  const webtaskId = (document.querySelector('[name=webtask-id]') as HTMLInputElement).value
  console.log('token: ', webtaskId)

  const webtaskApiUrl= `https://sandbox.auth0-extend.com/api/webtask/${webtaskId}`

  await createHostingTask(webtaskApiUrl, webtaskToken)
  await createSubmissionTask(webtaskApiUrl, webtaskToken)
  await createStatsTask(webtaskApiUrl, webtaskToken)

  console.log('done create: ', settings)

  saveSettings()
}

async function saveSettings() {
  await putFile('settings.json', settings)
  renderSettings()
}


async function renderSettings() {
  console.log('render')
  const idField = (document.querySelector('[name=webtask-id]') as HTMLInputElement)
  idField.value = settings.webtaskId

  const tokenField = (document.querySelector('[name=webtask-token]') as HTMLInputElement)
  tokenField.value = settings.webtaskToken

  const hostField = (document.querySelector('[name=webtask-host-task]') as HTMLInputElement)
  hostField.value = settings.hostingTaskUrl

  const submissionField = (document.querySelector('[name=webtask-submission-task]') as HTMLInputElement)
  submissionField.value = settings.submissionTaskUrl

  const statsField = (document.querySelector('[name=webtask-stats-task]') as HTMLInputElement)
  statsField.value = settings.statsTaskUrl
}

export async function update() {
  settings = (await getFile('settings.json')) as Settings || settings

  const el = document.querySelector('settings-view')

  const tpl = html`
    <h3>Settings</h3>

    <div class="grid-x grid-margin-x">
      <div class="cell small-6">
        <label>
            WebTask ID
            <input type="text" name="webtask-id" required>
        </label>
        <label>
            WebTask Token
            <input type="text" name="webtask-token" required>
        </label>
        <button class="button" on-click="${saveSettings}">Save</button>
        <button class="button success" on-click="${createWebTaskTasks}">Deploy Tasks</button>
        <label>
            Host Task
            <input type="text" name="webtask-host-task" readonly>
        </label>
        <label>
            Submission Task
            <input type="text" name="webtask-submission-task" readonly>
        </label>
        <label>
            Stats Task
            <input type="text" name="webtask-stats-task" readonly>
        </label>
      </div>
    </div>
  `
  render(tpl, el)

  renderSettings()
}
