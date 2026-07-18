// PlaybackAdapter.js - Unified Player Adapter Abstraction for multiple backends

import { bus, EVENTS } from './EventBus';

export class PlaybackAdapter {
  constructor(elementRef, type) {
    this.ref = elementRef;
    this.type = type; // 'html5' or 'iframe'
    this.speed = 1;
    this.volume = 1;
  }

  play() {
    if (this.type === 'html5' && this.ref.current) {
      this.ref.current.play().catch(e => console.warn('HTML5 play failed:', e));
    }
    bus.emit(EVENTS.PLAYER_PLAY);
  }

  pause() {
    if (this.type === 'html5' && this.ref.current) {
      this.ref.current.pause();
    }
    bus.emit(EVENTS.PLAYER_PAUSE);
  }

  seek(time) {
    if (this.type === 'html5' && this.ref.current) {
      this.ref.current.currentTime = time;
    }
    bus.emit(EVENTS.PLAYER_SEEK, time);
  }

  setSpeed(speed) {
    this.speed = speed;
    if (this.type === 'html5' && this.ref.current) {
      this.ref.current.playbackRate = speed;
    }
    bus.emit(EVENTS.PREF_CHANGE, { key: 'speed', val: speed });
  }

  setVolume(vol) {
    this.volume = vol;
    if (this.type === 'html5' && this.ref.current) {
      this.ref.current.volume = vol;
    }
    bus.emit(EVENTS.PREF_CHANGE, { key: 'volume', val: vol });
  }
}
