
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Hospital,
  AlertCircle,
  Users,
  Upload,
  Settings,
  LifeBuoy,
  LogOut,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const DashboardSidebar = () => {
  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="flex items-center px-4 py-6">
        <div className="flex items-center space-x-2">
          <LifeBuoy className="h-8 w-8 text-primary" />
          <span className="font-semibold text-lg">Hope Beacon</span>
        </div>
        <SidebarTrigger className="ml-auto" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItems />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard/settings" className="flex items-center space-x-3">
                    <Settings size={20} />
                    <span>Settings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className="flex items-center space-x-3">
                    <LogOut size={20} />
                    <span>Exit Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

const NavItems = () => {
  const items = [
    {
      name: 'Events',
      icon: AlertCircle,
      path: '/dashboard/events',
    },
    {
      name: 'Hospitals',
      icon: Hospital,
      path: '/dashboard/hospitals',
    },
    {
      name: 'Patients',
      icon: Users,
      path: '/dashboard/patients',
    },
    {
      name: 'Upload Lists',
      icon: Upload,
      path: '/dashboard/upload',
    },
  ];

  return (
    <>
      {items.map((item) => (
        <SidebarMenuItem key={item.name}>
          <SidebarMenuButton asChild>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3',
                  isActive && 'text-primary font-medium'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={cn(isActive ? 'text-primary' : '')} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
};

export default DashboardSidebar;
