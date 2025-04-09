
import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import MobileNavigation from './MobileNavigation';

type MobileLayoutProps = {
  children: ReactNode;
  hideNavigation?: boolean;
};

const MobileLayout = ({ children, hideNavigation = false }: MobileLayoutProps) => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 pb-16">{children}</main>
      {!hideNavigation && <MobileNavigation />}
    </div>
  );
};

export default MobileLayout;
