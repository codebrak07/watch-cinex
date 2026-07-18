// TVFocusEngine.jsx - Advanced spatial focus and group locking coordinator

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AudioFeedback } from './AudioFeedback';
import { bus, EVENTS } from './EventBus';

const TVFocusContext = createContext(null);

export function useTVFocus() {
  return useContext(TVFocusContext);
}

export function TVFocusProvider({ children, initialGroup = 'resume' }) {
  const [focusedId, setFocusedId] = useState('');
  const [activeGroup, setActiveGroup] = useState(initialGroup);
  
  const registry = useRef({});
  const focusHistory = useRef([]);
  const lastFocusPerGroup = useRef({});
  const modalLock = useRef(false);

  // Register an element
  const register = useCallback((id, group, order) => {
    registry.current[id] = { id, group, order };
  }, []);

  const unregister = useCallback((id) => {
    delete registry.current[id];
  }, []);

  // Update focus with memory and sound
  const changeFocus = useCallback((id) => {
    if (!id || !registry.current[id]) return;
    const target = registry.current[id];
    
    setFocusedId(id);
    lastFocusPerGroup.current[target.group] = id;
    AudioFeedback.playFocus();
    
    bus.emit(EVENTS.NOTIFICATION_PUSH, { message: `Focus shifted: ${id}`, type: 'focus' });
  }, []);

  // Focus lock for modals/drawers
  const lockFocusGroup = useCallback((group) => {
    modalLock.current = true;
    setActiveGroup(group);
    
    const remembered = lastFocusPerGroup.current[group];
    const elements = Object.values(registry.current).filter(el => el.group === group);
    
    if (remembered && registry.current[remembered]) {
      changeFocus(remembered);
    } else if (elements.length > 0) {
      elements.sort((a, b) => a.order - b.order);
      changeFocus(elements[0].id);
    }
  }, [changeFocus]);

  const unlockFocusGroup = useCallback((fallbackGroup) => {
    modalLock.current = false;
    setActiveGroup(fallbackGroup);
    
    const remembered = lastFocusPerGroup.current[fallbackGroup];
    const elements = Object.values(registry.current).filter(el => el.group === fallbackGroup);
    
    if (remembered && registry.current[remembered]) {
      changeFocus(remembered);
    } else if (elements.length > 0) {
      elements.sort((a, b) => a.order - b.order);
      changeFocus(elements[0].id);
    }
  }, [changeFocus]);

  // Spatial directional traversal
  const handleArrowInput = useCallback((dir) => {
    const elements = Object.values(registry.current).filter(el => el.group === activeGroup);
    if (elements.length === 0) return;

    elements.sort((a, b) => a.order - b.order);
    const currentIdx = elements.findIndex(el => el.id === focusedId);
    let nextIdx = currentIdx;

    if (dir === 'left' || dir === 'up') {
      nextIdx = currentIdx > 0 ? currentIdx - 1 : elements.length - 1;
    } else if (dir === 'right' || dir === 'down') {
      nextIdx = currentIdx < elements.length - 1 ? currentIdx + 1 : 0;
    }

    const nextEl = elements[nextIdx];
    if (nextEl && nextEl.id !== focusedId) {
      changeFocus(nextEl.id);
    }
  }, [focusedId, activeGroup, changeFocus]);

  // Subscribe to InputEngine events
  useEffect(() => {
    const unsubArrow = bus.on(EVENTS.INPUT_ARROW, (dir) => handleArrowInput(dir));
    return () => unsubArrow();
  }, [handleArrowInput]);

  return (
    <TVFocusContext.Provider value={{
      focusedId,
      activeGroup,
      setActiveGroup,
      changeFocus,
      register,
      unregister,
      lockFocusGroup,
      unlockFocusGroup
    }}>
      {children}
    </TVFocusContext.Provider>
  );
}

export function TVFocusable({ id, group, order, children, onSelect, className = '', activeClassName = '' }) {
  const { focusedId, register, unregister, changeFocus } = useTVFocus();

  useEffect(() => {
    register(id, group, order);
    return () => unregister(id);
  }, [id, group, order, register, unregister]);

  const isFocused = focusedId === id;

  const handleClick = (e) => {
    e.stopPropagation();
    AudioFeedback.playSelect();
    if (onSelect) onSelect();
  };

  return (
    <div
      id={id}
      onClick={handleClick}
      onMouseEnter={() => changeFocus(id)}
      className={`${className} ${isFocused ? activeClassName : ''} transition-all duration-200 outline-none`}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  );
}
