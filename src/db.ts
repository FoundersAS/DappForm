// const trivialdb = require('trivialdb');

// import { nSQL } from 'nano-sql';
// import { TrivialAdapter } from 'nano-trivial';

const { blockstack } = window as any // hax
const { TrivialAdapter } = window as any // hax
const { nSQL } = window as any // hax

const readFunc = (path: string) => {
  console.log('read path: ', path);
  return blockstack.getFile(path).then((s?: string) => {
    if (s === null) return {};
    return JSON.parse(s);
  });
};

const writeFunc = (path: string, jsonStr: string) => {
  console.log('write path: ', path);
  console.log('json string: ', jsonStr);
  return blockstack.putFile(path, jsonStr);
};

const nSQLTrivialTableConfig = { writeFunc, readFunc };
const nSQLTrivialNamespaceConfig = {};
const nSQLFormModel = [
  { key: 'id', type: 'int', props: ['pk', 'ai'] },
  { key: 'name', type: 'string' }
]; // needs to be properly defined

nSQL('forms')
  .model(nSQLFormModel)
  .config({
    mode: new TrivialAdapter(nSQLTrivialNamespaceConfig, nSQLTrivialTableConfig)
  })
  .connect().then((result: any) => console.log('connect result: ', result));

// nSQL().onConnected(() => {
//   console.log('nSQL - connected');

//   nSQL('forms').query('select').where(['name', 'LIKE', 'Test']).exec().then((rows) => {
//     console.log('rows: ', rows);
//   });
// });

// nSQL('forms').on('change', change => console.log('form change event: ', change));

export async function addForm (name: string) {
  await nSQL('forms').query('upsert', { name }).exec()
}