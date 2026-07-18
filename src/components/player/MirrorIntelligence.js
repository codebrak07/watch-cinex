// MirrorIntelligence.js - Tracks mirror reliability, startup speed, and buffer statistics

import { PersistenceEngine } from './PersistenceEngine';

export const MirrorIntelligence = {
  // Ranks mirror options based on persistent analytics score
  getRankedMirrors() {
    const stats = PersistenceEngine.getPreference('mirror_stats', {});
    const defaultList = ['vidsrc_to', 'vidsrc_xyz', 'embed_su'];
    
    // Sort mirrors by reliability score: (Success Rate * 100) - (Avg Startup Time)
    return defaultList.sort((a, b) => {
      const statsA = stats[a] || { successRate: 1, avgStartup: 1500 };
      const statsB = stats[b] || { successRate: 1, avgStartup: 1500 };
      const scoreA = (statsA.successRate * 1000) - statsA.avgStartup;
      const scoreB = (statsB.successRate * 1000) - statsB.avgStartup;
      return scoreB - scoreA;
    });
  },

  // Record mirror performance metrics
  logPerformance(provider, startupTime, failed = false) {
    const stats = PersistenceEngine.getPreference('mirror_stats', {});
    const pStats = stats[provider] || { count: 0, successes: 0, avgStartup: 1500 };
    
    pStats.count += 1;
    if (!failed) {
      pStats.successes += 1;
      pStats.avgStartup = Math.round(((pStats.avgStartup * (pStats.successes - 1)) + startupTime) / pStats.successes);
    }
    
    pStats.successRate = pStats.successes / pStats.count;
    stats[provider] = pStats;
    
    PersistenceEngine.savePreference('mirror_stats', stats);
    console.log(`[MirrorIntelligence] Logged metrics for ${provider}:`, pStats);
  }
};
export default MirrorIntelligence;
