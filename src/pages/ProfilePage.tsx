import { useParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Calendar, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api/Api.ts';
import { userInitializer } from '../types/User.initializer.ts';
import { formatDate } from '../utils/DateUtil.ts';

/**
 * 유저 프로필 페이지
 *
 * @description
 *
 * @author hjkim
 * @constructor
 */
const ProfilePage = () => {
  /**
   * Hooks
   */
  /* User Id */
  const { userId } = useParams();

  /**
   * APIs
   */
  /* 유저 정보 조회 api */
  const { data: userInfo } = useQuery({
    queryKey: ['userId'],
    initialData: userInitializer.INITIAL_GET_USER_INFO,
    queryFn: () => api.get(`/user/getUserInfo/${userId}`).then((res) => {
      return res.data;
    }),
  });
  const getProviderInfo = () => {
    if (userInfo.provider === 'google') {
      return {
        name: 'Google',
        color: 'bg-blue-500',
        textColor: 'text-white'
      };
    }
    if (userInfo.provider === 'kakao') {
      return {
        name: 'Kakao',
        color: 'bg-[#FEE500]',
        textColor: 'text-black'
      };
    }
    return {
      name: 'ChangeUp',
      color: 'bg-gray-500',
      textColor: 'text-white'
    };
  };

  const providerInfo = getProviderInfo();
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-25">
                <AvatarImage src={userInfo.userProfileUrl} alt={userInfo.nickname} />
                <AvatarFallback
                  className="bg-primary text-primary-foreground text-2xl">{userInfo.nickname}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1">
                <Badge variant="outline" className={`${providerInfo.color} ${providerInfo.color} border-2 border-white`}>{providerInfo.name}</Badge>
              </div>
            </div>
            {/* 사용자 정보 */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-medium mb-2">{userInfo.nickname}</h1>
              <p className="text-muted-foreground mb-4">{userInfo.email}</p>
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>가입일: {formatDate(userInfo.regDateTime)}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>활동 1일째</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
