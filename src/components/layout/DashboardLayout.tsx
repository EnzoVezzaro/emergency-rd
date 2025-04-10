
import React, { ReactNode, useEffect } from 'react';
import DashboardSidebar from './DashboardSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
