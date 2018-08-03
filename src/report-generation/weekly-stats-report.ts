import { Form, Submission, getForm, getFormSubmissions } from 'dappform-forms-api'

export type WeeklyStatsRaw = {
  total: number,
  lastWeek: number,
}

export type WeeklyStatsParams = {
  privateKey: string,
  formUuid: string,
}

export function weeklyStats (submissions:Submission[]):WeeklyStatsRaw {
  const lastWeek = submissions
    .filter((s:Submission) => new Date().getTime() - new Date(s.created).getTime() < new Date().getTime() - 7 * 24 * 60 * 60 * 1000).length

  const total = submissions.length
  return {total, lastWeek}
}

export function weeklyReportTextFormat (form:Form, report:WeeklyStatsRaw):string {
  return `
  Form '${form.name}' got ${report.lastWeek} new submissions last week, adding up to ${report.total} total.
  (uuid ${form.uuid})
   `.trim()
}

export async function enableWeeklyReporting (uuid: string) {


}

export async function makeReport (params:WeeklyStatsParams):Promise<string> {
  const map = await getFormSubmissions(params.formUuid)
  const stats = weeklyStats(Object.values(map))

  const form = await getForm(params.formUuid)
  const reportText = weeklyReportTextFormat(form, stats)

  return reportText
}
