import React from 'react';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface DesktopNavigationProps {
  menuItems: MenuItem[];
  activeMenu: string;
  onMenuChange: (menuId: string) => void;
}

export default function DesktopNavigation({ menuItems, activeMenu, onMenuChange }: DesktopNavigationProps) {
  return (
    <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="flex gap-1 py-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onMenuChange(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 rounded-lg transition-colors relative",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant={isActive ? "secondary" : "destructive"} 
                      className="h-5 min-w-5 text-xs px-1.5"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}