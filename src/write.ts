const {blockstack} = window as any // hax

export async function putFile (path: string, contents: Object) {
  await blockstack.putFile(path, JSON.stringify(contents))
}

export async function getFile (path: string) {
  const contents = await blockstack.getFile(path)
  return JSON.parse(contents)
}