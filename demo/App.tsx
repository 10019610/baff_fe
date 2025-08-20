import React, { useState, useEffect } from 'react';
import { Skeleton } from './components/ui/skeleton';
import { 
  Scale, 
  Target, 
  Users, 
  BarChart3
} from 'lucide-react';
import { AuthProvider, useAuth } from './components/AuthContext';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import PageHeader from './components/PageHeader';
import BottomNavigation from './components/BottomNavigation';
import DesktopNavigation from './components/DesktopNavigation';

// Import Pages
import TrackerPage from './pages/TrackerPage';
import GoalsPage from './pages/GoalsPage';
import BattlePage from './pages/BattlePage';
import DashboardPage from './pages/DashboardPage';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

// 메인 앱 컴포넌트 (인증된 사용자용)
function MainApp() {
  const [activeMenu, setActiveMenu] = useState('tracker');
  const [pendingRequests, setPendingRequests] = useState(0);
  const { user } = useAuth();

  // Get active rooms count for badge
  useEffect(() => {
    const updateActiveRooms = () => {
      if (!user) return;
      
      try {
        const userRooms = JSON.parse(localStorage.getItem(`battleRooms_${user.id}`) || '[]');
        const active = userRooms.filter((room: any) => !room.isActive).length; // 대기 중인 방들
        setPendingRequests(active);
      } catch (error) {
        setPendingRequests(0);
      }
    };

    updateActiveRooms();

    // Listen for storage changes to update badge
    const handleStorageChange = () => {
      updateActiveRooms();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Polling to check for updates (fallback)
    const interval = setInterval(updateActiveRooms, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  // 메뉴 아이템 정의 (component 제거)
  const menuItems: MenuItem[] = [
    {
      id: 'tracker',
      label: '체중 기록',
      icon: Scale
    },
    {
      id: 'goals',
      label: '목표 설정',
      icon: Target
    },
    {
      id: 'battle',
      label: '대결 모드',
      icon: Users,
      badge: pendingRequests
    },
    {
      id: 'dashboard',
      label: '대시보드',
      icon: BarChart3
    }
  ];

  const activeMenuItem = menuItems.find(item => item.id === activeMenu);

  const handleMenuChange = (menuId: string) => {
    setActiveMenu(menuId);
  };

  // 페이지 렌더링 함수
  const renderCurrentPage = () => {
    switch (activeMenu) {
      case 'tracker':
        return <TrackerPage />;
      case 'goals':
        return <GoalsPage />;
      case 'battle':
        return <BattlePage />;
      case 'dashboard':
        return <DashboardPage />;
      default:
        return <TrackerPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header activeMenuItem={activeMenuItem} />

      {/* Main Content */}
      <div className="flex-1 pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            {/* Desktop page header */}
            <PageHeader 
              activeMenuItem={activeMenuItem} 
              activeMenu={activeMenu} 
            />

            {/* Page Content */}
            {renderCurrentPage()}
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <BottomNavigation 
        menuItems={menuItems}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
      />

      {/* Desktop Navigation */}
      <DesktopNavigation 
        menuItems={menuItems}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
      />
    </div>
  );
}

// 로딩 스켈레톤 컴포넌트
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Scale className="h-12 w-12 text-primary animate-pulse" />
            </div>
          </div>
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-5 w-32 mx-auto" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

// 루트 앱 컴포넌트
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainApp />;
}

// 최종 App 컴포넌트 (AuthProvider로 감싸기)
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}