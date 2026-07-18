// ErrorRecoveryEngine.js - Handles streaming recovery, mirror fallbacks, and buffer timeouts

import { bus, EVENTS } from './EventBus';

export const ErrorRecoveryEngine = {
  detectHang(bufferedTime, currentTime, isPlaying) {
    // If player is playing but not progressing and buffer matches currentTime
    if (isPlaying && bufferedTime > 0 && Math.abs(bufferedTime - currentTime) < 0.1) {
      console.warn('[ErrorRecoveryEngine] Stalled state detected.');
      return true;
    }
    return false;
  },

  suggestMirrorFallback(currentProvider) {
    const list = ['vidsrc_to', 'vidsrc_xyz', 'embed_su'];
    const idx = list.indexOf(currentProvider);
    const nextIdx = (idx + 1) % list.length;
    const nextMirror = list[nextIdx];

    bus.emit(EVENTS.ERROR_ENCOUNTERED, {
      message: 'Mirror stalled. Switching source.',
      fallback: nextMirror
    });

    return nextMirror;
  }
};
