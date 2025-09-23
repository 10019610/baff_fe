import { Badge } from '../ui/badge';
import UserMenu from './UserMenu.tsx';
import ChangeUpLogo from '../ui/ChangeUpLogo.tsx';
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
}

export default function Header({ activeMenuItem }: HeaderProps) {
  /**
   * Hooks
   */
  const navigate = useNavigate();
  /**
   * Handlers
   */
  /* 페이지 이동 handler */
  const navigateTo = (to: string) => {
    navigate(to);
  };
  const onProfileClick = (userId: string) => {
    console.log('onProfileClick', userId);
    navigate(`/user/profile/${userId}`);
  };
  return (
    <div className="bg-card border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="relative flex items-center justify-between">
          {/* Logo and App Title */}
          <button
            onClick={() => navigateTo('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200 rounded-lg p-1 -m-1 cursor-pointer"
          >
            {/* <Scale className="h-7 w-7 text-primary" /> */}
            <div className="flex items-center gap-1">
              <ChangeUpLogo size="md" />
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-[10px] font-semibold border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 p-3 h-4"
              >
                BETA
              </Badge>
            </div>
            <div>
              {/* <h1 className="text-lg font-bold">ChangeUp</h1> */}
              <p className="text-sm text-muted-foreground hidden sm:block">
                건강한 변화의 시작
              </p>
            </div>
          </button>

          {/* User Menu (Always visible) */}
          <div className="flex items-center gap-3">
            <UserMenu onProfileClick={onProfileClick} />
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:hidden">
            {activeMenuItem && (
              <>
                <activeMenuItem.icon className="h-5 w-5 text-primary  cursor-pointer" />
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
