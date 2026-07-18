// PersistenceEngine.js - Serializes playback progress, preferences, and profile configs

const STORAGE_KEYS = {
  PLAYBACK_POS: 'player_os_positions',
  PREFS: 'player_os_preferences',
  HISTORY: 'player_os_watch_history',
  PINNED: 'player_os_pinned'
};

export const PersistenceEngine = {
  savePosition(mediaId, epNum, time, duration) {
    const positions = this._get(STORAGE_KEYS.PLAYBACK_POS);
    const key = epNum ? `${mediaId}_ep${epNum}` : mediaId;
    positions[key] = { time, duration, percent: Math.round((time / duration) * 100), timestamp: Date.now() };
    this._set(STORAGE_KEYS.PLAYBACK_POS, positions);
  },

  getPosition(mediaId, epNum) {
    const positions = this._get(STORAGE_KEYS.PLAYBACK_POS);
    const key = epNum ? `${mediaId}_ep${epNum}` : mediaId;
    return positions[key] || null;
  },

  savePreference(key, val) {
    const prefs = this._get(STORAGE_KEYS.PREFS);
    prefs[key] = val;
    this._set(STORAGE_KEYS.PREFS, prefs);
  },

  getPreference(key, fallback) {
    const prefs = this._get(STORAGE_KEYS.PREFS);
    return prefs[key] !== undefined ? prefs[key] : fallback;
  },

  togglePinned(mediaId) {
    const pinned = this._get(STORAGE_KEYS.PINNED);
    const idx = pinned.indexOf(mediaId);
    if (idx > -1) pinned.splice(idx, 1);
    else pinned.push(mediaId);
    this._set(STORAGE_KEYS.PINNED, pinned);
    return pinned.includes(mediaId);
  },

  isPinned(mediaId) {
    return this._get(STORAGE_KEYS.PINNED).includes(mediaId);
  },

  _get(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || (key === STORAGE_KEYS.PINNED ? '[]' : '{}'));
    } catch {
      return key === STORAGE_KEYS.PINNED ? [] : {};
    }
  },

  _set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
};
