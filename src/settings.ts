import { putFile, getFile } from "./util/write";
import Store from './store'

type Booleanify<T> = {
  [P in keyof T]: boolean
}

export interface Settings {
  email: string
  cronSchedule: string
  webtaskId: string
  webtaskToken: string
  postmarkToken: string
  webhookUrl: string
  postmarkFrom: string
  submissionTaskUrl: string
  hostingTaskUrl: string
  statsTaskUrl: string
  tasksViewCounter: string
}

// set wether readonly is true or false
export const settingsSchema: Booleanify<Settings> = {
  email: false,
  cronSchedule: false,
  webtaskId: false,
  webtaskToken: false,
  postmarkToken: false,
  postmarkFrom: false,
  submissionTaskUrl: true,
  hostingTaskUrl: true,
  statsTaskUrl: true,
  tasksViewCounter: true,
  webhookUrl: false,
}

export function getValue(key: keyof Settings): string {
  return Store.store.settings[key]
}

export function setValue(key: keyof Settings, value: string): void {
  Store.store.settings[key] = value
}

export async function loadSettings() {
  const s = await getFile('settings.json')
  if (typeof s === "object") {
    console.log('Settings from storage: ', s)
    Store.setSettingsAction({...s as Settings, ...Store.store.settings})
    Store.setSettingsLoadedAction(true)
  }
  else {
    console.warn("Failed loading settings from storage")
  }
}

export async function saveSettings() {
  await putFile('settings.json', Store.store.settings)
}
