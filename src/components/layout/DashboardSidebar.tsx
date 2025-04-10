
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
  // Removed duplicate LogOut import
} from 'lucide-react';
import { useI18n } from '@/context/I18nContext'; // Import the i18n hook
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
  const { t } = useI18n(); // Use the i18n hook

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-700"> {/* Added dark mode border */}
      <SidebarHeader className="flex items-center px-4 py-6">
        <div className="flex items-center space-x-2">
          <LifeBuoy className="h-8 w-8 text-primary" />
          <span className="font-semibold text-lg">Emergency Response System</span>
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
                    <span>{t('sidebar.settings')}</span> {/* Translate */}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className="flex items-center space-x-3">
                    <LogOut size={20} />
                    <span>{t('sidebar.exitDashboard')}</span> {/* Translate */}
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
  const { t } = useI18n(); // Use the i18n hook

  // Define items with translation keys
  const items = [
    {
      key: 'events', // Use key for mapping and translation
      icon: AlertCircle,
      path: '/dashboard/events',
    },
    {
      key: 'hospitals',
      icon: Hospital,
      path: '/dashboard/hospitals',
    },
    {
      key: 'patients',
      icon: Users,
      path: '/dashboard/patients',
    },
    {
      key: 'uploadLists',
      icon: Upload,
      path: '/dashboard/upload',
    },
  ];

  return (
    <>
      {items.map((item) => (
        <SidebarMenuItem key={item.key}>
          <SidebarMenuButton asChild>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3',
                  isActive && 'text-primary font-medium' // Keep active styling
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={cn(isActive ? 'text-primary' : '')} />
                  {/* Use t function with sidebar prefix */}
                  <span>{t(`sidebar.${item.key}`)}</span>
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
