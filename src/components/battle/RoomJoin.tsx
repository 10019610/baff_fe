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
  onRoomJoined: (room: Room) => void;
  onCancel: () => void;
}

const RoomJoin = ({ roomId, onRoomJoined, onCancel }: RoomJoinProps) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    roomId: roomId || '',
    password: '',
  });
  const [room] = useState<Room | null>(null); // TODO: API 연동 후 실제 데이터로 설정
  const [isLoading, setIsLoading] = useState(false);
  // const [showLogin, setShowLogin] = useState(false);
  const [step, setStep] = useState<
    'enter_info' | 'room_found' | 'login_required'
  >('enter_info');

  // 로그인 상태 변경 시 처리
  useEffect(() => {
    if (isAuthenticated && step === 'login_required') {
      setStep('room_found');
    }
  }, [isAuthenticated, step]);

  // 방 정보 조회
  const searchRoom = async () => {
    setIsLoading(true);

    try {
      // TODO: API 연동 후 실제 서버에서 방 정보를 조회하도록 구현
      // 임시로 방이 존재한다고 가정
      const foundRoom: Room | null = null;

      if (!foundRoom) {
        toast.error('API 연동 후 구현 예정입니다');
        return;
      }

      // TODO: API 연동 후 아래 로직들을 활성화
      // 비밀번호 확인
      // if (foundRoom.password !== formData.password) {
      //   toast.error('비밀번호가 올바르지 않습니다');
      //   return;
      // }

      // 방이 가득 찬 경우
      // if (foundRoom.participants.length >= foundRoom.maxParticipants) {
      //   toast.error('방이 가득 찼습니다');
      //   return;
      // }

      // setRoom(foundRoom);

      // 로그인되어 있으면 바로 참가, 아니면 로그인 요구
      if (isAuthenticated) {
        setStep('room_found');
      } else {
        setStep('login_required');
      }
    } catch (error) {
      console.error('Failed to search room:', error);
      toast.error('방 검색 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 방 참가
  const joinRoom = async () => {
    if (!user || !room) return;

    // 이미 참가한 사용자인지 확인
    const isAlreadyMember = room.participants.some(
      (p: {
        userId: string;
        userName: string;
        joinedAt: string;
        isReady: boolean;
      }) => p.userId === user.id
    );
    if (isAlreadyMember) {
      toast.error('이미 참가한 방입니다');
      return;
    }

    setIsLoading(true);

    try {
      // 참가자 추가
      const updatedRoom = {
        ...room,
        participants: [
          ...room.participants,
          {
            userId: user.id,
            userName: user.nickname,
            joinedAt: new Date().toISOString(),
            isReady: false,
          },
        ],
      };

      // TODO: API 연동 후 실제 서버에 방 참가 요청하도록 구현

      toast.success('방에 성공적으로 참가했습니다!');
      onRoomJoined(updatedRoom);
    } catch (error) {
      console.error('Failed to join room:', error);
      toast.error('방 참가 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                      isLoading || !formData.roomId || !formData.password
                    }
                    className="w-full"
                  >
                    {isLoading ? (
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
                  disabled={isLoading}
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
                  onClick={joinRoom}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isLoading ? '참가 중...' : '방 참가하기'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep('enter_info')}
                  disabled={isLoading}
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
