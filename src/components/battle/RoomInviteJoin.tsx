import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { LogIn, CheckCircle, AlertCircle, UserPlus, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import AnimatedContainer from '../weightTracker/AnimatedContainer';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBattleRoomDetails,
  joinBattleRoom,
} from '../../services/api/battleRoom.api';
import { useNavigate } from 'react-router-dom';

interface RoomInviteJoinProps {
  roomId: string;
  password: string;
  onCancel: () => void;
}

const RoomInviteJoin = ({
  roomId,
  password,
  onCancel,
}: RoomInviteJoinProps) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'ready' | 'joining' | 'success' | 'error'>(
    'ready'
  );
  const [isJoining, setIsJoining] = useState(false);

  const navigate = useNavigate();

  // 방 참가 mutation
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
      queryClient.invalidateQueries({ queryKey: ['battleRooms'] });
      setStep('success');
      // 2초 후 방 목록으로 이동
      setTimeout(() => {
        onCancel();
      }, 2000);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error?.response?.data?.message || '방 참가 중 오류가 발생했습니다.';
      toast.error(errorMessage);
      setStep('error');
    },
  });

  const handleJoinRoom = async () => {
    if (!isAuthenticated) {
      // 현재 URL을 sessionStorage에 저장하고 로그인 페이지로 이동
      const currentUrl = window.location.href;
      sessionStorage.setItem('pendingInviteUrl', currentUrl);
      window.location.href = `/login`;
      return;
    }

    // 방 상세 정보가 로드되지 않았거나 에러가 있는 경우
    if (isRoomDetailLoading) {
      toast.error('방 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (roomDetailError) {
      setStep('error');
      toast.error('방 정보를 불러올 수 없습니다.');
      return;
    }

    if (!roomDetail) {
      setStep('error');
      toast.error('방 정보가 없습니다.');
      return;
    }

    // 방 상태 유효성 검사
    if (roomDetail.status === 'IN_PROGRESS' || roomDetail.status === 'ENDED') {
      setStep('error');
      toast.error('이미 시작되었거나 종료된 방입니다.');
      navigate('/battle');
      return;
    }

    // 이미 참가한 방인지 확인
    if (roomDetail.status === 'WAITING') {
      const isAlreadyParticipant = roomDetail.participants.some(
        (participant) => Number(participant.userId) === Number(user?.id)
      );

      if (isAlreadyParticipant) {
        setStep('error');
        toast.error('이미 참가한 방입니다.');
        navigate('/battle');
        return;
      }
    }

    setIsJoining(true);
    setStep('joining');
    joinRoomMutation.mutate({
      entryCode: roomId,
      password: password,
    });
  };

  // 방 상세 정보 조회
  const {
    data: roomDetail,
    isLoading: isRoomDetailLoading,
    error: roomDetailError,
  } = useQuery({
    queryKey: ['battleRoomDetail', roomId],
    queryFn: () => {
      if (!roomId) {
        throw new Error('방 코드가 없습니다');
      }
      return getBattleRoomDetails(roomId);
    },
    enabled: !!roomId,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 방지
  });

  // 에러 상태
  if (step === 'error') {
    return (
      <AnimatedContainer className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="font-medium mb-2">방 참가 실패</h3>
              <p className="text-sm text-muted-foreground mb-6">
                방 코드나 비밀번호를 확인해주세요. 방이 삭제되었거나 잘못된
                정보일 수 있습니다.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setStep('ready')} className="flex-1">
                  다시 시도
                </Button>
                <Button onClick={onCancel} variant="outline">
                  취소
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>
    );
  }

  // 성공 상태
  if (step === 'success') {
    return (
      <AnimatedContainer className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="font-medium mb-2">방 참가 완료!</h3>
              <p className="text-sm text-muted-foreground mb-6">
                방 목록으로 이동합니다...
              </p>
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>
    );
  }

  // 기본 상태 - 방 참가 준비
  return (
    <AnimatedContainer className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            초대받은 방
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 환영 메시지 */}
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              <strong>{user?.nickname}님</strong>대결에 참가하시겠습니까?
              <br />
              <span className="text-sm text-muted-foreground">
                방 코드와 비밀번호가 자동으로 입력됩니다.
              </span>
            </AlertDescription>
          </Alert>

          {/* 방 입장 정보 */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">입장 정보</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">방 코드</label>
                <div className="p-3 bg-muted rounded-lg border text-sm font-mono text-center">
                  {roomId}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  비밀번호
                </label>
                <div className="p-3 bg-muted rounded-lg border text-sm font-mono text-center">
                  {password}
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
                onClick={handleJoinRoom}
                disabled={isJoining}
                className="w-full h-12 text-base"
              >
                {isJoining ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    입장 중...
                  </>
                ) : !isAuthenticated ? (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    로그인하고 입장하기
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />방 입장하기
                  </>
                )}
              </Button>
            </motion.div>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isJoining}
              className="h-12 px-6"
            >
              취소
            </Button>
          </div>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
};

export default RoomInviteJoin;
