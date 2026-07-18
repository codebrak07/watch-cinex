// LifecycleManager.js - Operating System-like Lifecycle State Manager

import { bus, EVENTS } from './EventBus';

export const LIFECYCLE_STATES = {
  BOOT: 'BOOT',
  INITIALIZING: 'INITIALIZING',
  LOADING_PLAYBACK: 'LOADING_PLAYBACK',
  READY: 'READY',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  SEEKING: 'SEEKING',
  DESTROYED: 'DESTROYED'
};

export class LifecycleManager {
  constructor() {
    this.state = LIFECYCLE_STATES.BOOT;
    this.listeners = [];
  }

  transition(nextState) {
    if (this.state === LIFECYCLE_STATES.DESTROYED) {
      console.warn('[LifecycleManager] Cannot transition from DESTROYED state.');
      return;
    }

    const previousState = this.state;
    this.state = nextState;
    console.log(`[LifecycleManager] Transitioned: ${previousState} ➔ ${nextState}`);
    
    // Notify all listeners
    this.listeners.forEach(cb => {
      try {
        cb(nextState, previousState);
      } catch (err) {
        console.error('[LifecycleManager] Listener callback crash:', err);
      }
    });

    bus.emit(EVENTS.NOTIFICATION_PUSH, { message: `Lifecycle: ${nextState}`, type: 'lifecycle' });
  }

  onStateChange(cb) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== cb);
    };
  }

  destroy() {
    this.transition(LIFECYCLE_STATES.DESTROYED);
    this.listeners = [];
  }
}

export const lifecycle = new LifecycleManager();
export default lifecycle;
