
const SESSION_KEY = 'LATEST_REQUEST';
const NONCE_MEMORY_KEY = 'NONCE_MEMORY';

function withJSON(key, def, callback) {
  const map = JSON.parse(window.localStorage.getItem(key));
  const newMap = callback(map || def);
  if (newMap !== undefined) {
    window.localStorage.setItem(key, JSON.stringify(newMap));
  }
}

class StorageManager {
  get latestRequest() {
    return JSON.parse(window.localStorage.getItem(SESSION_KEY));
  }

  set latestRequest(val) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(val));
  }

  rememberNonce(nonce) {
    withJSON(NONCE_MEMORY_KEY, [], (array) => {
      array.push(nonce);
      return array;
    });
  }

  knowsNonce(nonce) {
    let knows = false;
    withJSON(NONCE_MEMORY_KEY, [], (array) => {
      knows = array.includes(nonce);
    });
    return knows;
  }
}

const Persist = new StorageManager();
export default Persist;
