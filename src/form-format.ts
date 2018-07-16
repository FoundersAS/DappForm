
interface Question {
  label: string,
  type: string,
  name: string,
  uuid: string,
  created: Date,
  modified: Date,
}

interface FormFormat {
  uuid: string,
  name: string,

  created: Date,
  modified: Date,

  introText: string,
  confirmationText: string,

  questions: Question[],
}

interface FormSubmission {
  uuid: string,
  formUuid: string,
  created: Date,
  answers: Answer[]
}

interface Answer {
  questionUuid: string,
  name: string,
  value: string,
}