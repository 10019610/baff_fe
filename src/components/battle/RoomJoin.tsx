import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Users,
  Lock,
  LogIn,
  UserPlus,
  Calendar,
  Target,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import LoginPage from '../../pages/LoginPage';
import AnimatedContainer from '../weightTracker/AnimatedContainer';
import ValidatedInput from '../weightTracker/ValidatedInput';
import { validationRules } from '../../utils/validation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { joinBattleRoom } from '../../services/api/battleRoom.api';

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

interface RoomJoinProps {
  roomId?: string; // URL에서 가져온 방 ID
  onCancel: () => void;
  onRoomJoined: (room: Room) => void;
}

const RoomJoin = ({ roomId, onCancel, onRoomJoined }: RoomJoinProps) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    roomId: roomId || '',
    password: '',
  });
  const [room] = useState<Room | null>(null);
  const [step, setStep] = useState<
    'enter_info' | 'room_found' | 'login_required'
  >('enter_info');

  // 방 참가 mutation
  console.log('onRoomJoined', onRoomJoined);
  const joinRoomMutation = useMutation({
    mutationFn: ({
      entryCode,
      password,
    }: {
      entryCode: string;
      password: string;
    }) => joinBattleRoom(entryCode, password),
    onSuccess: () => {
      toast.success('방에 성공적으로 참가했습니다!');
      // 배틀룸 리스트를 새로고침
      queryClient.invalidateQueries({ queryKey: ['battleRooms'] });
      onCancel(); // 방 리스트로 돌아가기
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error?.response?.data?.message || '방 참가 중 오류가 발생했습니다.';
      toast.error(errorMessage);
    },
  });

  // 로그인 상태 변경 시 처리
  useEffect(() => {
    if (isAuthenticated && step === 'login_required') {
      setStep('room_found');
    }
  }, [isAuthenticated, step]);

  // 방 참가 처리
  const searchRoom = () => {
    if (!formData.roomId || !formData.password) {
      toast.error('방 ID와 비밀번호를 모두 입력해주세요.');
      return;
    }

    joinRoomMutation.mutate({
      entryCode: formData.roomId,
      password: formData.password,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  // 로그인이 필요한 경우
  if (step === 'login_required' && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-medium mb-2">로그인이 필요합니다</h3>
            <p className="text-sm text-muted-foreground mb-4">
              방에 참가하려면 먼저 로그인해주세요
            </p>
            {room && (
              <div className="p-3 bg-muted rounded-lg text-left">
                <p className="font-medium">{room.name}</p>
                <p className="text-sm text-muted-foreground">
                  {room.participants.length}/{room.maxParticipants}명 참가 중
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <LoginPage />
      </div>
    );
  }

  return (
    <AnimatedContainer className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            대결 방 참가하기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'enter_info' && (
            <>
              <div className="space-y-4">
                <ValidatedInput
                  id="roomId"
                  label="방 ID"
                  value={formData.roomId}
                  onChange={(value) =>
                    handleInputChange('roomId', String(value).toUpperCase())
                  }
                  validationRules={validationRules.roomId}
                  placeholder="예: ABC123"
                  required={true}
                  disabled={joinRoomMutation.isPending}
                  validateOnChange={true}
                />

                <ValidatedInput
                  id="password"
                  label="비밀번호"
                  type="password"
                  value={formData.password}
                  onChange={(value) =>
                    handleInputChange('password', String(value))
                  }
                  validationRules={validationRules.password}
                  placeholder="방 비밀번호를 입력하세요"
                  required={true}
                  disabled={joinRoomMutation.isPending}
                  validateOnChange={true}
                />
              </div>

              <div className="flex gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    onClick={searchRoom}
                    disabled={
                      joinRoomMutation.isPending ||
                      !formData.roomId ||
                      !formData.password
                    }
                    className="w-full"
                  >
                    {joinRoomMutation.isPending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className="mr-2"
                        >
                          <Lock className="h-4 w-4" />
                        </motion.div>
                        확인 중...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />방 찾기
                      </>
                    )}
                  </Button>
                </motion.div>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={joinRoomMutation.isPending}
                >
                  취소
                </Button>
              </div>
            </>
          )}

          {step === 'room_found' && room && (
            <>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3">{room.name}</h4>
                {room.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {room.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {room.participants.length}/{room.maxParticipants}명
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {room.settings.duration}일간
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    {getGoalTypeText(room.settings.goalType)}
                  </div>
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    방장: {room.createdByName}
                  </div>
                </div>

                {room.participants.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium mb-2">참가자</h5>
                    <div className="flex flex-wrap gap-2">
                      {room.participants.map(
                        (participant: {
                          userId: string;
                          userName: string;
                          joinedAt: string;
                          isReady: boolean;
                        }) => (
                          <Badge key={participant.userId} variant="secondary">
                            {participant.userName}
                            {participant.userId === room.createdBy && ' (방장)'}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => searchRoom()}
                  disabled={joinRoomMutation.isPending}
                  className="flex-1"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {joinRoomMutation.isPending ? '참가 중...' : '방 참가하기'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep('enter_info')}
                  disabled={joinRoomMutation.isPending}
                >
                  뒤로
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
};
export default RoomJoin;
