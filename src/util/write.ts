const blockstack = require('blockstack')

export async function putFile(path: string, contents: Object, encrypt=true): Promise<void> {
  try {
    await blockstack.putFile(path, JSON.stringify(contents), {encrypt})
  }
  catch (e) {
    console.error(e)
  }
}

export async function getFile(path: string): Promise<Object | Boolean> {
  let json
  let parsed
  try {
    json = await blockstack.getFile(path)
  }
  catch (e) {
    console.log(`getFile failed`)
    console.error(e)
    return false
  }
  try {
    parsed = JSON.parse(json)
  }
  catch (e) {
    console.log(`JSON.parse getFile contents failed`)
    console.error(e)
    return false
  }
  return parsed
}
