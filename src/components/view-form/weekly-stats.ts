import { Form, Submission } from 'dappform-forms-api'

export type WeeklyStatsRaw = {
  total: number,
  lastWeek: number,
}

export function weeklyStats (submissions:Submission[]):WeeklyStatsRaw {
  const lastWeek = submissions
    .filter((s:Submission) => new Date().getTime() - new Date(s.created).getTime() < new Date().getTime() - 7 * 24 * 60 * 60 * 1000).length

  const total = submissions.length
  return {total, lastWeek}
}

export async function generateReport (form: Form, postmarkFrom:string, postmarkKey:string) {
  const endpoint = new URL('https://wt-c0c4a39020d4e9619a8996325cdfa5dc-0.sandbox.auth0-extend.com/dapp-form-reporting')
  const body = {
    'blockstack': localStorage.getItem('blockstack'),
    'blockstack-gaia-hub-config': localStorage.getItem('blockstack-gaia-hub-config'),
    'blockstack-transit-private-key': localStorage.getItem('blockstack-transit-private-key'),
    'postmark-key': postmarkKey,
    'postmark-from': form.weeklyReportRecipient || postmarkFrom,
  }

  const res = await fetch(endpoint.toString(), <RequestInit>{
    mode: 'cors',
    method: 'POST',
    body: JSON.stringify(body),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  })
}