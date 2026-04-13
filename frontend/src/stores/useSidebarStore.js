import { create } from 'zustand';

const useSidebarStore = create((set) => ({
  isMobile: window.innerWidth < 768,
  open: window.innerWidth >= 768,
  toggle: () => set((s) => ({ open: !s.open })),
}));

// Listener de resize equivalente al useEffect del SidebarContext
const handleResize = () => {
  const mobile = window.innerWidth < 768;
  useSidebarStore.setState({ isMobile: mobile });
  if (!mobile) useSidebarStore.setState({ open: true });
};
window.addEventListener('resize', handleResize);

export const useSidebar = useSidebarStore;
