import { putFile, getFile } from "./util/write";
import { EventEmitter } from "events";

interface SettingSchema {
  [k: string]: boolean
}

// set wether readonly is true or false
export const settingsSchema: SettingSchema = {
  email: false,
  cronSchedule: false,
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
