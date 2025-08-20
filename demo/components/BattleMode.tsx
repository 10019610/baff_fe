import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Plus, Users, Trophy, Calendar, Share2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import RoomCreation from './RoomCreation';
import RoomJoin from './RoomJoin';
import RoomList from './RoomList';
import RoomInvite from './RoomInvite';
import ActiveBattles from './ActiveBattles';
import BattleHistory from './BattleHistory';

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

export default function BattleMode() {
  const [activeTab, setActiveTab] = useState('rooms');
  const [activeRooms, setActiveRooms] = useState(0);
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'join' | 'invite'>('list');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { user } = useAuth();

  // Get active rooms count for badge
  useEffect(() => {
    if (!user) return;

    const updateActiveRooms = () => {
      try {
        const userRooms = JSON.parse(localStorage.getItem(`battleRooms_${user.id}`) || '[]');
        const active = userRooms.filter((room: Room) => !room.isActive).length; // 대기 중인 방들
        setActiveRooms(active);
      } catch (error) {
        console.error('Failed to load rooms:', error);
      }
    };

    updateActiveRooms();

    // Listen for storage changes to update badge
    const handleStorageChange = () => {
      updateActiveRooms();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Polling to check for updates (fallback)
    const interval = setInterval(updateActiveRooms, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

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

  const handleRoomCreated = (room: Room) => {
    setSelectedRoom(room);
    setCurrentView('invite');
  };

  const handleRoomJoined = (room: Room) => {
    setCurrentView('list');
    // 새로 고침하여 방 목록 업데이트
    window.dispatchEvent(new Event('storage'));
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    if (room.isActive) {
      setActiveTab('battles');
    } else {
      // 방 대기실로 이동 (추후 구현)
      console.log('방 대기실:', room);
    }
  };

  const handleInviteRoom = (room: Room) => {
    setSelectedRoom(room);
    setCurrentView('invite');
  };

  const renderRoomsContent = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');
    const password = urlParams.get('password');

    switch (currentView) {
      case 'create':
        return (
          <RoomCreation
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
        return selectedRoom ? (
          <RoomInvite
            room={selectedRoom}
            onClose={() => setCurrentView('list')}
          />
        ) : null;
      
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
        <TabsList className="grid w-full grid-cols-4 mb-6 h-12">
          <TabsTrigger value="rooms" className="flex items-center gap-2 h-10">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">내 방</span>
            <span className="sm:hidden">방</span>
            {activeRooms > 0 && (
              <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {activeRooms}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="join" className="flex items-center gap-2 h-10">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">방 찾기</span>
            <span className="sm:hidden">찾기</span>
          </TabsTrigger>
          
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
                  <Plus className="h-4 w-4" />
                  새 방 만들기
                </button>
                <button
                  onClick={() => setCurrentView('join')}
                  className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  방 참가하기
                </button>
              </div>
            )}
            
            {renderRoomsContent()}
          </div>
        </TabsContent>

        <TabsContent value="join">
          <RoomJoin
            onRoomJoined={handleRoomJoined}
            onCancel={() => {}}
          />
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
}