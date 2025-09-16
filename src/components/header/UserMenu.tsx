// import { Button } from '../ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '../ui/dropdown-menu';
// import { Badge } from '../ui/badge';
// import { LogOut, User, Settings, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.tsx';
import { Button } from '../ui/button.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.tsx';
import { Crown, LogOut, Settings, ShieldUser, User } from 'lucide-react';
import { Badge } from '../ui/badge.tsx';
import { api } from '../../services/api/Api.ts';
import { useNavigate } from 'react-router-dom';

interface UserMenuProps {
  onProfileClick: (userId: string) => void;
}

//
export default function UserMenu({ onProfileClick }: UserMenuProps) {
  /**
   * Hooks
   */
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  //
  if (!user) return null;
  //
  const getProviderBadge = () => {
    return <Badge>Google</Badge>;
    // if (user.provider === 'google') {
    //   return (
    //     <Badge variant="outline" className="text-xs">
    //       Google
    //     </Badge>
    //   );
    // }
    // if (user.provider === 'kakao') {
    //   return (
    //     <Badge
    //       variant="outline"
    //       className="text-xs bg-[#FEE500] text-black border-[#FEE500]"
    //     >
    //       Kakao
    //     </Badge>
    //   );
    // }
    // return null;
  };

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      // 개발환경과 배포환경 구분
      if (import.meta.env.VITE_APP_ENV === 'development') {
        logout();
      } else {
        api.post('/user/logout').then((res) => {
          console.log(res);
          window.location.href = 'https://baff-fe.vercel.app/';
          navigate('/');
        });
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={user.profileImage} alt={user.nickname} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.nickname}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">
                {user.nickname}
              </p>
              {getProviderBadge()}
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Crown className="h-3 w-3 text-yellow-500" />
              <span className="text-xs text-muted-foreground">
                회원 가입일: {new Date().toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => onProfileClick(user?.id)}
        >
          <User className="mr-2 h-4 w-4" />
          <span>프로필</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>설정</span>
        </DropdownMenuItem>
        {user.role === 'ADMIN' && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigate('/admin/dashboard')}
          >
            <ShieldUser className="mr-2 h-4 w-4" />
            관리자
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
