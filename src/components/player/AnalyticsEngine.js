// AnalyticsEngine.js - Listens to EventBus signals to track system usage statistics

import { bus, EVENTS } from './EventBus';

export const AnalyticsEngine = {
  sessionMetrics: {
    skips: 0,
    mirrorsUsed: [],
    errors: 0,
    startTime: Date.now()
  },

  start() {
    this.unsubs = [
      bus.on(EVENTS.PLAYER_SEEK, () => this.sessionMetrics.skips++),
      bus.on(EVENTS.PROVIDER_CHANGE, (p) => this.sessionMetrics.mirrorsUsed.push(p)),
      bus.on(EVENTS.ERROR_ENCOUNTERED, () => this.sessionMetrics.errors++)
    ];
  },

  stop() {
    if (this.unsubs) {
      this.unsubs.forEach(unsub => unsub());
    }
  },

  log(eventName, metadata = {}) {
    const logItem = {
      event: eventName,
      metadata,
      sessionTime: Date.now() - this.sessionMetrics.startTime,
      metrics: { ...this.sessionMetrics }
    };
    console.log('[AnalyticsEngine] Dispatching record:', logItem);
    bus.emit(EVENTS.ANALYTICS_EVENT, logItem);
  }
};
