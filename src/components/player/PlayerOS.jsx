// PlayerOS.jsx - Decoupled kernel bootstrap and service registry container

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Subsystems Core Imports
import { kernel } from './PlayerOSKernel';
import { bus, EVENTS } from './EventBus';
import { pipeline } from './MiddlewarePipeline';
import { lifecycle, LIFECYCLE_STATES } from './LifecycleManager';
import { CapabilityDetector } from './CapabilityDetector';
import { InputEngine } from './InputEngine';
import { PlaybackAdapter } from './PlaybackAdapter';
import { PersistenceEngine } from './PersistenceEngine';
import { ResumeEngine } from './ResumeEngine';
import { MirrorIntelligence } from './MirrorIntelligence';
import { ExperienceEngine } from './ExperienceEngine';
import { useTVFocus } from './TVFocusEngine';

// Components
import ThemeEngine from './ThemeEngine';
import NotificationEngine from './NotificationEngine';
import ResumeManager from './ResumeManager';
import TVOverlay from './TVOverlay';
import QuickPanel from './QuickPanel';
import DeveloperTools from './DeveloperTools';

export default function PlayerOS({ media, onClose, onMediaUpdate }) {
  const localPlayerRef = useRef(null);
  const adapterRef = useRef(null);
  const { focusedId, activeGroup, setActiveGroup, changeFocus, lockFocusGroup, unlockFocusGroup } = useTVFocus();

  // Playback States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Overlay States
  const [overlayState, setOverlayState] = useState('loading');
  const [lastInteracted, setLastInteracted] = useState(Date.now());

  // Preferences
  const [selectedSub, setSelectedSub] = useState(() => PersistenceEngine.getPreference('pref_sub', 'Off'));
  const [selectedAudio, setSelectedAudio] = useState(() => PersistenceEngine.getPreference('pref_audio', 'English (Original)'));
  const [selectedQuality, setSelectedQuality] = useState(() => PersistenceEngine.getPreference('pref_quality', 'Auto (1080p)'));
  const [selectedSpeed, setSelectedSpeed] = useState(() => PersistenceEngine.getPreference('pref_speed', 1));
  const [selectedProvider, setSelectedProvider] = useState(() => localStorage.getItem('off_campus_provider') || 'vidsrc_to');

  const isTvSeries = media.title === 'Off Campus' || media.url.includes('/tv/') || media.url.includes('media_type=tv');
  const currentEpisode = parseInt(media.episode || (() => {
    const match = media.url.match(/\/episode\/(\d+)/) || media.url.match(/\/1\/(\d+)/) || media.url.match(/episode=(\d+)/) || media.url.match(/\/273240\/1\/(\d+)/);
    return match ? match[1] : '1';
  })(), 10);

  const mediaId = media.tmdbId || media.id || '99999';

  // Kernel Service Injection & Lifecycle Bootstrapping
  useEffect(() => {
    // 1. Service registration
    kernel.register('bus', bus);
    kernel.register('lifecycle', lifecycle);
    kernel.register('capability', CapabilityDetector);
    kernel.register('persistence', PersistenceEngine);
    kernel.register('resume', ResumeEngine);
    kernel.register('mirror', MirrorIntelligence);
    kernel.register('experience', ExperienceEngine);

    lifecycle.transition(LIFECYCLE_STATES.INITIALIZING);
    CapabilityDetector.detect();
    InputEngine.start();

    // 2. Evaluate Resume State
    const resumeInfo = ResumeEngine.evaluate(mediaId, isTvSeries ? currentEpisode : null);
    if (resumeInfo.showLanding) {
      setOverlayState('resume');
      setCurrentTime(resumeInfo.startTime);
      setDuration(resumeInfo.duration || 3600);
      lockFocusGroup('resume');
      lifecycle.transition(LIFECYCLE_STATES.READY);
    } else {
      setOverlayState('playing-active');
      setIsPlaying(true);
      lockFocusGroup('player-controls');
      lifecycle.transition(LIFECYCLE_STATES.PLAYING);
    }

    // 3. EventBus subscriptions
    const unsubPlay = bus.on(EVENTS.PLAYER_PLAY, () => {
      pipeline.run(EVENTS.PLAYER_PLAY, {}, () => {
        setIsPlaying(true);
        lifecycle.transition(LIFECYCLE_STATES.PLAYING);
      });
    });

    const unsubPause = bus.on(EVENTS.PLAYER_PAUSE, () => {
      pipeline.run(EVENTS.PLAYER_PAUSE, {}, () => {
        setIsPlaying(false);
        lifecycle.transition(LIFECYCLE_STATES.PAUSED);
      });
    });

    const unsubSeek = bus.on(EVENTS.PLAYER_SEEK, (time) => {
      pipeline.run(EVENTS.PLAYER_SEEK, time, () => {
        setCurrentTime(time);
        lifecycle.transition(LIFECYCLE_STATES.SEEKING);
      });
    });

    const unsubInputMedia = bus.on(EVENTS.INPUT_MEDIA_TOGGLE, () => {
      if (adapterRef.current) {
        if (isPlaying) adapterRef.current.pause();
        else adapterRef.current.play();
      }
    });

    const unsubInputBack = bus.on(EVENTS.INPUT_BACK, () => {
      if (overlayState === 'quick-panel') {
        setOverlayState('playing-active');
        unlockFocusGroup('player-controls');
        changeFocus('btn-settings');
      } else if (overlayState === 'resume') {
        onClose();
      } else {
        setOverlayState('resume');
        lockFocusGroup('resume');
        lifecycle.transition(LIFECYCLE_STATES.READY);
      }
    });

    const unsubInputSelect = bus.on(EVENTS.INPUT_SELECT, () => {
      const activeEl = document.getElementById(focusedId);
      if (activeEl) activeEl.click();
    });

    return () => {
      InputEngine.stop();
      lifecycle.destroy();
      unsubPlay();
      unsubPause();
      unsubSeek();
      unsubInputMedia();
      unsubInputBack();
      unsubInputSelect();
      kernel.clear();
    };
  }, [mediaId, currentEpisode, isTvSeries, overlayState, isPlaying, focusedId, onClose, lockFocusGroup, unlockFocusGroup, changeFocus]);

  // Connect PlaybackAdapter reference
  useEffect(() => {
    const isIframe = localPlayerRef.current instanceof HTMLIFrameElement;
    adapterRef.current = new PlaybackAdapter(localPlayerRef, isIframe ? 'iframe' : 'html5');
  }, [media.url]);

  // Auto-hide idle transition checking
  useEffect(() => {
    if (overlayState === 'resume' || overlayState === 'quick-panel') return;

    const interval = setInterval(() => {
      const diff = Date.now() - lastInteracted;
      if (diff > 15000) {
        setOverlayState('playing-idle');
      } else if (diff > 5000) {
        setOverlayState('playing-active');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastInteracted, overlayState]);

  const resetIdleTimer = useCallback(() => {
    setLastInteracted(Date.now());
    if (overlayState === 'playing-idle') {
      setOverlayState('playing-active');
    }
  }, [overlayState]);

  // Iframe Simulated Clock Tick
  useEffect(() => {
    if (overlayState === 'resume' || media.type !== 'video') return;
    const isIframe = localPlayerRef.current instanceof HTMLIFrameElement;
    if (!isIframe) return;

    if (!duration) setDuration(3600);

    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentTime(prev => {
          const next = prev + 1;
          PersistenceEngine.savePosition(mediaId, isTvSeries ? currentEpisode : null, next, duration || 3600);
          if (next >= (duration || 3600)) {
            clearInterval(interval);
            onClose();
            return duration;
          }
          return next;
        });
        setBufferedTime(prev => Math.min(duration || 3600, prev + 4));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, overlayState, media.type, duration, mediaId, currentEpisode, isTvSeries, onClose]);

  // Native HTML5 Events
  const onTimeUpdate = (e) => {
    const video = e.target;
    setCurrentTime(video.currentTime);
    if (video.duration) setDuration(video.duration);
    if (video.buffered.length > 0) {
      setBufferedTime(video.buffered.end(video.buffered.length - 1));
    }
    PersistenceEngine.savePosition(mediaId, isTvSeries ? currentEpisode : null, video.currentTime, video.duration);
  };

  const onLoadedMetadata = (e) => {
    const video = e.target;
    setDuration(video.duration);
  };

  const handlePlayPause = () => {
    if (adapterRef.current) {
      if (isPlaying) adapterRef.current.pause();
      else adapterRef.current.play();
    }
  };

  const handleSkip = (sec) => {
    if (adapterRef.current) {
      const target = Math.max(0, Math.min(duration, currentTime + sec));
      adapterRef.current.seek(target);
    }
  };

  const handleRestart = () => {
    if (adapterRef.current) {
      adapterRef.current.seek(0);
      adapterRef.current.play();
    }
  };

  const handleSeek = (newTime) => {
    if (adapterRef.current) {
      adapterRef.current.seek(newTime);
    }
  };

  const handleToggleFullscreen = () => {
    const elem = localPlayerRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen?.().catch(err => console.warn(err));
    } else {
      document.exitFullscreen?.();
    }
  };

  // Preference change triggers
  const handleSelectSub = (sub) => {
    setSelectedSub(sub);
    PersistenceEngine.savePreference('pref_sub', sub);
    bus.emit(EVENTS.NOTIFICATION_PUSH, { message: `Subtitles: ${sub}`, type: 'subtitle' });
  };

  const handleSelectSpeed = (speed) => {
    setSelectedSpeed(speed);
    PersistenceEngine.savePreference('pref_speed', speed);
    if (adapterRef.current) adapterRef.current.setSpeed(speed);
    bus.emit(EVENTS.NOTIFICATION_PUSH, { message: `Speed: ${speed}x`, type: 'speed' });
  };

  const handleSelectQuality = (qual) => {
    setSelectedQuality(qual);
    PersistenceEngine.savePreference('pref_quality', qual);
    bus.emit(EVENTS.NOTIFICATION_PUSH, { message: `Quality: ${qual}`, type: 'info' });
  };

  const handleSelectProvider = (prov) => {
    const start = Date.now();
    setSelectedProvider(prov);
    localStorage.setItem('off_campus_provider', prov);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      MirrorIntelligence.logPerformance(prov, Date.now() - start, false);
    }, 2000);
    bus.emit(EVENTS.NOTIFICATION_PUSH, { message: 'Streaming mirror switched', type: 'mirror' });
  };

  const handleEpisodeChange = (epVal) => {
    let newUrl = media.url;
    if (media.url.includes('off-campus') || media.url.includes('273240')) {
      newUrl = `https://vidsrc.sbs/embed/tv/273240/1/${epVal}`;
    } else if (media.url.includes('/episode/')) {
      newUrl = media.url.replace(/\/episode\/\d+/, `/episode/${epVal}`);
    } else if (media.url.includes('/1/')) {
      newUrl = media.url.replace(/\/1\/\d+/, `/1/${epVal}`);
    } else {
      if (media.url.includes('?')) {
        const [base, query] = media.url.split('?');
        newUrl = `${base}/episode/${epVal}?${query}`;
      } else {
        newUrl = `${media.url}/episode/${epVal}`;
      }
    }

    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
    setCurrentTime(0);
    setDuration(3600);
    if (onMediaUpdate) {
      onMediaUpdate({
        ...media,
        url: newUrl,
        episode: epVal
      });
    }
    bus.emit(EVENTS.NOTIFICATION_PUSH, { message: `Playing Episode ${epVal}`, type: 'info' });
  };

  return (
    <div 
      onMouseMove={resetIdleTimer}
      onClick={resetIdleTimer}
      className="relative w-full h-full md:aspect-video md:h-auto max-w-7xl bg-black md:rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)] border border-white/5 flex flex-col items-center justify-center"
    >
      {/* Dynamic Design / Theme Engine */}
      <ThemeEngine imageUrl={media.thumb || media.backdropPath} />

      {/* Developer diagnostic Tools overlay */}
      <DeveloperTools />

      {/* Queue-based Notification Engine */}
      <NotificationEngine />

      {/* Resume Screen overlay */}
      <AnimatePresence>
        {overlayState === 'resume' && (
          <ResumeManager
            media={media}
            savedTime={currentTime}
            duration={duration}
            isTvSeries={isTvSeries}
            currentEpisode={currentEpisode}
            onResume={(time) => {
              setOverlayState('playing-active');
              setIsPlaying(true);
              unlockFocusGroup('player-controls');
              if (time > 0 && adapterRef.current) adapterRef.current.seek(time);
            }}
            onRestart={() => {
              setOverlayState('playing-active');
              setIsPlaying(true);
              unlockFocusGroup('player-controls');
              if (adapterRef.current) adapterRef.current.seek(0);
            }}
            onClose={onClose}
          />
        )}
      </AnimatePresence>

      {/* Video element or Iframe Mirror */}
      <div className="w-full h-full relative z-10">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-25 pointer-events-none">
            <Loader2 className="w-16 h-16 text-[#ff4d85] animate-spin mb-4" />
            <span className="text-sm font-mono tracking-widest text-neutral-400 uppercase">Connecting Stream...</span>
          </div>
        )}

        {media.type === 'video' ? (
          media.url.includes('drive.google.com') || media.url.includes('streamimdb.ru') || media.url.includes('vidsrc') || media.url.includes('embed.su') || media.url.includes('watchmode') ? (
            <iframe 
              ref={localPlayerRef}
              key={`${media.url}_prov_${selectedProvider}`}
              src={(() => {
                const isTv = media.url.includes('/tv/') || media.url.includes('media_type=tv');
                const isOffCampus = media.title === 'Off Campus';
                const urlObj = media.url.includes('?') ? new URL(media.url) : null;
                const tmdbIdParam = urlObj ? urlObj.searchParams.get('tmdb_id') : null;
                const id = isOffCampus ? '273240' : (tmdbIdParam || media.url.split('/embed/')[1]?.split('/')[1]?.split('?')[0] || media.url.split('/tv/')[1] || '10625');
                const startParam = currentTime ? `&start=${Math.floor(currentTime)}` : '';
                
                if (selectedProvider === 'vidsrc_to') {
                  return (isTv || isOffCampus)
                    ? `https://vidsrc.pm/embed/tv/${id}/1/${currentEpisode}?autoplay=1${startParam}`
                    : `https://vidsrc.pm/embed/movie/${id}?autoplay=1${startParam}`;
                } else if (selectedProvider === 'vidsrc_xyz') {
                  return (isTv || isOffCampus)
                    ? `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=1&episode=${currentEpisode}&autoplay=1${startParam}`
                    : `https://vidsrc.xyz/embed/movie?tmdb=${id}&autoplay=1${startParam}`;
                }
                return `https://embed.su/embed/${(isTv || isOffCampus) ? 'tv' : 'movie'}/${id}${isTv ? `/1/${currentEpisode}` : ''}`;
              })()}
              onLoad={() => setIsLoading(false)}
              className="w-full h-full border-0 bg-black"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={localPlayerRef}
              src={media.url}
              autoPlay
              className="w-full h-full object-contain bg-black"
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={onLoadedMetadata}
              onCanPlay={() => setIsLoading(false)}
            />
          )
        ) : (
          <div className="w-full h-full relative">
            <img 
              src={media.url} 
              alt="Memory" 
              className="w-full h-full object-contain bg-black" 
            />
          </div>
        )}
      </div>

      {/* Persistent Glassmorphic HUD overlay */}
      <AnimatePresence>
        {overlayState !== 'resume' && (overlayState !== 'playing-idle' || overlayState === 'quick-panel') && (
          <TVOverlay
            media={media}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onSkip={handleSkip}
            onRestart={handleRestart}
            onOpenSettings={() => {
              setOverlayState('quick-panel');
              lockFocusGroup('quick-panel');
            }}
            onToggleFullscreen={handleToggleFullscreen}
            onClose={onClose}
            currentTime={currentTime}
            duration={duration}
            bufferedTime={bufferedTime}
            onChangeTime={handleSeek}
            isTvSeries={isTvSeries}
            currentEpisode={currentEpisode}
            selectedQuality={selectedQuality}
            dimLevel={overlayState === 'playing-idle' ? 'hide' : 'active'}
          />
        )}
      </AnimatePresence>

      {/* Settings Options drawer */}
      <AnimatePresence>
        {overlayState === 'quick-panel' && (
          <QuickPanel
            show={true}
            onClose={() => {
              setOverlayState('playing-active');
              unlockFocusGroup('player-controls');
              changeFocus('btn-settings');
            }}
            isTvSeries={isTvSeries}
            currentEpisode={currentEpisode}
            onSelectEpisode={handleEpisodeChange}
            selectedSub={selectedSub}
            onSelectSub={handleSelectSub}
            selectedAudio={selectedAudio}
            onSelectAudio={(aud) => {
              setSelectedAudio(aud);
              PersistenceEngine.savePreference('pref_audio', aud);
              bus.emit(EVENTS.NOTIFICATION_PUSH, { message: `Audio: ${aud}`, type: 'audio' });
            }}
            selectedQuality={selectedQuality}
            onSelectQuality={handleSelectQuality}
            selectedSpeed={selectedSpeed}
            onSelectSpeed={handleSelectSpeed}
            selectedProvider={selectedProvider}
            onSelectProvider={handleSelectProvider}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
