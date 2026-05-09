"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

interface SidebarContextType {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
  isMounted: boolean;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggle: () => {},
  setCollapsed: () => {},
  isMounted: false,
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Persist preference and prevent transition flash
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    // Also auto-collapse on small screens by default if no saved preference
    const isMobile = window.innerWidth < 768;
    
    if (saved === "true" || (saved === null && isMobile)) {
        setCollapsedState(true);
    }
    
    // Allow DOM to update before enabling transitions
    requestAnimationFrame(() => {
        setIsMounted(true);
    });
  }, []);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    localStorage.setItem("sidebar-collapsed", String(value));
  }, []);

  const toggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, setCollapsed, isMounted }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
