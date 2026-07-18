// AudioFeedback.js - Custom UI sound generator using Web Audio API

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const AudioFeedback = {
  muted: localStorage.getItem('tv_ui_sound_muted') === 'true',

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('tv_ui_sound_muted', this.muted ? 'true' : 'false');
    return this.muted;
  },

  // Focus navigation transition sound (soft low click)
  playFocus() {
    if (this.muted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime); // Low freq click
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.04);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('AudioFeedback focus audio failed:', e);
    }
  },

  // Button select/activation sound (bright metallic ping)
  playSelect() {
    if (this.muted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // High tick
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('AudioFeedback select audio failed:', e);
    }
  },

  // Navigation exit/back sound (double quick descending pitch)
  playBack() {
    if (this.muted) return;
    try {
      const ctx = getAudioContext();
      const playStep = (delay, freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + delay + 0.06);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.07);
      };

      playStep(0, 300);
      playStep(0.05, 200);
    } catch (e) {
      console.warn('AudioFeedback back audio failed:', e);
    }
  },

  // Side quick panel opening slide sound (whoosh sweep)
  playPanelOpen() {
    if (this.muted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.08);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch (e) {
      console.warn('AudioFeedback panel open audio failed:', e);
    }
  }
};
