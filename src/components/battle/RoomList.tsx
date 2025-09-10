import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Users,
  Target,
  Settings,
  Share2,
  Play,
  Crown,
  Clock,
  Trash2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import AnimatedContainer from '../weightTracker/AnimatedContainer';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api/Api';
import type { BattleRoomListQueryResult } from '../../types/BattleRoom.api.type';
import { useEffect } from 'react';

interface Room {
  name: string;
  password: string;
  description: string;
  hostId: string;
  hostNickName: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'ENDED';
  maxParticipant: number;
  currentParticipant: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  entryCode: string;
}

interface RoomListProps {
  onRoomSelect: (room: Room) => void;
  onInviteRoom: (room: Room) => void;
  onCreateRoom: () => void;
  onRoomCountChange?: (count: number) => void;
}

const RoomList = ({
  onRoomSelect,
  onInviteRoom,
  onCreateRoom,
  onRoomCountChange,
}: RoomListProps) => {
  const { user } = useAuth();

  // 배틀룸 리스트 조회 (WeightTracker 패턴)
  const {
    data: battleRoomData,
    isLoading,
    refetch: refetchBattleRooms,
  } = useQuery({
    queryKey: ['battleRooms', user?.id],
    queryFn: async (): Promise<BattleRoomListQueryResult> => {
      if (!user?.id) return { battleRooms: [] };

      try {
        const response = await api.get('/battle/getBattleRoomList');
        return { battleRooms: response.data };
      } catch (error) {
        console.error('Failed to fetch battle rooms:', error);
        return { battleRooms: [] };
      }
    },
    enabled: !!user?.id,
  });

  // 백엔드 응답을 바로 사용 (변환 불필요)
  const rooms: Room[] = battleRoomData?.battleRooms || [];

  // 방 개수를 부모 컴포넌트에 전달
  useEffect(() => {
    if (onRoomCountChange) {
      onRoomCountChange(rooms.length);
    }
  }, [rooms.length, onRoomCountChange]);

  const handleLeaveRoom = async (entryCode: string) => {
    if (!user) return;

    const confirmed = confirm('정말 방을 나가시겠습니까?');
    if (!confirmed) return;

    try {
      // TODO: API 연동 후 실제 서버에 방 나가기 요청하도록 구현
      // await api.post('/battle/leaveBattleRoom', { entryCode });
      console.log('Leaving room:', entryCode);

      // 방 나가기 후 목록 새로고침
      await refetchBattleRooms();
      toast.success('방에서 나왔습니다');
    } catch (error) {
      console.error('Failed to leave room:', error);
      toast.error('방 나가기 중 오류가 발생했습니다');
    }
  };

  const isRoomOwner = (room: Room) => room.hostId === user?.id;

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-6 w-6" />
                </div>

                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>

                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>

                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-10" />
                  <Skeleton className="h-9 w-10" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <AnimatedContainer direction="fade" className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-medium mb-2">참가한 방이 없습니다</h3>
        <p className="text-sm text-muted-foreground mb-6">
          새로운 방을 만들거나 친구의 초대를 받아보세요
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={onCreateRoom}>새 방 만들기</Button>
        </motion.div>
      </AnimatedContainer>
    );
  }

  return (
    <div className="space-y-4">
      {rooms.map((room, index) => {
        const daysRemaining = getDaysRemaining(room.endDate);
        const isOwner = isRoomOwner(room);
        const isStarted = room.status === 'IN_PROGRESS';

        return (
          <motion.div
            key={room.entryCode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium truncate">{room.name}</h3>
                      {isOwner && (
                        <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      )}
                      <Badge
                        variant={isStarted ? 'default' : 'secondary'}
                        className="flex-shrink-0"
                      >
                        {isStarted ? '진행 중' : '대기 중'}
                      </Badge>
                    </div>
                    {room.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {room.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {room.currentParticipant}/{room.maxParticipant}명
                      </Badge>

                      <Badge variant="outline" className="text-xs">
                        <Target className="h-3 w-3 mr-1" />
                        개인 목표 설정
                      </Badge>

                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {room.status === 'WAITING'
                          ? `${room.durationDays}일간`
                          : daysRemaining > 0
                            ? `${daysRemaining}일 남음`
                            : '종료됨'}
                      </Badge>
                    </div>

                    {/* 호스트 정보 */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      <Badge variant="secondary" className="text-xs">
                        {room.hostNickName} 👑
                      </Badge>
                      {room.currentParticipant > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          +{room.currentParticipant - 1}명
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex gap-2 flex-wrap">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 min-w-0"
                  >
                    <Button
                      onClick={() => onRoomSelect(room)}
                      size="sm"
                      className="w-full"
                    >
                      {isStarted ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          대결 보기
                        </>
                      ) : (
                        <>
                          <Settings className="h-4 w-4 mr-2" />방 입장
                        </>
                      )}
                    </Button>
                  </motion.div>
                  {!isStarted ? (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onInviteRoom(room)}
                        disabled={
                          room.currentParticipant >= room.maxParticipant
                        }
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ) : (
                    ''
                  )}

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeaveRoom(room.entryCode)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default RoomList;
