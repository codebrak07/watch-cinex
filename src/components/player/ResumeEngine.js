// ResumeEngine.js - Decoupled state evaluation for continue watching options

import { PersistenceEngine } from './PersistenceEngine';

export const ResumeEngine = {
  // Evaluates playback options for a given movie/episode
  evaluate(mediaId, epNum) {
    const record = PersistenceEngine.getPosition(mediaId, epNum);
    if (!record) return { showLanding: false, startTime: 0 };
    
    // Play from beginning if watched >95%
    if (record.percent >= 95) {
      return { showLanding: false, startTime: 0 };
    }

    return {
      showLanding: true,
      startTime: record.time,
      duration: record.duration,
      percent: record.percent
    };
  }
};
