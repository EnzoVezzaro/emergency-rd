
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
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
  useSidebar
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const DashboardSidebar = () => {
  const { t } = useI18n(); // Use the i18n hook
  const { open } = useSidebar();
  const navigate = useNavigate();
  const logoutFn = async () => {
    const { error } = await supabase.auth.signOut()
    navigate('/');
    console.log('error logout: ', error);
  }

  return (
    <>
      <Sidebar className="sidebar-container border-r border-gray-200 dark:border-gray-700 z-1">
        <SidebarHeader className="flex items-center px-4">
          <div className="flex items-center space-x-2">
            <Link to={`/dashboard`} className='flex-row flex'>
              <img src="/logo.png" alt="Logo" style={{ width: 120, height: 'auto' }} />
            </Link>
          </div>
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
                    <div onClick={logoutFn} className="flex items-center space-x-3 cursor-pointer" style={{ cursor: 'pointer' }}>
                      <LogOut size={20} />
                      <span>{t('sidebar.exitDashboard')}</span> {/* Translate */}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarTrigger  
        className="trigger-sidebar ml-auto hover:text-sidebar-foreground" 
        style={{
          background: '#fafafa',
          border: '1px solid #fff',
          borderColor: 'rgb(229 231 235 / var(--tw-border-opacity, 1))',
          position: 'relative',
          left: open ? '-10px' : '15px',
          zIndex: 3,
          top: '30px'
        }} 
      />
    </>
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
