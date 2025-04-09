
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Map, Hospital, Search, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileNavigation = () => {
  const navItems = [
    { name: 'Map', icon: Map, path: '/' },
    { name: 'Hospitals', icon: Hospital, path: '/hospitals' },
    { name: 'Search', icon: Search, path: '/search' },
    { name: 'Donate', icon: Heart, path: '/donate' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-1 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center py-2 px-3 text-xs rounded-md transition-colors',
                isActive 
                  ? 'text-primary font-medium' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={cn(isActive ? 'text-primary' : 'text-gray-500')} />
                <span className="mt-1">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;
