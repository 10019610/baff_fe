import { BarChart3, Scale, Target, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../components/ui/badge.tsx';
import { cn } from '../components/ui/utils.tsx';
import { useNavigate } from 'react-router-dom';

interface NavMenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  url: string;
}

/**
 * 페이지 하단 Navbar
 *
 * @description
 * 체중기록 / 목표설정 / 대결모드 / 대시보드
 * @author hjkim
 * @constructor
 */
const Navbar = () => {
  // navigator
  const navigate = useNavigate();
  // navbar 메뉴 active 제어
  const [activeMenu, setActiveMenu] = useState('tracker');
  // Navbar Item 정의 용도 데이터
  const navItems: NavMenuItem[] = [
    {
      id: 'tracker',
      label: '체중 기록',
      icon: Scale,
      url: '/',
    },
    {
      id: 'goals',
      label: '목표 설정',
      icon: Target,
      url: '/goals',
    },
    {
      id: 'battle',
      label: '대결 모드',
      icon: Users,
      url: '/',
    },
    {
      id: 'analytics',
      label: '분석',
      icon: BarChart3,
      url: '/',
    },
  ];

  const handleNavMenuChange = (navMenu: NavMenuItem) => {
    setActiveMenu(navMenu.id);
    navigate(navMenu.url);
  };

  return (
    <div>
      {/* 데스크탑 네비게이션 */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex gap-1 py-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button key={item.id} onClick={() => handleNavMenuChange(item)}
                          className={cn('flex items-center gap-3 px-6 py-3 rounded-lg transition-colors relative', isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}>
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant={isActive ? 'secondary' : 'destructive'}
                             className="h-5 min-w-5 text-xs px-1.5">{item.badge}</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* 모바일 네비게이션 */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button key={item.id} onClick={() => handleNavMenuChange(item)}
                      className={cn('flex flex-col items-center justify-center gap-1 relative transition-colors', isActive ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground')}>
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.badge && item.badge > 0 && (
                    <Badge variant="destructive"
                           className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center">{item.badge}</Badge>
                  )}
                </div>
                <span
                  className="text-xs font-medium leading-tight text-center">{item.label.includes(' ') ? item.label.split(' ').join('\n') : item.label}</span>
                {isActive && (
                  <div
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
