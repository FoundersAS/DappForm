import BlockstackUtils from '../../util/blockstackUtils'
import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import  * as settings from '../../settings'

import { createWebTaskTask, createCronSchedule } from '../../util/webtask';
import { loadSettings, Settings } from '../../settings'
import Store from '../../store'

function sendReports() {
  fetch(settings.getValue('statsTaskUrl')).then(console.log)
}

async function deployTasks() {
  saveUserDefinedSettings()

  settings.setValue('hostingTaskUrl', (await createWebTaskTask(
    'dappform-tasks-host',
    "https://raw.githubusercontent.com/FoundersAS/dappform-tasks-form-hosting/master/main.js",
    "https://raw.githubusercontent.com/FoundersAS/dappform-tasks-form-hosting/master/package.json",
    {
    }
  )).webtask_url)

  settings.setValue('submissionTaskUrl', (await createWebTaskTask(
    'dappform-tasks-submission',
    'https://raw.githubusercontent.com/FoundersAS/dappform-tasks-submissions/master/index.js',
    'https://raw.githubusercontent.com/FoundersAS/dappform-tasks-submissions/master/package.json',
    {...BlockstackUtils.getBlockstackLocalStorage(),
      BLOCKSTACK_APP_PRIVATE_KEY: new BlockstackUtils().privateKey},
  )).webtask_url)

  settings.setValue('statsTaskUrl', (await createWebTaskTask(
    'dappform-tasks-stats',
    'https://raw.githubusercontent.com/FoundersAS/dappform-tasks-stats/master/index.js',
    'https://raw.githubusercontent.com/FoundersAS/dappform-tasks-stats/master/package.json',
    { ... BlockstackUtils.getBlockstackLocalStorage(),
      POSTMARK_TOKEN: settings.getValue('postmarkToken'),
      POSTMARK_FROM: settings.getValue('postmarkFrom'),
      POSTMARK_TO: settings.getValue('email')
    }
  )).webtask_url)

  await createCronSchedule('dappform-tasks-stats', settings.getValue('cronSchedule'))

  saveSettings()
}

function renderSettings() {
  Object.keys(settings.settingsSchema).forEach((k:keyof Settings) => {
    const field = (document.querySelector(`[name=${k}]`) as HTMLInputElement)
    if (field) {
      field.value = settings.getValue(k) || ''
    }
    // sessionStorage.debug && console.debug(`Didn't have a HTML input for '${k}'`)
  })
}

function saveUserDefinedSettings() {
  Object.entries(settings.settingsSchema).filter(([key, readonly]) => {
    return !readonly
  }).forEach(([key, readonly]) => {
    settings.setValue(key as keyof Settings, (document.querySelector(`[name=${key}]`) as HTMLInputElement).value)
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

  if (!Store.store.settingsLoaded) {
    await loadSettings()
  }

  const settingsFields = renderSettingFields()

  const tpl = html`
    <h3>Settings</h3>

    <div class="grid-x grid-margin-x">
      <div class="cell small-6">
        <button class="button" on-click="${saveUserDefinedSettings}">Save</button>
        <button class="button success" on-click="${deployTasks}">Deploy Tasks</button>
        <button class="button success" on-click="${sendReports}">Send Reports</button>
        ${settingsFields}
      </div>
    </div>
  `
  render(tpl, el)
  renderSettings()
}
