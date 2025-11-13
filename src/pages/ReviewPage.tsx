import { PenSquare, Star, Loader2, TrendingUp, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Drawer, DrawerContent, DrawerTitle } from '../components/ui/drawer';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import ReviewForm from '../components/review/ReviewForm';
import { useIsMobile } from '../components/ui/use-mobile';
import { Skeleton } from '../components/ui/skeleton';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import ReviewCard from '../components/review/ReviewCard';
import type { Review, ReviewListItem } from '../types/review.type';
import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getReviewList } from '../services/api/review.api';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/auth/LoginModal';

// ReviewListItem을 Review 인터페이스로 변환하는 헬퍼 함수
const convertToReview = (item: ReviewListItem): Review => ({
  id: item.reviewId.toString(), // 실제 리뷰 ID 사용
  userId: item.userId.toString(),
  userName: item.userNickName, // 백엔드에서 받아온 닉네임 사용
  title: item.title,
  content: item.content,
  dietMethods: item.dietMethods.split(',').map((m) => m.trim()),
  difficulty: item.difficulty,
  startWeight: item.startWeight,
  endWeight: item.targetWeight,
  duration: item.period,
  createdAt: new Date(item.regDateTime).toISOString().split('T')[0],
  likes: item.likes,
  liked: item.liked, // 백엔드에서 받은 좋아요 상태
  hardestPeriod: item.question_hardest_period,
  dietManagement: item.question_diet_management,
  exercise: item.question_exercise,
  effectiveMethod: item.question_effective_method,
  recommendTarget: item.question_recommend_target,
  isPrivate: item.weightPrivate, // weightPrivate로 변경
  reviewType: item.reviewType as 'GOAL' | 'BATTLE' | 'MANUAL',
  goalId: item.goalId?.toString(),
  battleId: item.battleRoomId?.toString(),
  imageUrl1: item.imageUrl1,
  imageUrl2: item.imageUrl2,
  commentCount: item.commentCount, // 댓글 개수 추가
});

const ReviewPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'myReview'>(
    'all'
  );

  // 무한 스크롤을 위한 observer ref
  const observerTarget = useRef<HTMLDivElement>(null);

  // Pull-to-refresh를 위한 ref
  const pullToRefreshRef = useRef<HTMLDivElement>(null);

  // Pull-to-refresh 상태
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const pullThreshold = 80; // 새로고침 트리거 임계값 (px)

  // URL 파라미터에서 ID 가져오기
  const { id } = useParams();

  // ID가 숫자면 goalId, 문자열(6자리)이면 battleRoomEntryCode로 판단
  const isNumeric = id && !isNaN(Number(id));
  const goalId = isNumeric ? parseInt(id) : undefined;
  const battleRoomEntryCode = !isNumeric ? id : undefined;

  const isFromGoalOrBattle = !!id;

  // 무한 스크롤 쿼리
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['reviewList', activeTab],
    queryFn: ({ pageParam = 0 }) => getReviewList(pageParam, 10, activeTab),
    getNextPageParam: (lastPage) => {
      // 마지막 페이지면 undefined 반환 (더 이상 불러올 페이지 없음)
      return lastPage.last ? undefined : lastPage.pageNumber + 1;
    },
    initialPageParam: 0,
  });

  // 모든 페이지의 리뷰를 하나의 배열로 변환
  const reviews: Review[] = data
    ? data.pages.flatMap((page) => page.content.map(convertToReview))
    : [];

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Pull-to-refresh 핸들러 (네이티브 이벤트용)
  const handleTouchStartNative = useCallback(
    (e: TouchEvent) => {
      // 최상단에서만 작동
      if (window.scrollY === 0 && !isRefetching) {
        touchStartY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    },
    [isRefetching]
  );

  const handleTouchMoveNative = useCallback(
    (e: TouchEvent) => {
      if (touchStartY.current === null || window.scrollY > 0 || isRefetching) {
        return;
      }

      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY.current;

      // 아래로 당기는 경우만 처리
      if (distance > 0) {
        e.preventDefault(); // 스크롤 방지
        // 부드러운 감쇠 효과를 위한 계산 (resistive pull)
        const maxDistance = pullThreshold * 2;
        const resistiveDistance =
          distance < pullThreshold
            ? distance
            : pullThreshold + (distance - pullThreshold) * 0.3;
        setPullDistance(Math.min(resistiveDistance, maxDistance));
      } else {
        // 위로 올리면 초기화
        touchStartY.current = null;
        setPullDistance(0);
        setIsPulling(false);
      }
    },
    [isRefetching]
  );

  const handleTouchEndNative = useCallback(() => {
    if (touchStartY.current === null) return;

    setPullDistance((currentDistance) => {
      if (currentDistance >= pullThreshold) {
        // 새로고침 실행
        // refetch 중에는 pullDistance를 유지하여 인디케이터 표시
        refetch();
        return pullThreshold;
      } else {
        // 임계값 미만이면 원래 위치로 복귀
        touchStartY.current = null;
        setIsPulling(false);
        return 0;
      }
    });
  }, [refetch]);

  // Pull-to-refresh 이벤트 리스너 등록
  useEffect(() => {
    const element = pullToRefreshRef.current;
    if (!element) return;

    // passive: false로 설정하여 preventDefault 사용 가능
    element.addEventListener('touchstart', handleTouchStartNative, {
      passive: false,
    });
    element.addEventListener('touchmove', handleTouchMoveNative, {
      passive: false,
    });
    element.addEventListener('touchend', handleTouchEndNative, {
      passive: true,
    });

    return () => {
      element.removeEventListener('touchstart', handleTouchStartNative);
      element.removeEventListener('touchmove', handleTouchMoveNative);
      element.removeEventListener('touchend', handleTouchEndNative);
    };
  }, [handleTouchStartNative, handleTouchMoveNative, handleTouchEndNative]);

  const handleOpenReviewForm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur(); // 버튼에서 포커스 제거
    setShowReviewForm(true);
  };

  const handleLikeReview = (reviewId: string) => {
    console.log('Like review:', reviewId);
  };

  // 리뷰 작성 성공 후 URL 초기화 및 모달 닫기
  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    // URL에서 ID 제거하고 /review로 이동
    navigate('/review', { replace: true });
    // 페이지 최상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // URL에 ID가 있으면 자동으로 리뷰 작성 폼 열기
  useEffect(() => {
    if (isFromGoalOrBattle && !isLoading) {
      setShowReviewForm(true);
    }
  }, [isFromGoalOrBattle, isLoading]);

  // refetch 시작 시 pullDistance 유지
  useEffect(() => {
    if (isRefetching && pullDistance < pullThreshold) {
      setPullDistance(pullThreshold);
    }
  }, [isRefetching, pullDistance]);

  // refetch 완료 시 pull 상태 초기화
  useEffect(() => {
    if (!isRefetching && (isPulling || pullDistance > 0)) {
      // 부드러운 복귀를 위해 약간의 딜레이
      const timer = setTimeout(() => {
        setIsPulling(false);
        setPullDistance(0);
        touchStartY.current = null;
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isRefetching, isPulling, pullDistance]);

  // 로딩 시에도 기본 UI는 보여주기
  // if (isLoading) {
  //   return (
  //     <div className="space-y-6">
  //       <div className="flex items-start justify-between gap-4">
  //         <Skeleton className="h-10 w-32 hidden md:block" />
  //       </div>
  //       <Card>
  //         <CardContent className="pt-6">
  //           <div className="flex flex-col md:flex-row gap-4">
  //             <Skeleton className="h-10 flex-1" />
  //             <Skeleton className="h-10 w-full md:w-[180px]" />
  //             <Skeleton className="h-10 w-full md:w-[180px]" />
  //           </div>
  //         </CardContent>
  //       </Card>
  //       <div className="space-y-4">
  //         {[1, 2, 3].map((i) => (
  //           <Card key={i}>
  //             <CardHeader>
  //               <Skeleton className="h-6 w-3/4" />
  //               <Skeleton className="h-4 w-1/2" />
  //             </CardHeader>
  //             <CardContent className="space-y-3">
  //               <Skeleton className="h-20 w-full" />
  //               <Skeleton className="h-8 w-full" />
  //             </CardContent>
  //           </Card>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // }

  // 에러 상태
  if (isError) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardContent className="pt-12 pb-12 text-center">
            <Star className="h-16 w-16 mx-auto mb-6 text-destructive" />
            <h3 className="text-xl font-medium mb-3">
              리뷰를 불러오는데 실패했습니다
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              잠시 후 다시 시도해주세요.
            </p>
            <Button onClick={() => window.location.reload()}>새로고침</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { isAuthenticated } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  if (!isAuthenticated && loginOpen) {
    return <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />;
  }

  return (
    <div className="space-y-4">
      {/* 헤더 및 리뷰 작성 버튼 */}
      <div className="space-y-4">
        {/* 데스크톱: 카드 형태의 리뷰 작성 CTA */}
        <Card className="hidden md:block bg-gradient-to-r from-primary/5 via-primary/10 to-primary/20 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    다이어트 경험을 공유해보세요!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    당신의 노하우가 다른 사람들에게 큰 도움이 됩니다
                  </p>
                </div>
              </div>
              <Button
                onClick={(e) => {
                  e.currentTarget.blur();
                  if (isAuthenticated) {
                    handleOpenReviewForm(e);
                  } else {
                    setLoginOpen(true);
                  }
                }}
                size="lg"
                className="gap-2 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <PenSquare className="h-5 w-5" />
                리뷰 작성하기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 모바일: 고정된 형태의 버튼 */}
        <Card className="md:hidden bg-gradient-to-r from-primary/20 via-primary/30 to-primary/40 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">다이어트 경험을 공유해보세요!</h3>
                <p className="text-xs text-muted-foreground">
                  다른 사람들에게 동기부여와 유용한 정보를 제공해주세요
                </p>
              </div>
            </div>
            <Button
              onClick={(e) => {
                e.currentTarget.blur();
                if (isAuthenticated) {
                  handleOpenReviewForm(e);
                } else {
                  setLoginOpen(true);
                }
              }}
              className="w-full gap-2"
              size="lg"
            >
              <PenSquare className="h-4 w-4" />
              리뷰 작성하기
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as 'all' | 'popular' | 'myReview')
        }
      >
        <TabsList className="grid w-full grid-cols-3 h-14 p-1.5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700">
          <TabsTrigger
            value="all"
            className="gap-2 h-full text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-700 transition-all"
          >
            <Star className="h-5 w-5" />
            전체
          </TabsTrigger>
          <TabsTrigger
            value="popular"
            className="gap-2 h-full text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-700 transition-all"
          >
            <TrendingUp className="h-5 w-5" />
            인기순
          </TabsTrigger>
          <TabsTrigger
            onClick={(e) => {
              if (!isAuthenticated) {
                setLoginOpen(true);
                return;
              }
              e.currentTarget.blur();
              setActiveTab('myReview');
            }}
            value="myReview"
            className="gap-2 h-full text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-700 transition-all"
          >
            <User className="h-5 w-5" />
            나의 리뷰
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-3">
          {/* Pull-to-refresh 인디케이터 공간 */}
          <div
            className="flex items-center justify-center overflow-hidden"
            style={{
              height:
                isPulling || isRefetching
                  ? `${Math.min(pullDistance || (isRefetching ? pullThreshold : 0), pullThreshold)}px`
                  : '0px',
              transition:
                isPulling || isRefetching
                  ? 'none'
                  : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {(isPulling || isRefetching) && (
              <div
                className="flex items-center gap-2"
                style={{
                  opacity: isRefetching
                    ? 1
                    : Math.min(Math.max((pullDistance || 0) / 30, 0), 1),
                  transition: isRefetching ? 'opacity 0.2s ease-in' : 'none',
                }}
              >
                {pullDistance >= pullThreshold || isRefetching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      새로고침 중...
                    </span>
                  </>
                ) : (
                  <>
                    <Loader2
                      className="h-4 w-4 text-muted-foreground transition-transform duration-75"
                      style={{
                        transform: `rotate(${((pullDistance || 0) / pullThreshold) * 360}deg)`,
                      }}
                    />
                    {/* <span className="text-sm text-muted-foreground">
                      {Math.round(((pullDistance || 0) / pullThreshold) * 100)}%
                    </span> */}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div ref={pullToRefreshRef} className="space-y-4">
            {isLoading || isRefetching ? (
              // 로딩 중 스켈레톤
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : reviews.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <Star className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
                  <h3 className="text-xl font-medium mb-3">리뷰가 없습니다</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    목표를 완료하고 첫 번째 리뷰를 작성해보세요!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onLike={handleLikeReview}
                    showComments={true}
                  />
                ))}

                {/* 무한 스크롤 트리거 */}
                <div ref={observerTarget} className="py-4">
                  {isFetchingNextPage && (
                    <div className="flex justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                  {!hasNextPage && reviews.length > 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                      모든 리뷰를 불러왔습니다
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {isMobile ? (
        <Drawer
          open={showReviewForm}
          onOpenChange={setShowReviewForm}
          modal={true}
          shouldScaleBackground={false}
        >
          <DrawerContent className="max-h-[90vh]">
            <DrawerTitle className="sr-only">리뷰 작성</DrawerTitle>
            <div className="overflow-y-auto px-4 pb-4">
              <ReviewForm
                goalId={goalId}
                battleRoomEntryCode={battleRoomEntryCode}
                startWeight={0}
                endWeight={0}
                duration={0}
                onCancel={() => setShowReviewForm(false)}
                onSuccess={handleReviewSuccess}
              />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">리뷰 작성</DialogTitle>
            <ReviewForm
              goalId={goalId}
              battleRoomEntryCode={battleRoomEntryCode}
              startWeight={0}
              endWeight={0}
              duration={0}
              onCancel={() => setShowReviewForm(false)}
              onSuccess={handleReviewSuccess}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ReviewPage;
