import React from 'react';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import UserMenu from './UserMenu';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface BottomNavigationProps {
  menuItems: MenuItem[];
  activeMenu: string;
  onMenuChange: (menuId: string) => void;
}

export default function BottomNavigation({ menuItems, activeMenu, onMenuChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
      <div className="grid grid-cols-4 h-16">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onMenuChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 relative transition-colors",
                isActive 
                  ? "text-primary bg-primary/5" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium leading-tight text-center">
                {item.label.includes(' ') ? item.label.split(' ').join('\n') : item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Mobile User Menu */}
      <div className="absolute -top-16 right-4">
        <UserMenu />
      </div>
    </div>
  );
}