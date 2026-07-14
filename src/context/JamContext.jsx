import React, { createContext, useContext, useState, useRef } from 'react';

const JamContext = createContext(null);

export function useJam() {
  return useContext(JamContext);
}

export function JamProvider({ children }) {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const videoPlayerRef = useRef(null);
  const isSyncTriggeredRef = useRef(false);

  const value = {
    selectedMedia,
    setSelectedMedia,
    videoPlayerRef,
    isSyncTriggeredRef,
    isHost: false,
    connectionStatus: 'disconnected',
    videoState: {
      playing: false,
      currentTime: 0,
      mediaUrl: '',
      title: ''
    },
    sendSyncEvent: () => {}
  };

  return (
    <JamContext.Provider value={value}>
      {children}
    </JamContext.Provider>
  );
}
