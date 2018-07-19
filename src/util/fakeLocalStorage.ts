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

export function createLocalStorage(initData: any) {
  const storage = {
    getItem: getItem,
    setItem: setItem,
    removeItem: removeItem
  } as any

  Object.keys(initData).forEach(key => {
    storage.setItem(key, initData[key])
  })

  return storage
}

export function getBlockstackData (ls:any) {
  return {
    blockstack: ls.getItem('blockstack'),
    gaia: ls.getItem('blockstack-gaia-hub-config'),
    key: ls.getItem('blockstack-transit-private-key')
  } as any
}
