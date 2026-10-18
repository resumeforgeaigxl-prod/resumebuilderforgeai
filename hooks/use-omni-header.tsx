'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface OmniHeaderState {
  historyCount: number;
  activeTitle: string | null;
  onOpenHistory?: () => void;
  onNewChat?: () => void;
  setOmniHeader: (state: {
    historyCount: number;
    activeTitle: string | null;
    onOpenHistory?: () => void;
    onNewChat?: () => void;
  }) => void;
  clearOmniHeader: () => void;
}

const OmniHeaderContext = createContext<OmniHeaderState>({
  historyCount: 0,
  activeTitle: null,
  setOmniHeader: () => {},
  clearOmniHeader: () => {},
});

export function OmniHeaderProvider({ children }: { children: React.ReactNode }) {
  const [headerState, setHeaderState] = useState<{
    historyCount: number;
    activeTitle: string | null;
    onOpenHistory?: () => void;
    onNewChat?: () => void;
  }>({
    historyCount: 0,
    activeTitle: null,
  });

  const setOmniHeader = useCallback((newState: {
    historyCount: number;
    activeTitle: string | null;
    onOpenHistory?: () => void;
    onNewChat?: () => void;
  }) => {
    setHeaderState(newState);
  }, []);

  const clearOmniHeader = useCallback(() => {
    setHeaderState({
      historyCount: 0,
      activeTitle: null,
      onOpenHistory: undefined,
      onNewChat: undefined,
    });
  }, []);

  return (
    <OmniHeaderContext.Provider
      value={{
        ...headerState,
        setOmniHeader,
        clearOmniHeader,
      }}
    >
      {children}
    </OmniHeaderContext.Provider>
  );
}

export function useOmniHeader() {
  return useContext(OmniHeaderContext);
}
