// NotificationEngine.jsx - Event-driven, queue-based OTT notification banner stacks

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Subtitles, Sliders, PlayCircle, Info } from 'lucide-react';
import { bus, EVENTS } from './EventBus';

export default function NotificationEngine() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    // Listen for notification push events
    const unsub = bus.on(EVENTS.NOTIFICATION_PUSH, (notif) => {
      const id = Date.now() + Math.random().toString(36).substr(2, 5);
      
      // Avoid duplicate notifications (e.g. redundant focus shifts)
      if (notif.type === 'focus') return;

      setQueue(prev => {
        // If queue is too long, drop first item
        const next = [...prev, { id, ...notif }];
        if (next.length > 3) next.shift();
        return next;
      });

      // Timed dismissal
      setTimeout(() => {
        setQueue(prev => prev.filter(item => item.id !== id));
      }, 3000);
    });

    return () => unsub();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'audio': return <Volume2 className="text-[#ff4d85] w-5 h-5" />;
      case 'subtitle': return <Subtitles className="text-[#ff4d85] w-5 h-5" />;
      case 'speed': return <Sliders className="text-[#ff4d85] w-5 h-5" />;
      case 'mirror': return <PlayCircle className="text-[#ff4d85] w-5 h-5" />;
      default: return <Info className="text-[#ff4d85] w-5 h-5" />;
    }
  };

  return (
    <div className="absolute top-8 right-8 z-[9999] flex flex-col gap-3 pointer-events-none select-none">
      <AnimatePresence>
        {queue.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="flex items-center gap-4 bg-[#121318]/90 backdrop-blur-xl border border-white/10 px-5 py-3.5 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] min-w-[280px]"
          >
            <div className="flex-shrink-0 bg-white/5 p-2 rounded-xl border border-white/5">
              {getIcon(item.type)}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#ff4d85] font-mono">
                System Update
              </span>
              <span className="text-white text-xs font-semibold tracking-wide">
                {item.message}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
