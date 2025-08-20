import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Users, 
  Calendar, 
  Target,
  Settings,
  Share2,
  Play,
  Pause,
  Crown,
  Clock,
  Trash2
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner@2.0.3';

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

export default function RoomList({ onRoomSelect, onInviteRoom, onCreateRoom }: RoomListProps) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, [user]);

  const loadRooms = () => {
    if (!user) return;

    try {
      const userRooms = JSON.parse(localStorage.getItem(`battleRooms_${user.id}`) || '[]');
      setRooms(userRooms);
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
      // 사용자 방 목록에서 제거
      const userRooms = rooms.filter(room => room.id !== roomId);
      localStorage.setItem(`battleRooms_${user.id}`, JSON.stringify(userRooms));

      // 글로벌 방 목록에서 참가자 제거
      const allRooms = JSON.parse(localStorage.getItem('allBattleRooms') || '[]');
      const updatedAllRooms = allRooms.map((room: Room) => {
        if (room.id === roomId) {
          return {
            ...room,
            participants: room.participants.filter(p => p.userId !== user.id)
          };
        }
        return room;
      }).filter((room: Room) => room.participants.length > 0); // 참가자가 없는 방은 삭제

      localStorage.setItem('allBattleRooms', JSON.stringify(updatedAllRooms));

      setRooms(userRooms);
      toast.success('방에서 나왔습니다');
    } catch (error) {
      toast.error('방 나가기 중 오류가 발생했습니다');
    }
  };

  const getGoalTypeText = (goalType: string) => {
    switch (goalType) {
      case 'weight_loss': return '체중 감량';
      case 'weight_gain': return '체중 증가';
      case 'maintain': return '체중 유지';
      default: return goalType;
    }
  };

  const getGoalTypeColor = (goalType: string) => {
    switch (goalType) {
      case 'weight_loss': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
      case 'weight_gain': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
      case 'maintain': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200';
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
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-16"></div>
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
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-medium mb-2">참가한 방이 없습니다</h3>
        <p className="text-sm text-muted-foreground mb-6">
          새로운 방을 만들거나 친구의 초대를 받아보세요
        </p>
        <Button onClick={onCreateRoom}>
          새 방 만들기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rooms.map((room) => {
        const daysRemaining = getDaysRemaining(room.settings.endDate);
        const isOwner = isRoomOwner(room);
        const isStarted = room.isActive;
        
        return (
          <Card key={room.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium truncate">{room.name}</h3>
                    {isOwner && (
                      <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    )}
                    <Badge 
                      variant={isStarted ? "default" : "secondary"}
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
                      {daysRemaining > 0 ? `${daysRemaining}일 남음` : '종료됨'}
                    </Badge>
                  </div>

                  {/* 참가자 목록 */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {room.participants.slice(0, 3).map((participant) => (
                      <Badge key={participant.userId} variant="secondary" className="text-xs">
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
                <Button
                  onClick={() => onRoomSelect(room)}
                  size="sm"
                  className="flex-1 min-w-0"
                >
                  {isStarted ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      대결 보기
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      방 입장
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onInviteRoom(room)}
                  disabled={room.participants.length >= room.maxParticipants}
                >
                  <Share2 className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLeaveRoom(room.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}