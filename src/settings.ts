import { putFile, getFile } from "./util/write";
import { EventEmitter } from "events";

interface SettingSchema {
  [k: string]: boolean
}

// set wether readonly is true or false
export const settingsSchema: SettingSchema = {
  email: false,
  webtaskId: false,
  webtaskToken: false,
  postmarkToken: false,
  postmarkFrom: false,
  submissionTaskUrl: true,
  hostingTaskUrl: true,
  statsTaskUrl: true,
}
interface Settings {
  [k: string]: string
}

let settings: Settings = <Settings>{}

export const events = new EventEmitter()

export function getWebtaskId():string { return settings.webtaskId }
export function getWebtaskToken(): string { return settings.webtaskToken }
export function getSubmissionTaskUrl(): string { return settings.submissionTaskUrl }
export function getHostingTaskUrl(): string { return settings.hostingTaskUrl }
export function getStatsTaskUrl(): string { return settings.statsTaskUrl }

export function setWebtaskId(value: string): void { settings.webtaskId = value }
export function setWebtaskToken(value: string): void { settings.webtaskToken = value }
export function setSubmissionTaskUrl(value: string): void { settings.submissionTaskUrl = value }
export function setHostingTaskUrl(value: string): void { settings.hostingTaskUrl = value }
export function setStatsTaskUrl(value: string): void { settings.statsTaskUrl = value }

export function getValue(key: string): string {
  return settings[key]
}

export function setValue(key: string, value: string): void {
  settings[key] = value
}

export async function loadSettings() {
  getFile('settings.json').then(async (s: Settings) => {
    console.log('Settings from storage: ', s)
    if (typeof s === "object") {
      settings = {...settings, ...s}
    }
    events.emit('load')
  })
}

export async function saveSettings() {
  console.assert(typeof settings === "object", 'settings must be an object')
  await putFile('settings.json', settings)
  console.log('Settings Saved: ', settings)
  events.emit('save')
}
