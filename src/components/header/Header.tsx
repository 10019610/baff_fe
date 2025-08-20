import React from 'react';
import { Scale } from 'lucide-react';
import { Badge } from '../ui/badge';
// import UserMenu from './UserMenu';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface HeaderProps {
  activeMenuItem?: MenuItem;
  onProfileClick?: () => void;
}

export default function Header({
  activeMenuItem,
  onProfileClick,
}: HeaderProps) {
  return (
    <div className="bg-card border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="relative flex items-center justify-between">
          {/* Logo and App Title */}
          <div className="flex items-center gap-3">
            <Scale className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-lg font-medium">체중 관리 앱</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                건강한 변화의 시작
              </p>
            </div>
          </div>

          {/* User Menu (Always visible) */}
          <div>{/* <UserMenu onProfileClick={onProfileClick} /> */}</div>

          {/* Current page indicator (Mobile only, positioned absolutely) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:hidden">
            {activeMenuItem && (
              <>
                <activeMenuItem.icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{activeMenuItem.label}</span>
                {activeMenuItem.badge && activeMenuItem.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="h-5 min-w-5 text-xs px-1.5"
                  >
                    {activeMenuItem.badge}
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
