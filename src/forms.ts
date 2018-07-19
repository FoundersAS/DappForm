import { v4 as uuid } from 'uuid'
import { encryptFile } from './util/crypto'
import { Submission, Answer, SubmissionMap, FormSubmissionMap } from './form-format'
import { putFile, getFile } from './util/write'

function sortSubmissions(submissions: Submission[]): FormSubmissionMap {
  return submissions.reduce((acc: FormSubmissionMap, cur: Submission) => {
    acc[cur.formUuid] = acc[cur.formUuid] || {} as SubmissionMap
    acc[cur.formUuid][cur.uuid] = cur
    return acc
  }, {} as FormSubmissionMap)
}

// TODO: make the request concurrent for performance if needed
async function updateFormSubmissions(forms: FormSubmissionMap) {
  for (const formUuid in forms) {
    const newSubmissions = forms[formUuid]
    const submissionsPath = `submissions/${formUuid}.json`

    const oldSubmissions = await getFile(submissionsPath) as SubmissionMap || {} as SubmissionMap

    console.debug(`form: ${formUuid} new submissions:`, newSubmissions)
    console.debug(`form: ${formUuid} old submissions:`, oldSubmissions)
    console.debug(`form: ${formUuid} old + new: `, { ...oldSubmissions, ...newSubmissions })
    await putFile(submissionsPath, { ...oldSubmissions, ...newSubmissions })
  }
}

export async function updateSubmissionsFromBench(submissions: Submission[]) {
  return updateFormSubmissions(sortSubmissions(submissions))
}

export function createDummySubmission(formUuid:string) {
  return {
    uuid: uuid(),
    formUuid,
    created: new Date(),
    answers: [{ questionUuid: '12345', name: 'privacy', value: 'IS GREAT' } as Answer]
  } as Submission
}
