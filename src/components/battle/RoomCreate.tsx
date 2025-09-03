import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Users, Lock, Calendar, Target, Plus, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
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
    duration: number; // days
    goalType: 'weight_loss' | 'weight_gain' | 'maintain';
    startDate: string;
    endDate: string;
  };
}

interface RoomCreationProps {
  onRoomCreated: (room: Room) => void;
  onCancel: () => void;
}

const RoomCreate = ({ onRoomCreated, onCancel }: RoomCreationProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    password: '',
    maxParticipants: 4,
    duration: 30,
    goalType: 'weight_loss' as const,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + formData.duration);

      const newRoom: Room = {
        id: generateRoomId(),
        name: formData.name,
        description: formData.description,
        password: formData.password,
        createdBy: user.id,
        createdByName: user.nickname,
        participants: [
          {
            userId: user.id,
            userName: user.nickname,
            joinedAt: new Date().toISOString(),
            isReady: false,
          },
        ],
        maxParticipants: formData.maxParticipants,
        createdAt: new Date().toISOString(),
        isActive: false,
        settings: {
          duration: formData.duration,
          goalType: formData.goalType,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      };

      // TODO: API 연동 후 실제 서버에 방 생성 요청하도록 구현

      toast.success('방이 성공적으로 생성되었습니다!');
      onRoomCreated(newRoom);
    } catch (error) {
      console.error('Failed to create room:', error);
      toast.error('방 생성 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedContainer className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />새 대결 방 만들기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 방 기본 정보 */}
          <div className="space-y-4">
            <ValidatedInput
              id="roomName"
              label="방 이름"
              value={formData.name}
              onChange={(value) => handleInputChange('name', String(value))}
              validationRules={validationRules.roomName}
              placeholder="예: 2025 새해 다이어트 챌린지"
              required={true}
              disabled={isLoading}
              validateOnChange={true}
            />

            <div>
              <label className="text-base font-medium">방 설명</label>
              <Textarea
                id="roomDescription"
                placeholder="대결 방에 대한 간단한 설명을 입력해주세요"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', String(e.target.value))
                }
                className="mt-2"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <ValidatedInput
              id="password"
              label="비밀번호"
              type="text"
              value={formData.password}
              onChange={(value) => handleInputChange('password', String(value))}
              validationRules={validationRules.password}
              placeholder="4자리 이상의 영문/숫자"
              required={true}
              disabled={isLoading}
              validateOnChange={true}
            />
            <p className="text-sm text-muted-foreground -mt-2">
              카카오톡 공유시 함께 전달됩니다
            </p>
          </div>

          {/* 방 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>최대 참가자 수</Label>
              <div className="flex gap-2 mt-2">
                {[2, 3, 4].map((num) => (
                  <Button
                    key={num}
                    variant={
                      formData.maxParticipants === num ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleInputChange('maxParticipants', String(num))
                    }
                    className="flex items-center gap-1"
                  >
                    <Users className="h-4 w-4" />
                    {num}명
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>대결 기간</Label>
              <div className="flex gap-2 mt-2">
                {[7, 14, 30, 60].map((days) => (
                  <Button
                    key={days}
                    variant={formData.duration === days ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleInputChange('duration', String(days))}
                    className="flex items-center gap-1"
                  >
                    <Calendar className="h-4 w-4" />
                    {days}일
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>목표 유형</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={
                  formData.goalType === 'weight_loss' ? 'default' : 'outline'
                }
                size="sm"
                onClick={() =>
                  handleInputChange('goalType', String('weight_loss'))
                }
                className="flex items-center gap-1"
              >
                <Target className="h-4 w-4" />
                체중 감량
              </Button>
              <Button
                variant={
                  formData.goalType === 'weight_loss' ? 'default' : 'outline'
                }
                size="sm"
                onClick={() =>
                  handleInputChange('goalType', String('weight_gain'))
                }
                className="flex items-center gap-1"
              >
                <Target className="h-4 w-4" />
                체중 증가
              </Button>
              <Button
                variant={
                  formData.goalType === 'weight_loss' ? 'default' : 'outline'
                }
                size="sm"
                onClick={() =>
                  handleInputChange('goalType', String('maintain'))
                }
                className="flex items-center gap-1"
              >
                <Target className="h-4 w-4" />
                체중 유지
              </Button>
            </div>
          </div>

          {/* 방 정보 요약 */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-3">방 정보 요약</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                최대 {formData.maxParticipants}명
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formData.duration}일간
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                비밀번호 보호
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                {formData.goalType === 'weight_loss'
                  ? '체중 감량'
                  : formData.goalType === 'weight_gain'
                    ? '체중 증가'
                    : '체중 유지'}
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button
                onClick={handleCreateRoom}
                disabled={isLoading || !formData.name || !formData.password}
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
                      <Plus className="h-4 w-4" />
                    </motion.div>
                    방 생성 중...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />방 만들기
                  </>
                )}
              </Button>
            </motion.div>
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              취소
            </Button>
          </div>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
};
export default RoomCreate;
