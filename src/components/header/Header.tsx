import React from 'react';
import { Badge } from '../ui/badge';
import UserMenu from './UserMenu.tsx';
import ChangeUpLogo from '../ui/ChangeUpLogo.tsx';
import { Button } from '../ui/button.tsx';
import { useNavigate } from 'react-router-dom';

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
  /**
   * Hooks
   */
  const navigate = useNavigate();
  /**
   * Handlers
   */
  /* 페이지 이동 handler */
  const navigateTo = (to: string) => {
    console.log(to);
    navigate(to);
  };
  return (
    <div className="bg-card border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="relative flex items-center justify-between">
          {/* Logo and App Title */}
          <div className="flex items-center gap-3">
            {/* <Scale className="h-7 w-7 text-primary" /> */}
            <ChangeUpLogo size="md" />
            <div>
              {/* <h1 className="text-lg font-bold">ChangeUp</h1> */}
              <p className="text-sm text-muted-foreground hidden sm:block">
                건강한 변화의 시작
              </p>
            </div>
          </div>

          {/* User Menu (Always visible) */}
          <div className="flex items-center gap-3">
            <div>
              <Button onClick={() => navigateTo('admin/dashboard')}>
                관리자
              </Button>
            </div>
            <UserMenu onProfileClick={onProfileClick} />
          </div>

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
