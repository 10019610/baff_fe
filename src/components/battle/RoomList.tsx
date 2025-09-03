import { useState, useEffect } from 'react';
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

interface Room {
  id: string;
  name: string;
  description: string;
  password: string;
  createdBy: string;
  createdByName: string;
  participants: Array<{
    userId: string;
    userName: string;
    joinedAt: string;
    isReady: boolean;
  }>;
  maxParticipants: number;
  createdAt: string;
  isActive: boolean;
  settings: {
    duration: number;
    goalType: 'weight_loss' | 'weight_gain' | 'maintain';
    startDate: string;
    endDate: string;
  };
}

interface RoomListProps {
  onRoomSelect: (room: Room) => void;
  onInviteRoom: (room: Room) => void;
  onCreateRoom: () => void;
}

const RoomList = ({
  onRoomSelect,
  onInviteRoom,
  onCreateRoom,
}: RoomListProps) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, [user]);

  const loadRooms = async () => {
    if (!user) return;

    // Simulate loading delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      // TODO: API 연동 후 실제 서버에서 사용자의 방 목록을 가져오도록 구현
      setRooms([]); // 임시로 빈 배열 설정
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    if (!user) return;

    const confirmed = confirm('정말 방을 나가시겠습니까?');
    if (!confirmed) return;

    try {
      // TODO: API 연동 후 실제 서버에 방 나가기 요청하도록 구현
      const userRooms = rooms.filter((room) => room.id !== roomId);

      setRooms(userRooms);
      toast.success('방에서 나왔습니다');
    } catch (error) {
      console.error('Failed to leave room:', error);
      toast.error('방 나가기 중 오류가 발생했습니다');
    }
  };

  const getGoalTypeText = (goalType: string) => {
    switch (goalType) {
      case 'weight_loss':
        return '체중 감량';
      case 'weight_gain':
        return '체중 증가';
      case 'maintain':
        return '체중 유지';
      default:
        return goalType;
    }
  };

  const getGoalTypeColor = (goalType: string) => {
    switch (goalType) {
      case 'weight_loss':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
      case 'weight_gain':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
      case 'maintain':
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200';
    }
  };

  const isRoomOwner = (room: Room) => room.createdBy === user?.id;

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
        const daysRemaining = getDaysRemaining(room.settings.endDate);
        const isOwner = isRoomOwner(room);
        const isStarted = room.isActive;

        return (
          <motion.div
            key={room.id}
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
                        {room.participants.length}/{room.maxParticipants}명
                      </Badge>

                      <Badge
                        variant="outline"
                        className={`text-xs ${getGoalTypeColor(room.settings.goalType)}`}
                      >
                        <Target className="h-3 w-3 mr-1" />
                        {getGoalTypeText(room.settings.goalType)}
                      </Badge>

                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {daysRemaining > 0
                          ? `${daysRemaining}일 남음`
                          : '종료됨'}
                      </Badge>
                    </div>

                    {/* 참가자 목록 */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {room.participants.slice(0, 3).map((participant) => (
                        <Badge
                          key={participant.userId}
                          variant="secondary"
                          className="text-xs"
                        >
                          {participant.userName}
                          {participant.userId === room.createdBy && ' 👑'}
                        </Badge>
                      ))}
                      {room.participants.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{room.participants.length - 3}명
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

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onInviteRoom(room)}
                      disabled={
                        room.participants.length >= room.maxParticipants
                      }
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeaveRoom(room.id)}
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
