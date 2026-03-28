export const CURRENT_SAVE_VERSION = 1;

export class SaveSystem {
  constructor(storageKey = 'project-tidelight-save', legacyKeys = ['pokemon-boricua-save']) {
    this.storageKey = storageKey;
    this.legacyKeys = legacyKeys;
    this.disabled = false;
  }

  isAvailable() {
    try {
      return !this.disabled && typeof window !== 'undefined' && !!window.localStorage;
    } catch {
      return false;
    }
  }

  setDisabled(disabled) {
    this.disabled = Boolean(disabled);
  }

  load() {
    if (!this.isAvailable()) return null;
    try {
      const candidateKeys = [this.storageKey, ...this.legacyKeys];
      const raw = candidateKeys
        .map((key) => window.localStorage.getItem(key))
        .find(Boolean);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      return migrateSaveEnvelope(parsed)?.state ?? null;
    } catch {
      return null;
    }
  }

  save(state) {
    if (!this.isAvailable()) return false;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify({
        version: CURRENT_SAVE_VERSION,
        state,
      }));
      return true;
    } catch {
      return false;
    }
  }

  clear() {
    if (!this.isAvailable()) return false;
    try {
      window.localStorage.removeItem(this.storageKey);
      for (const key of this.legacyKeys) window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
}

function migrateSaveEnvelope(parsed) {
  if (!isObject(parsed)) return null;

  let envelope = isEnvelope(parsed)
    ? { version: parsed.version, state: parsed.state }
    : { version: 0, state: parsed };

  while (envelope.version < CURRENT_SAVE_VERSION) {
    const migrate = SAVE_MIGRATIONS[envelope.version];
    if (!migrate) return null;
    envelope = migrate(envelope.state);
  }

  return envelope.version === CURRENT_SAVE_VERSION && isObject(envelope.state)
    ? envelope
    : null;
}

const SAVE_MIGRATIONS = {
  0: (legacyState) => ({
    version: 1,
    state: legacyState,
  }),
};

function isEnvelope(value) {
  return Number.isInteger(value.version) && 'state' in value;
}

function isObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}
