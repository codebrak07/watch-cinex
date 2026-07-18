// VideoModal.jsx - Unified Portal Entry Shell bootstrapping PlayerOS

import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { TVFocusProvider } from './player/TVFocusEngine';
import PlayerOS from './player/PlayerOS';

const SOVEREIGN_EASE = [0.16, 1, 0.3, 1];

export default function VideoModal(props) {
  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: SOVEREIGN_EASE }}
      className="fixed inset-0 z-[9995] flex items-center justify-center bg-black/95 backdrop-blur-md p-0 md:p-6"
    >
      <TVFocusProvider>
        <PlayerOS {...props} />
      </TVFocusProvider>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}
