import BlockstackUtils from '../../util/blockstackUtils'
import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import  * as settings from '../../settings'
import { createWebTaskTask } from '../../util/webtask';

const blockstackUtils = new BlockstackUtils()

settings.events.on('load', () => {
  renderSettings()
})

async function deployTasks() {
  settings.setHostingTaskUrl((await createWebTaskTask(
    'dappform-host-task',
    "https://raw.githubusercontent.com/FoundersAS/dappform-tasks-form-hosting/master/main.js",
    "https://raw.githubusercontent.com/FoundersAS/dappform-tasks-form-hosting/master/package.json",
    {
      BLOCKSTACK_USERNAME: blockstackUtils.username
    }
  )).webtask_url)

  settings.setSubmissionTaskUrl((await createWebTaskTask(
    'dappform-submission-task',
    'https://raw.githubusercontent.com/FoundersAS/dappform-tasks-submissions/master/index.js',
    'https://raw.githubusercontent.com/FoundersAS/dappform-tasks-submissions/master/package.json',
    blockstackUtils.getBlockstackLocalStorage()
  )).webtask_url)

  settings.setStatsTaskUrl((await createWebTaskTask(
    'dappform-stats-task',
    'https://raw.githubusercontent.com/FoundersAS/dappform-tasks-stats/master/main.js',
    'https://raw.githubusercontent.com/FoundersAS/dappform-tasks-stats/master/package.json',
    { ... blockstackUtils.getBlockstackLocalStorage(),
      POSTMARK_TOKEN: settings.getValue('postmarkToken'),
      POSTMARK_FROM: settings.getValue('postmarkFrom'),
      POSTMARK_TO: settings.getValue('email')
    }
  )).webtask_url)

  saveSettings()
}

function renderSettings() {
  Object.keys(settings.settingsSchema).forEach((k) => {
    const field = (document.querySelector(`[name=${k}]`) as HTMLInputElement)
    field.value = settings.getValue(k) || ''
  })
}

function saveUserDefinedSettings() {
  Object.entries(settings.settingsSchema).filter(([key, readonly]) => {
    return !readonly
  }).forEach(([key, readonly]) => {
    settings.setValue(key, (document.querySelector(`[name=${key}]`) as HTMLInputElement).value)
  })

  saveSettings()
}

function saveSettings() {
  settings.saveSettings()
  renderSettings()
}

function renderSettingFields() {
  return Object.entries(settings.settingsSchema).map(([key, readonly]) => {
    return html`
      <label>
        ${key}
        <input type="text" name="${key}" readonly?=${readonly}>
      </label>
    `
  })
}

export async function update() {
  const el = document.querySelector('settings-view')

  const settingsFields = renderSettingFields()

  const tpl = html`
    <h3>Settings</h3>

    <div class="grid-x grid-margin-x">
      <div class="cell small-6">
        <button class="button" on-click="${saveUserDefinedSettings}">Save</button>
        <button class="button success" on-click="${deployTasks}">Deploy Tasks</button>
        ${settingsFields}
      </div>
    </div>
  `
  render(tpl, el)
  renderSettings()
}
