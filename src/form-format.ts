export interface Question {
  label: string,
  type: string,
  name: string,
  uuid: string,
  created: Date,
  modified: Date,
}

interface FormBasic {
  uuid: string,
  name: string
  authorPubKey: string

  created: Date,
  modified: Date,

  introText: string,
  confirmationText: string,
}

interface FormExpanded {
  questions: Question[],
}

export interface Form extends FormBasic, FormExpanded {
  weeklyReportEnabled: boolean,
  weeklyLastSent: Date,
}

export interface Submission {
  uuid: string,
  formUuid: string,
  created: Date,
  answers: Answer[]
}

export interface Answer {
  questionUuid: string,
  name: string,
  value: string,
}

export interface SubmissionMap {
  [key: string]: Submission
}

export interface FormSubmissionMap {
  [key: string]: SubmissionMap
}
