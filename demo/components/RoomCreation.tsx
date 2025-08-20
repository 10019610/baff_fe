import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Users, 
  Lock, 
  Calendar, 
  Target,
  Plus,
  UserPlus
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

export default function RoomCreation({ onRoomCreated, onCancel }: RoomCreationProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    password: '',
    maxParticipants: 4,
    duration: 30,
    goalType: 'weight_loss' as const
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    if (!user) return;
    
    if (!formData.name.trim()) {
      toast.error('방 이름을 입력해주세요');
      return;
    }
    
    if (!formData.password.trim()) {
      toast.error('비밀번호를 입력해주세요');
      return;
    }
    
    if (formData.password.length < 4) {
      toast.error('비밀번호는 4자리 이상이어야 합니다');
      return;
    }

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
        createdByName: user.name,
        participants: [{
          userId: user.id,
          userName: user.name,
          joinedAt: new Date().toISOString(),
          isReady: false
        }],
        maxParticipants: formData.maxParticipants,
        createdAt: new Date().toISOString(),
        isActive: false,
        settings: {
          duration: formData.duration,
          goalType: formData.goalType,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      };

      // Save to localStorage (사용자별 데이터)
      const existingRooms = JSON.parse(localStorage.getItem(`battleRooms_${user.id}`) || '[]');
      existingRooms.push(newRoom);
      localStorage.setItem(`battleRooms_${user.id}`, JSON.stringify(existingRooms));

      // Save to global rooms list for joining
      const globalRooms = JSON.parse(localStorage.getItem('allBattleRooms') || '[]');
      globalRooms.push(newRoom);
      localStorage.setItem('allBattleRooms', JSON.stringify(globalRooms));

      toast.success('방이 성공적으로 생성되었습니다!');
      onRoomCreated(newRoom);
    } catch (error) {
      toast.error('방 생성 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            새 대결 방 만들기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 방 기본 정보 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="roomName">방 이름 *</Label>
              <Input
                id="roomName"
                placeholder="예: 2025 새해 다이어트 챌린지"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="roomDescription">방 설명</Label>
              <Textarea
                id="roomDescription"
                placeholder="대결 방에 대한 간단한 설명을 입력해주세요"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="password">비밀번호 *</Label>
              <Input
                id="password"
                type="text"
                placeholder="4자리 이상의 비밀번호"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                카카오톡 공유시 함께 전달됩니다
              </p>
            </div>
          </div>

          {/* 방 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>최대 참가자 수</Label>
              <div className="flex gap-2 mt-2">
                {[2, 3, 4].map((num) => (
                  <Button
                    key={num}
                    variant={formData.maxParticipants === num ? "default" : "outline"}
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
                    variant={formData.duration === days ? "default" : "outline"}
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

          <div>
            <Label>목표 유형</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={formData.goalType === 'weight_loss' ? "default" : "outline"}
                size="sm"
                onClick={() => handleInputChange('goalType', 'weight_loss')}
                className="flex items-center gap-1"
              >
                <Target className="h-4 w-4" />
                체중 감량
              </Button>
              <Button
                variant={formData.goalType === 'weight_gain' ? "default" : "outline"}
                size="sm"
                onClick={() => handleInputChange('goalType', 'weight_gain')}
                className="flex items-center gap-1"
              >
                <Target className="h-4 w-4" />
                체중 증가
              </Button>
              <Button
                variant={formData.goalType === 'maintain' ? "default" : "outline"}
                size="sm"
                onClick={() => handleInputChange('goalType', 'maintain')}
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
                {formData.goalType === 'weight_loss' ? '체중 감량' : 
                 formData.goalType === 'weight_gain' ? '체중 증가' : '체중 유지'}
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="flex-1"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {isLoading ? '방 생성 중...' : '방 만들기'}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              취소
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}