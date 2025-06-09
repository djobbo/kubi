import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

interface ISideNavContext {
  isSideNavOpen: boolean;
  toggleSideNav: () => void;
  setIsSideNavOpen: (open: boolean) => void;
  openSideNav: () => void;
  closeSideNav: () => void;

  isSideNavMinified: boolean;
  setIsSideNavMinified: (minified: boolean) => void;
  toggleSideNavMinified: () => void;
  minifySideNav: () => void;
  expandSideNav: () => void;
}

const SideNavContext = createContext<ISideNavContext>({
  isSideNavOpen: false,
  toggleSideNav: () => void 0,
  setIsSideNavOpen: () => void 0,
  openSideNav: () => void 0,
  closeSideNav: () => void 0,

  isSideNavMinified: false,
  setIsSideNavMinified: () => void 0,
  toggleSideNavMinified: () => void 0,
  minifySideNav: () => void 0,
  expandSideNav: () => void 0,
});

export const useSideNav = (): ISideNavContext => useContext(SideNavContext);

interface Props {
  children: ReactNode;
}

export const SideNavProvider = ({ children }: Props) => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [isSideNavMinified, setIsSideNavMinified] = useState(false);

  const toggleSideNav = () => setIsSideNavOpen(!isSideNavOpen);
  const openSideNav = () => setIsSideNavOpen(true);
  const closeSideNav = () => setIsSideNavOpen(false);

  const toggleSideNavMinified = () => setIsSideNavMinified(!isSideNavMinified);
  const minifySideNav = () => setIsSideNavMinified(true);
  const expandSideNav = () => setIsSideNavMinified(false);

  return (
    <SideNavContext
      value={{
        isSideNavOpen,
        setIsSideNavOpen,
        toggleSideNav,
        openSideNav,
        closeSideNav,
        isSideNavMinified,
        setIsSideNavMinified,
        toggleSideNavMinified,
        minifySideNav,
        expandSideNav,
      }}
    >
      {children}
    </SideNavContext>
  );
};
