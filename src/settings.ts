import { putFile, getFile } from "./util/write";
import { EventEmitter } from "events";
interface Settings {
  webtaskId: string,
  webtaskToken: string,
  submissionTaskUrl: string,
  hostingTaskUrl: string,
  statsTaskUrl: string
}

let settings = {} as Settings
loadSettings()

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

async function loadSettings() {
  getFile('settings.json').then((s: Settings) => {
    settings = s
    console.log('Settings Loaded: ', settings)
    events.emit('load')
  })
}

export async function saveSettings() {
  await putFile('settings.json', settings)
  console.log('Settings Saved: ', settings)
}
