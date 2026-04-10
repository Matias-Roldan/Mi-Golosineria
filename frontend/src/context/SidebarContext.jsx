import { createContext, useContext, useEffect, useState } from 'react';

const SidebarCtx = createContext({ open: true, toggle: () => {}, isMobile: false });

export function SidebarProvider({ children }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [open, setOpen] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const fn = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setOpen(true);
    };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  return (
    <SidebarCtx.Provider value={{ open, toggle: () => setOpen(o => !o), isMobile }}>
      {children}
    </SidebarCtx.Provider>
  );
}

export const useSidebar = () => useContext(SidebarCtx);
