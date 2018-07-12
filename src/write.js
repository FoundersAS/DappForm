const { blockstack } = window; // hax
export async function putFile(path, contents) {
    await blockstack.putFile(path, JSON.stringify(contents));
}
export async function getFile(path) {
    const contents = await blockstack.getFile(path);
    return JSON.parse(contents);
}
