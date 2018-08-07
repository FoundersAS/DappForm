import { Submission } from 'dappform-forms-api'

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

