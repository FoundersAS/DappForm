import BlockstackUtils from '../../util/blockstackUtils'
import { html, render } from '../../../node_modules/lit-html/lib/lit-extended'
import  * as settings from '../../settings'

import { createWebTaskTask, createCronSchedule } from '../../util/webtask';
import { loadSettings, Settings } from '../../settings'
import Store from '../../store'
import { TemplateResult } from 'lit-html'

interface SettingViewModel {
  key: string
  value: string
  readonly: boolean
  label: string
  helpText: string
  type: "text" | "number" | "email"
  matchPromise: Promise<TemplateResult>
  required: boolean
}

type tuple = [keyof Settings, boolean]

function sendReports() {
  fetch(settings.getValue('statsTaskUrl')).then(console.log,console.warn).catch(console.warn)
}

export const codeBases = <{readonly[k: string]: string}>{
  hostingTaskUrl:   'https://raw.githubusercontent.com/FoundersAS/dappform-tasks-form-hosting/master/package.json',
  submissionTaskUrl:'https://raw.githubusercontent.com/FoundersAS/dappform-tasks-submissions/master/package.json',
  statsTaskUrl:     'https://raw.githubusercontent.com/FoundersAS/dappform-tasks-stats/master/package.json',
  tasksViewCounter: 'https://raw.githubusercontent.com/FoundersAS/dappform-tasks-view-counter/master/package.json',
}

async function deployTasks() {
  createWebTaskTask(
    'dappform-tasks-host',
    "https://raw.githubusercontent.com/FoundersAS/dappform-tasks-form-hosting/master/index.js",
    "https://raw.githubusercontent.com/FoundersAS/dappform-tasks-form-hosting/master/package.json",
    {
    })
    .then(result=> settings.setValue('hostingTaskUrl', result.webtask_url)).catch(console.error)
    .then(() => Save.scheduleSave())

  createWebTaskTask(
    'dappform-tasks-host',
    "https://raw.githubusercontent.com/FoundersAS/dappform-tasks-form-hosting/master/index.js",
    "https://raw.githubusercontent.com/FoundersAS/dappform-tasks-form-hosting/master/package.json",
    {
    }
  ).then(result => settings.setValue('hostingTaskUrl', result.webtask_url)).catch(console.error)
    .then(() => Save.scheduleSave())

  createWebTaskTask(
    'dappform-tasks-view-counter',
    "https://raw.githubusercontent.com/FoundersAS/dappform-tasks-view-counter/master/index.js",
    "https://raw.githubusercontent.com/FoundersAS/dappform-tasks-view-counter/master/package.json",
    {
      ...BlockstackUtils.getBlockstackLocalStorage(),
      // WEBTASK_ID
      // WEBTASK_TOKEN
    },
  ).then(result => settings.setValue('tasksViewCounter', result.webtask_url)).catch(console.error)
    .then(() => Save.scheduleSave())

  createWebTaskTask(
    'dappform-tasks-submission',
    'https://raw.githubusercontent.com/FoundersAS/dappform-tasks-submissions/master/index.js',
    'https://raw.githubusercontent.com/FoundersAS/dappform-tasks-submissions/master/package.json',
    {...BlockstackUtils.getBlockstackLocalStorage(),
      BLOCKSTACK_APP_PRIVATE_KEY: new BlockstackUtils().privateKey},
    )
    .then(result => settings.setValue('submissionTaskUrl', result.webtask_url)).catch(console.error)
    .then(() => Save.scheduleSave())

  createWebTaskTask(
    'dappform-tasks-stats',
    'https://raw.githubusercontent.com/FoundersAS/dappform-tasks-stats/master/index.js',
    'https://raw.githubusercontent.com/FoundersAS/dappform-tasks-stats/master/package.json',
    { ... BlockstackUtils.getBlockstackLocalStorage(),
      POSTMARK_TOKEN: settings.getValue('postmarkToken'),
      POSTMARK_FROM: settings.getValue('postmarkFrom'),
      POSTMARK_TO: settings.getValue('email')
    }
  ).then(result => settings.setValue('statsTaskUrl', result.webtask_url)).catch(console.error)
    .then(() => Save.scheduleSave())

  createCronSchedule('dappform-tasks-stats', settings.getValue('cronSchedule'))
    .catch(console.error)
}

class Save {
  static scheduled:boolean
  static async scheduleSave (delay:number = 1) {
    if (!Save.scheduled) {
      Save.scheduled = true
      await wait(delay)
      await Promise.all( [update(),settings.saveSettings()] )
      Save.scheduled = false
    }
  }
}

function wait (sec:number) {
  return new Promise(resolve => setTimeout(() => resolve(), sec * 1000))
}

async function saveUserDefinedSettings() {
  Object.entries(settings.settingsSchema)
    .filter(([key, readonly]:tuple) => !readonly)
    .forEach(([key]:tuple) => {
      settings.setValue(key, (document.querySelector(`[name=${key}]`) as HTMLInputElement).value)
  })

  await settings.saveSettings()
  update()
}

export async function update() {
  const el = document.querySelector('settings-view')
  let helpText:string
  if (!Store.store.settingsLoaded) {
    await loadSettings()
  }
  const rows:SettingViewModel[] = Object.entries(settings.settingsSchema).map(([key, readonly]:tuple) => {
    let deployedVersionPromise:Promise<string|void>
    let githubVersionPromise:Promise<string|void>
    let matchPromise:Promise<TemplateResult>

    const lookupVersionForKey = readonly // it just so happens that the read-only keys are all web tasks
    if (settings.getValue(key) && lookupVersionForKey) {
      const url = new URL(settings.getValue(key))
      url.pathname = `${url.pathname}/version`
      deployedVersionPromise = fetch(url.toString())
        .then(res => (res.status < 300) ? res.text() : Promise.reject("Status not 200 for "+ res.url))
        .catch(reason => console.warn(`Getting deployed version failed ${url.toString()}. `, reason))

      githubVersionPromise = fetch(codeBases[key])
        .then(res => (res.status < 300) ? res.json() : Promise.reject("Status not 200 for "+codeBases[key]))
        .then(packageJson => (typeof packageJson === "object") ? `${packageJson.version}` : "0.0.0")
        .catch(reason => console.warn("Getting latest version failed. ", reason))

      matchPromise = Promise.all([deployedVersionPromise, githubVersionPromise])
          .then(([deployed, githubVer]) => {
            const match = (deployed === githubVer) ? html`<span class="label secondary">Up to date</span>` : html`<span class="label success">New code available!</span>`
            return html`
                ${match}
                Deployed ${deployed} --
                Latest ${githubVer}
              `
            })

      // matchPromise.then(m => console.log(m))
    }

    const value = settings.getValue(key)
    const type = key.includes("email") ? "email" : "text"
    const required = false

    return <SettingViewModel>{
      type,
      readonly,
      key,
      value,
      helpText,
      matchPromise,
      required,
    }
  })

  const tpl = html`
    <h3>Settings</h3>

    <div class="grid-x grid-margin-y">
      <div class="cell medium-12">
        <button class="button" on-click="${saveUserDefinedSettings}">Save</button>
        <button class="button success" on-click="${deployTasks}">Deploy Tasks</button>
        <button class="button success" on-click="${sendReports}">Send Reports</button>
      </div>
      
      <form class="grid-x grid-margin-x grid-margin-y">
        ${rows.map((vm) => html`            
          <div class="cell medium-6">
            <label>
              ${vm.key}
              <input type="${vm.type}" name="${vm.key}" value="${vm.value}" readonly?=${vm.readonly} required?=${vm.readonly}>
            </label>
            <p class="help-text">
                ${vm.helpText}               
                <span>${vm.matchPromise}</span>
            </p>
          </div>
        `)}
      </form>
    </div>
  `
  render(tpl, el)
}
