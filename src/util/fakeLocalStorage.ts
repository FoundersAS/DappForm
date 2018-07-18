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
