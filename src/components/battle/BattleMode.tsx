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
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useIsMobile } from '../ui/use-mobile';

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
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('battles');
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

  // 스와이프 제스처를 위한 motion values
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.7, 1, 0.7]);

  // 탭 순서 정의
  const tabs = ['rooms', 'battles', 'history'];
  const currentTabIndex = tabs.indexOf(activeTab);

  // 탭 변경 시 상태 초기화
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);

    // 내 방 탭으로 돌아올 때만 상태 초기화
    if (newTab === 'rooms') {
      setCurrentView('list');
      setSelectedRoom(null);
      setSelectedBattleEntryCode(null);
      setInviteParams(null);
    }
  };

  // 스와이프로 탭 변경
  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      // 왼쪽으로 스와이프 → 다음 탭
      const nextIndex = Math.min(currentTabIndex + 1, tabs.length - 1);
      if (nextIndex !== currentTabIndex) {
        handleTabChange(tabs[nextIndex]);
        // 탭 변경 후 최상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // 오른쪽으로 스와이프 → 이전 탭
      const prevIndex = Math.max(currentTabIndex - 1, 0);
      if (prevIndex !== currentTabIndex) {
        handleTabChange(tabs[prevIndex]);
        // 탭 변경 후 최상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // URL에서 roomId와 password 파라미터 확인 (초대 링크 처리)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');
    const password = urlParams.get('password');

    if (roomId && password) {
      setInviteParams({ roomId, password });

      // 로그인 상태 확인
      if (!isAuthenticated) {
        // 로그인되지 않았으면 현재 URL을 sessionStorage에 저장하고 로그인 페이지로 이동
        const currentUrl = window.location.href;
        sessionStorage.setItem('pendingInviteUrl', currentUrl);

        window.location.href = `/login`;
        return;
      }

      // 로그인되어 있으면 inviteJoin 뷰로 설정
      setCurrentView('inviteJoin');
      setActiveTab('rooms');

      // URL 파라미터 정리
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isAuthenticated]);

  // const handleRoomJoined = () => {
  //   setCurrentView('list');
  //   // 새로 고침하여 방 목록 업데이트
  // };

  const handleRoomSelect = (room: Room) => {
    if (room.status === 'IN_PROGRESS') {
      setSelectedBattleEntryCode(room.entryCode);
      setActiveTab('battles');
    } else if (room.status === 'ENDED') {
      // 종료된 방의 경우 기록 탭으로 이동
      setActiveTab('history');
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
            // onRoomJoined={handleRoomJoined}
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
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-6 h-12 bg-blue-50">
          <TabsTrigger value="rooms" className="flex items-center gap-2 h-10">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">대기방</span>
            <span className="sm:hidden">대기방</span>
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
            <span className="sm:hidden">진행 중</span>
          </TabsTrigger>

          <TabsTrigger value="history" className="flex items-center gap-2 h-10">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">결과</span>
            <span className="sm:hidden">결과</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms">
          <motion.div
            className="space-y-6"
            style={{ x, opacity, touchAction: isMobile ? 'pan-y' : 'auto' }}
            drag={isMobile ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (isMobile) {
                if (info.offset.x > 50) {
                  // 오른쪽으로 스와이프 → 이전 탭
                  handleSwipe('right');
                } else if (info.offset.x < -50) {
                  // 왼쪽으로 스와이프 → 다음 탭
                  handleSwipe('left');
                }
                // x 값을 0으로 리셋
                x.set(0);
              }
            }}
          >
            {/* 상단 액션 버튼들 */}
            {currentView === 'list' && (
              <div className="space-y-4">
                {/* 모바일: 세련된 카드 스타일 액션 버튼 */}
                <div className="grid gap-3 md:hidden">
                  <div
                    onClick={() => setCurrentView('create')}
                    className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-4 cursor-pointer transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm">
                          <Plus className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium">새 방 만들기</h3>
                          <p className="text-sm text-primary-foreground/80">
                            친구들과 함께 대결 시작
                          </p>
                        </div>
                      </div>
                      <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                    {/* 배경 효과 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  </div>

                  <div
                    onClick={() => setCurrentView('join')}
                    className="group relative overflow-hidden bg-card border border-border rounded-xl p-4 cursor-pointer transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:border-primary/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                          <Share2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium">초대 코드로 참가</h3>
                          <p className="text-sm text-muted-foreground">
                            친구의 방에 참여하기
                          </p>
                        </div>
                      </div>
                      <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-5 h-5 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                    {/* 배경 효과 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  </div>
                </div>

                {/* 데스크톱: 기존 버튼 스타일 유지 */}
                <div className="hidden md:flex gap-3 justify-start">
                  <button
                    onClick={() => setCurrentView('create')}
                    className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
                  >
                    <Plus className="h-4 w-4" />새 대결 시작하기
                  </button>
                  <button
                    onClick={() => setCurrentView('join')}
                    className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-card border border-border rounded-lg hover:bg-muted hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
                  >
                    <Share2 className="h-4 w-4" />
                    초대 코드로 참가
                  </button>
                </div>
              </div>
            )}

            {renderRoomsContent()}
          </motion.div>
        </TabsContent>

        <TabsContent value="battles">
          <motion.div
            style={{ x, opacity, touchAction: isMobile ? 'pan-y' : 'auto' }}
            drag={isMobile ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (isMobile) {
                if (info.offset.x > 50) {
                  // 오른쪽으로 스와이프 → 이전 탭
                  handleSwipe('right');
                } else if (info.offset.x < -50) {
                  // 왼쪽으로 스와이프 → 다음 탭
                  handleSwipe('left');
                }
                // x 값을 0으로 리셋
                x.set(0);
              }
            }}
          >
            <ActiveBattles
              selectedEntryCode={selectedBattleEntryCode}
              onBattleSelected={() => setSelectedBattleEntryCode(null)}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="history">
          <motion.div
            style={{ x, opacity, touchAction: isMobile ? 'pan-y' : 'auto' }}
            drag={isMobile ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (isMobile) {
                if (info.offset.x > 50) {
                  // 오른쪽으로 스와이프 → 이전 탭
                  handleSwipe('right');
                } else if (info.offset.x < -50) {
                  // 왼쪽으로 스와이프 → 다음 탭
                  handleSwipe('left');
                }
                // x 값을 0으로 리셋
                x.set(0);
              }
            }}
          >
            <BattleHistory selectedRoomEntryCode={selectedRoom?.entryCode} />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BattleMode;
