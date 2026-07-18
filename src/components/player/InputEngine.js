// InputEngine.js - Intercepts and normalizes hardware input events for PlayerOS

import { bus, EVENTS } from './EventBus';

export const InputEngine = {
  active: false,

  start() {
    if (this.active) return;
    this.active = true;
    window.addEventListener('keydown', this.handleKeyDown);
  },

  stop() {
    if (!this.active) return;
    this.active = false;
    window.removeEventListener('keydown', this.handleKeyDown);
  },

  handleKeyDown(e) {
    // Normalization graph mapping
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        bus.emit(EVENTS.INPUT_ARROW, 'up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        bus.emit(EVENTS.INPUT_ARROW, 'down');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        bus.emit(EVENTS.INPUT_ARROW, 'left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        bus.emit(EVENTS.INPUT_ARROW, 'right');
        break;
      case 'Enter':
        e.preventDefault();
        bus.emit(EVENTS.INPUT_SELECT);
        break;
      case 'Escape':
      case 'Backspace':
        e.preventDefault();
        bus.emit(EVENTS.INPUT_BACK);
        break;
      case ' ':
      case 'Spacebar':
      case 'MediaPlayPause':
        e.preventDefault();
        bus.emit(EVENTS.INPUT_MEDIA_TOGGLE);
        break;
      default:
        break;
    }
  }
};
