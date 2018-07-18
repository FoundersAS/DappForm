const cache = {} as any;

function getItem(key:string) {
  return cache[key]
};

function setItem(key:string, item:string) {
  cache[key] = item;
};

function removeItem(key:string) {
  cache[key] = null;
};

export const localStorage = {
  getItem: getItem,
  setItem: setItem,
  removeItem: removeItem
} as any

export function getBlockstackData (ls:Storage) {
  return {
    blockstack: ls.getItem('blockstack'),
    gaia: ls.getItem('blockstack-gaia-hub-config'),
    key: ls.getItem('blockstack-transit-private-key')
  } as any
}
