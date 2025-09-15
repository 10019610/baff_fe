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
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../services/api/Api';
import type {
  CreateBattleRoomRequest,
  BattleRoomListQueryResult,
  BackendBattleRoomDto,
} from '../../types/BattleRoom.api.type';

interface Room {
  name: string;
  password: string;
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

interface RoomCreationProps {
  onRoomCreated?: (room: Room) => void;
  onCancel: () => void;
}

const RoomCreate = ({ onRoomCreated, onCancel }: RoomCreationProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    password: '',
    maxParticipants: 2,
    duration: 30,
  });

  // 배틀룸 리스트 조회 (WeightTracker 패턴)
  const { refetch: refetchBattleRooms } = useQuery({
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

  const { mutate: createBattleRoomMutation, isPending: isLoading } =
    useMutation({
      mutationFn: (param: CreateBattleRoomRequest) =>
        api.post('/battle/createBattleRoom', param),
      onSuccess: async () => {
        toast.success('방이 성공적으로 생성되었습니다!', {
          icon: '🎯',
          duration: 3000,
        });

        // 방 목록 새로고침
        await refetchBattleRooms();

        // onRoomCreated가 있으면 호출, 없으면 취소 버튼 클릭과 동일하게 처리
        if (onRoomCreated) {
          const refetchResult = await refetchBattleRooms();

          if (refetchResult.data?.battleRooms) {
            // 가장 최근에 생성된 방을 찾거나, 내가 생성한 방 중 가장 최신 것을 찾기
            const newRoom =
              refetchResult.data.battleRooms.find(
                (room: BackendBattleRoomDto) =>
                  room.hostId === user!.id && room.name === formData.name
              ) ||
              refetchResult.data.battleRooms[
                refetchResult.data.battleRooms.length - 1
              ];

            if (newRoom) {
              onRoomCreated(newRoom);
              return;
            }
          }
        } else {
          // onRoomCreated가 없으면 취소 버튼과 동일하게 처리 (방 목록으로 돌아가기)
          onCancel();
        }
      },
      onError: (error) => {
        console.error('Failed to create battle room:', error);
        toast.error('방 생성 중 오류가 발생했습니다', {
          icon: '❌',
          duration: 4000,
        });
      },
    });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateRoom = async () => {
    if (!user) return;

    // API 요청을 위한 데이터 준비
    const createRequest: CreateBattleRoomRequest = {
      name: formData.name,
      description: formData.description,
      password: formData.password,
      maxParticipants: formData.maxParticipants,
      durationDays: formData.duration,
    };

    // TanStack Query mutation 실행 - onSuccess에서 response 처리
    createBattleRoomMutation(createRequest);
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
                {[2].map((num) => (
                  <Button
                    key={num}
                    variant={
                      formData.maxParticipants === num ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleInputChange('maxParticipants', num)}
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
                    onClick={() => handleInputChange('duration', days)}
                    className="flex items-center gap-1"
                  >
                    <Calendar className="h-4 w-4" />
                    {days}일
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* 방 정보 요약 */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-3">방 정보 요약</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
              <div className="flex items-start gap-2 sm:col-span-1">
                <Target className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm">개인 목표 설정</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                    각자 체중 감량/유지/증량 목표 설정
                  </div>
                </div>
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
