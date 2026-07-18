// DeveloperTools.jsx - Playback Inspector Diagnostic overlay

import React, { useState, useEffect } from 'react';
import { bus } from './EventBus';
import { lifecycle } from './LifecycleManager';

export default function DeveloperTools() {
  const [logs, setLogs] = useState([]);
  const [activeState, setActiveState] = useState(lifecycle.state);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Capture state changes
    const unsubLifecycle = lifecycle.onStateChange((state) => {
      setActiveState(state);
      setLogs(prev => [`[Lifecycle] -> ${state}`, ...prev].slice(0, 15));
    });

    // Capture EventBus calls
    const originalEmit = bus.emit.bind(bus);
    bus.emit = (event, data) => {
      setLogs(prev => [`[EventBus] ${event} : ${JSON.stringify(data || '')}`, ...prev].slice(0, 15));
      originalEmit(event, data);
    };

    // Listen to 'd' key to toggle developer tools overlay
    const handleKey = (e) => {
      if (e.key === 'd' || e.key === 'D') {
        setVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      unsubLifecycle();
      window.removeEventListener('keydown', handleKey);
      bus.emit = originalEmit; // Restore
    };
  }, []);

  if (!visible) {
    return (
      <div className="absolute top-4 left-4 z-[9999] pointer-events-auto">
        <button 
          onClick={() => setVisible(true)}
          className="bg-black/60 hover:bg-black border border-white/10 text-[9px] font-mono text-neutral-400 px-2 py-1 rounded transition-colors"
        >
          OS Inspector [Press D]
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-[9999] w-72 bg-[#0c0d12]/95 border border-white/10 rounded-2xl p-4 shadow-2xl font-mono text-[10px] text-neutral-300 pointer-events-auto select-none max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
        <span className="font-bold text-[#ff4d85]">PlayerOS Inspector</span>
        <button 
          onClick={() => setVisible(false)}
          className="text-neutral-500 hover:text-white font-bold"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="text-neutral-500">Lifecycle State:</span>{' '}
          <span className="text-green-400 font-bold">{activeState}</span>
        </div>
        
        <div className="space-y-1">
          <span className="text-neutral-500">Event Stream Logs:</span>
          <div className="bg-black/40 border border-white/5 rounded p-2 h-44 overflow-y-auto space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="truncate text-neutral-400" title={log}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export { DeveloperTools };
