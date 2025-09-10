import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { Users, Plus, Trophy, Calendar, Share2 } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import RoomJoin from './RoomJoin';
import ActiveBattles from './ActiveBattles';
import BattleHistory from './BattleHistory';
import { useEffect, useState } from 'react';
import RoomInvite from './RoomInvite';
import RoomInviteJoin from './RoomInviteJoin';
import RoomList from './RoomList';
import RoomCreate from './RoomCreate';
import RoomLobby from './RoomLobby';
import { useAuth } from '../../context/AuthContext';

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

const BattleMode = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('rooms');
  const [roomCount, setRoomCount] = useState(0);
  const [currentView, setCurrentView] = useState<
    'list' | 'create' | 'join' | 'invite' | 'inviteJoin' | 'lobby'
  >('list');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBattleEntryCode, setSelectedBattleEntryCode] = useState<
    string | null
  >(null);
  const [inviteParams, setInviteParams] = useState<{
    roomId: string;
    password: string;
  } | null>(null);

  // URL에서 roomId와 password 파라미터 확인 (초대 링크 처리)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');
    const password = urlParams.get('password');

    if (roomId && password) {
      setInviteParams({ roomId, password });

      // 로그인 상태 확인
      if (!isAuthenticated) {
        // 로그인되지 않았으면 로그인 페이지로 리다이렉트 (URL 파라미터 유지)
        const currentUrl = window.location.href;
        window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
        return;
      }

      // 로그인되어 있으면 inviteJoin 뷰로 설정
      setCurrentView('inviteJoin');
      setActiveTab('rooms');

      // URL 파라미터 정리
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isAuthenticated]);

  const handleRoomJoined = () => {
    setCurrentView('list');
    // 새로 고침하여 방 목록 업데이트
  };

  const handleRoomSelect = (room: Room) => {
    if (room.status === 'IN_PROGRESS') {
      setSelectedBattleEntryCode(room.entryCode);
      setActiveTab('battles');
    } else {
      // 방 대기실로 이동
      setSelectedRoom(room);
      setCurrentView('lobby');
    }
  };

  const handleInviteRoom = (room: Room) => {
    setSelectedRoom(room);
    setCurrentView('invite');
  };

  const handleInviteLogin = () => {
    // 로그인 페이지로 리다이렉트 (현재 URL을 저장)
    const currentUrl = window.location.href;
    window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
  };

  const renderRoomsContent = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');
    // const password = urlParams.get('password');

    switch (currentView) {
      case 'create':
        return <RoomCreate onCancel={() => setCurrentView('list')} />;

      case 'join':
        return (
          <RoomJoin
            roomId={roomId || undefined}
            onRoomJoined={handleRoomJoined}
            onCancel={() => setCurrentView('list')}
          />
        );

      case 'invite':
        return selectedRoom ? (
          <RoomInvite
            room={selectedRoom}
            onClose={() => setCurrentView('list')}
          />
        ) : (
          <div>방을 선택해주세요.</div>
        );

      case 'inviteJoin':
        return inviteParams ? (
          <RoomInviteJoin
            roomId={inviteParams.roomId}
            password={inviteParams.password}
            onLogin={handleInviteLogin}
            onCancel={() => setCurrentView('list')}
          />
        ) : (
          <div>잘못된 링크입니다.</div>
        );

      case 'lobby':
        return (
          <RoomLobby
            room={selectedRoom}
            onBack={() => setCurrentView('list')}
            onBattleStarted={() => setActiveTab('battles')}
          />
        );

      default:
        return (
          <RoomList
            onRoomSelect={handleRoomSelect}
            onInviteRoom={handleInviteRoom}
            onCreateRoom={() => setCurrentView('create')}
            onRoomCountChange={setRoomCount}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center md:text-left">
        <h1 className="mb-2">대결 모드</h1>
        <p className="text-muted-foreground">
          친구들과 함께 체중 관리 목표에 도전해보세요
        </p>
      </div>

      {/* Battle Mode Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
          <TabsTrigger value="rooms" className="flex items-center gap-2 h-10">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">내 방</span>
            <span className="sm:hidden">방</span>
            {roomCount > 0 && (
              <Badge
                variant="default"
                className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {roomCount}
              </Badge>
            )}
          </TabsTrigger>

          {/* <TabsTrigger value="join" className="flex items-center gap-2 h-10">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">방 찾기</span>
            <span className="sm:hidden">찾기</span>
          </TabsTrigger> */}

          <TabsTrigger value="battles" className="flex items-center gap-2 h-10">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">진행 중</span>
            <span className="sm:hidden">대결</span>
          </TabsTrigger>

          <TabsTrigger value="history" className="flex items-center gap-2 h-10">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">기록</span>
            <span className="sm:hidden">기록</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms">
          <div className="space-y-6">
            {/* 상단 액션 버튼들 */}
            {currentView === 'list' && (
              <div className="flex gap-3 justify-center md:justify-start">
                <button
                  onClick={() => setCurrentView('create')}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />새 방 만들기
                </button>
                <button
                  onClick={() => setCurrentView('join')}
                  className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Share2 className="h-4 w-4" />방 참가하기
                </button>
              </div>
            )}
            {renderRoomsContent()}
          </div>
        </TabsContent>

        <TabsContent value="join">
          <RoomJoin onRoomJoined={handleRoomJoined} onCancel={() => {}} />
        </TabsContent>

        <TabsContent value="battles">
          <ActiveBattles
            selectedEntryCode={selectedBattleEntryCode}
            onBattleSelected={() => setSelectedBattleEntryCode(null)}
          />
        </TabsContent>

        <TabsContent value="history">
          <BattleHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BattleMode;
