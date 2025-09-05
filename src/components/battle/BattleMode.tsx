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
import RoomList from './RoomList';
import RoomCreate from './RoomCreate';

interface Room {
  name: string;
  password: string;
  hostId: string;
  hostNickName: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  maxParticipant: number;
  currentParticipant: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  entryCode: string;
}

const BattleMode = () => {
  const [activeTab, setActiveTab] = useState('rooms');
  // const [activeRooms, setActiveRooms] = useState(0);
  const [currentView, setCurrentView] = useState<
    'list' | 'create' | 'join' | 'invite'
  >('list');
  // const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // URL에서 roomId와 password 파라미터 확인 (초대 링크 처리)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');
    const password = urlParams.get('password');

    if (roomId && password) {
      setCurrentView('join');
      setActiveTab('rooms');

      // URL 파라미터 정리
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleRoomCreated = () => {
    setCurrentView('invite');
  };

  const handleRoomJoined = () => {
    setCurrentView('list');
    // 새로 고침하여 방 목록 업데이트
  };

  const handleRoomSelect = (room: Room) => {
    if (room.status === 'IN_PROGRESS') {
      setActiveTab('battles');
    } else {
      // 방 대기실로 이동 (추후 구현)
      console.log('방 대기실:', room);
    }
  };

  const handleInviteRoom = () => {
    setCurrentView('invite');
  };

  const renderRoomsContent = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');
    // const password = urlParams.get('password');

    switch (currentView) {
      case 'create':
        return (
          <RoomCreate
            onRoomCreated={handleRoomCreated}
            onCancel={() => setCurrentView('list')}
          />
        );

      case 'join':
        return (
          <RoomJoin
            roomId={roomId || undefined}
            onRoomJoined={handleRoomJoined}
            onCancel={() => setCurrentView('list')}
          />
        );

      case 'invite':
        return (
          <RoomInvite
          // room={selectedRoom}
          // onClose={() => setCurrentView('list')}
          />
        );

      default:
        return (
          <RoomList
            onRoomSelect={handleRoomSelect}
            onInviteRoom={handleInviteRoom}
            onCreateRoom={() => setCurrentView('create')}
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
            {/* {activeRooms > 0 && ( */}
            <Badge
              variant="default"
              className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              1{/* {activeRooms} */}
            </Badge>
            {/* )} */}
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
          <ActiveBattles />
        </TabsContent>

        <TabsContent value="history">
          <BattleHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BattleMode;
