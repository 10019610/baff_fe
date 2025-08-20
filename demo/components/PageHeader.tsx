import React from 'react';
import { Badge } from './ui/badge';
import { useAuth } from './AuthContext';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface PageHeaderProps {
  activeMenuItem?: MenuItem;
  activeMenu: string;
}

export default function PageHeader({ activeMenuItem, activeMenu }: PageHeaderProps) {
  const { user } = useAuth();

  return (
    <div className="hidden sm:block mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {activeMenuItem && (
            <>
              <activeMenuItem.icon className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-medium">{activeMenuItem.label}</h1>
              {activeMenuItem.badge && activeMenuItem.badge > 0 && (
                <Badge variant="destructive" className="h-6 min-w-6 text-sm px-2">
                  {activeMenuItem.badge}
                </Badge>
              )}
            </>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}님</p>
              <p className="text-xs text-muted-foreground">안녕하세요!</p>
            </div>
          </div>
        )}
      </div>
      <p className="text-muted-foreground">
        {activeMenu === 'battle' 
          ? '친구들과 함께 목표를 달성해보세요'
          : activeMenu === 'tracker'
          ? '매일 체중을 기록하고 변화를 추적하세요'
          : activeMenu === 'goals'
          ? '목표를 설정하고 달성 과정을 관리하세요'
          : activeMenu === 'dashboard'
          ? '전체 현황을 한눈에 확인하세요'
          : '체중 관리의 모든 것을 한눈에 확인하세요'
        }
      </p>
    </div>
  );
}