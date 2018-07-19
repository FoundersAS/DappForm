import { Form } from '../form-format'

const blockstack = require('blockstack')

export async function putFile(path: string, contents: Object): Promise<Object | Boolean> {
  try {
    const result = await blockstack.putFile(path, JSON.stringify(contents))
    return result
  }
  catch (e) {
    console.error(e)
    return false
  }
}

export async function getFile (path: string): Promise<Object | Boolean> {
  try {
    console.log('he')
    const contents = await blockstack.getFile(path)
    console.log("xxx", contents)
    return JSON.parse(contents)
  }
  catch (e) {
    console.error(e)
    return false
  }
}

export function getForm(uuid:string):Promise<Form|false> {
  const form = getFile(`forms/${uuid}.json`)
  return (form as any) || false
}
