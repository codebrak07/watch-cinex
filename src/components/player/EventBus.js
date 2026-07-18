// EventBus.js - Centralized event emitter for PlayerOS architecture

class EventBus {
  constructor() {
    this.listeners = {};
  }

  // Subscribe to an event
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  // Unsubscribe from an event
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  // Publish an event
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error(`[EventBus] Error in callback for event "${event}":`, err);
      }
    });
  }
}

export const bus = new EventBus();

// Core PlayerOS Events Constants
export const EVENTS = {
  PLAYER_PLAY: 'PLAYER_PLAY',
  PLAYER_PAUSE: 'PLAYER_PAUSE',
  PLAYER_SEEK: 'PLAYER_SEEK',
  PLAYER_ENDED: 'PLAYER_ENDED',
  
  INPUT_ARROW: 'INPUT_ARROW',
  INPUT_SELECT: 'INPUT_SELECT',
  INPUT_BACK: 'INPUT_BACK',
  INPUT_MEDIA_TOGGLE: 'INPUT_MEDIA_TOGGLE',
  
  OVERLAY_STATE_CHANGE: 'OVERLAY_STATE_CHANGE',
  
  PREF_CHANGE: 'PREF_CHANGE',
  EPISODE_CHANGE: 'EPISODE_CHANGE',
  PROVIDER_CHANGE: 'PROVIDER_CHANGE',
  
  NOTIFICATION_PUSH: 'NOTIFICATION_PUSH',
  THEME_UPDATE: 'THEME_UPDATE',
  ANALYTICS_EVENT: 'ANALYTICS_EVENT',
  ERROR_ENCOUNTERED: 'ERROR_ENCOUNTERED'
};
