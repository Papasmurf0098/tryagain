export class SaveSystem {
  constructor(storageKey = 'pokemon-boricua-save') {
    this.storageKey = storageKey;
  }

  isAvailable() {
    try {
      return typeof window !== 'undefined' && !!window.localStorage;
    } catch {
      return false;
    }
  }

  load() {
    if (!this.isAvailable()) return null;
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  save(state) {
    if (!this.isAvailable()) return false;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }

  clear() {
    if (!this.isAvailable()) return false;
    try {
      window.localStorage.removeItem(this.storageKey);
      return true;
    } catch {
      return false;
    }
  }
}
