// CapabilityDetector.js - Detects environment specifications (Touch, PIP, Fullscreen, MediaSession)

export const CapabilityDetector = {
  detect() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasPip = document.pictureInPictureEnabled || false;
    const hasFullscreen = document.fullscreenEnabled || document.webkitFullscreenEnabled || false;
    const hasMediaSession = 'mediaSession' in navigator;
    
    // Check if the current agent suggests TV Browser (e.g. Tizen, webOS, Chrome-based TV agent)
    const ua = navigator.userAgent.toLowerCase();
    const isTv = ua.includes('smart-tv') || ua.includes('tizen') || ua.includes('webos') || ua.includes('googletv') || ua.includes('appletv') || ua.includes('hbbtv');

    const capabilities = {
      touch: isTouch,
      pip: hasPip,
      fullscreen: hasFullscreen,
      mediaSession: hasMediaSession,
      tvDevice: isTv
    };

    console.log('[CapabilityDetector] Detected Capabilities:', capabilities);
    return capabilities;
  }
};
