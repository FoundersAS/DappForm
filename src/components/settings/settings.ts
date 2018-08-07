import BlockstackUtils from '../../util/blockstackUtils'
import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import  * as settings from '../../settings'
import { createWebTaskTask } from '../../util/webtask';

settings.events.on('load', () => {
  renderSettings()
})

async function deployTasks() {
  settings.setHostingTaskUrl((await createWebTaskTask(
    'dappform-host-task',
    'https://raw.githubusercontent.com/FoundersAS/dappform-submission-receiver/master/index.js',
    'https://raw.githubusercontent.com/FoundersAS/dappform-submission-receiver/master/package.json',
    {
      BLOCKSTACK_USERNAME: new BlockstackUtils().username
    }
  )).webtask_url)

  settings.setSubmissionTaskUrl((await createWebTaskTask(
    'dappform-submission-task',
    'https://raw.githubusercontent.com/FoundersAS/dappform-submission-receiver/master/index.js',
    'https://raw.githubusercontent.com/FoundersAS/dappform-submission-receiver/master/package.json',
    {
      BLOCKSTACK: localStorage.getItem('blockstack'),
      BLOCKSTACK_GAIA_HUB_CONFIG: localStorage.getItem('blockstack-gaia-hub-config'),
      BLOCKSTACK_TRANSIT_PRIVATE_KEY: localStorage.getItem('blockstack-transit-private-key'),
      BLOCKSTACK_APP_PRIVATE_KEY: localStorage.getItem('blockstack-app-private-key')
    }
  )).webtask_url)

  settings.setStatsTaskUrl((await createWebTaskTask(
    'dappform-stats-task',
    'https://raw.githubusercontent.com/FoundersAS/dappform-stats/master/main.js',
    'https://raw.githubusercontent.com/FoundersAS/dappform-stats/master/package.json',
    {
      BLOCKSTACK: localStorage.getItem('blockstack'),
      BLOCKSTACK_GAIA_HUB_CONFIG: localStorage.getItem('blockstack-gaia-hub-config'),
      BLOCKSTACK_TRANSIT_PRIVATE_KEY: localStorage.getItem('blockstack-transit-private-key'),
      BLOCKSTACK_APP_PRIVATE_KEY: localStorage.getItem('blockstack-app-private-key')
    }
  )).webtask_url)

  saveSettings()
}


function renderSettings() {
  const idField = (document.querySelector('[name=webtask-id]') as HTMLInputElement)
  idField.value = settings.getWebtaskId()

  const tokenField = (document.querySelector('[name=webtask-token]') as HTMLInputElement)
  tokenField.value = settings.getWebtaskToken()

  const hostField = (document.querySelector('[name=webtask-host-task]') as HTMLInputElement)
  hostField.value = settings.getHostingTaskUrl()

  const submissionField = (document.querySelector('[name=webtask-submission-task]') as HTMLInputElement)
  submissionField.value = settings.getSubmissionTaskUrl()

  const statsField = (document.querySelector('[name=webtask-stats-task]') as HTMLInputElement)
  statsField.value = settings.getStatsTaskUrl()
}

function saveUserDefinedSettings() {
  settings.setWebtaskToken((document.querySelector('[name=webtask-token]') as HTMLInputElement).value)
  settings.setWebtaskId((document.querySelector('[name=webtask-id]') as HTMLInputElement).value)

  saveSettings()
}

function saveSettings() {
  settings.saveSettings()
  renderSettings()
}

export async function update() {
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
        <button class="button" on-click="${saveUserDefinedSettings}">Save</button>
        <button class="button success" on-click="${deployTasks}">Deploy Tasks</button>
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
