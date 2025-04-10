
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
          <svg width="25" height="25" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fill-rule="evenodd">
              <path fill="#E63946" d="M50,5 C72,5 90,23 90,45 C90,70 50,95 50,95 C50,95 10,70 10,45 C10,23 28,5 50,5 Z"/>
              <path fill="#FFFFFF" d="M50,32 C54,28 61,28 65,32 C69,36 69,43 65,47 L50,62 L35,47 C31,43 31,36 35,32 C39,28 46,28 50,32 Z"/>
            </g>
          </svg>
          <span className="font-semibold text-lg">ERS</span>
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
