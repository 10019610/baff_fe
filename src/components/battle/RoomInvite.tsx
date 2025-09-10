import { useState, useEffect } from 'react';
import { Check, Copy, Share2, Users, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'react-hot-toast';
import {
  initKakao,
  createRoomInviteShareData,
  shareToKakao,
} from '../../utils/kakaoShare';

interface RoomInviteProps {
  room: {
    name: string;
    password: string;
    description?: string;
    hostId: string;
    hostNickName: string;
    status: 'WAITING' | 'IN_PROGRESS' | 'ENDED';
    maxParticipant: number;
    currentParticipant: number;
    durationDays: number;
    startDate: string;
    endDate: string;
    entryCode: string;
  };
  onClose: () => void;
}

const RoomInvite = ({ room, onClose }: RoomInviteProps) => {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  // 초대 URL 생성 (실제 도메인으로 변경 필요)
  const inviteUrl = `${import.meta.env.VITE_APP_DOMAIN}/battle/join?roomId=${room.entryCode}&password=${room.password}`;

  // 초대 메시지 생성
  const inviteMessage = `🏃‍♂️ 체중감량 대결방에 초대합니다!

    방 이름: ${room.name}
    방 코드: ${room.entryCode}
    비밀번호: ${room.password}

    함께 목표를 달성해보세요!
    ${inviteUrl}`;

  // 카카오 SDK 초기화
  useEffect(() => {
    initKakao();
  }, []);

  // 클립보드 복사 함수
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems((prev) => new Set(prev).add(type));
      toast.success('복사되었습니다!');

      // 2초 후 복사 상태 해제
      setTimeout(() => {
        setCopiedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(type);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error('복사에 실패했습니다.');
    }
  };

  // 카카오톡 공유 함수
  const handleKakaoShare = () => {
    const shareData = createRoomInviteShareData(room.name, inviteUrl);

    shareToKakao(shareData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            친구 초대하기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 방 정보 */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">{room.name}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                {room.currentParticipant}/{room.maxParticipant}명
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                비밀번호: {room.password}
              </div>
            </div>
          </div>

          {/* 카카오톡 공유 */}
          <div className="space-y-4">
            <div>
              <Label>카카오톡으로 초대</Label>
              <div className="mt-2">
                <button onClick={handleKakaoShare} className="">
                  <img
                    src="/kakaotalk_sharing_btn_medium.png"
                    alt="카카오톡으로 공유하기"
                    className="w-full h-auto hover:opacity-90 transition-opacity"
                    onMouseOver={(e) => {
                      e.currentTarget.src = '/kakaotalk_sharing_btn_small.png';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.src = '/kakaotalk_sharing_btn_small.png';
                    }}
                  />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                방 링크와 비밀번호가 포함된 메시지를 전송합니다
              </p>
            </div>

            {/* 초대 링크 */}
            <div>
              <Label>초대 링크</Label>
              <div className="flex gap-2 mt-2">
                <Input value={inviteUrl} readOnly className="flex-1" />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(inviteUrl, 'link')}
                  className="px-3"
                >
                  {copiedItems.has('link') ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                링크에 비밀번호가 포함되어 있습니다
              </p>
            </div>

            {/* 초대 메시지 */}
            <div>
              <Label>초대 메시지</Label>
              <div className="mt-2">
                <div className="p-3 bg-muted rounded border text-sm whitespace-pre-line">
                  {inviteMessage}
                </div>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(inviteMessage, 'message')}
                  className="w-full mt-2"
                >
                  {copiedItems.has('message') ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      메시지 복사
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 방 ID와 비밀번호 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>방 코드</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={room.entryCode} readOnly className="flex-1" />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(room.entryCode, 'roomId')}
                    className="px-3"
                  >
                    {copiedItems.has('roomId') ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label>비밀번호</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={room.password} readOnly className="flex-1" />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(room.password, 'password')}
                    className="px-3"
                  >
                    {copiedItems.has('password') ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 안내 사항 */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              초대 안내
            </h5>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• 친구가 링크를 클릭하면 자동으로 방 정보가 입력됩니다</li>
              <li>• 비회원인 경우 비밀번호 입력 후 회원가입할 수 있습니다</li>
              <li>• 최대 {room.maxParticipant}명까지 참가할 수 있습니다</li>
              <li>• 모든 참가자가 준비되면 대결이 시작됩니다</li>
            </ul>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              닫기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomInvite;
