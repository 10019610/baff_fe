import { PenSquare, Search, Star, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useEffect, useState, useRef } from 'react';
import { Drawer, DrawerContent, DrawerTitle } from '../components/ui/drawer';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import ReviewForm from '../components/review/ReviewForm';
import { useIsMobile } from '../components/ui/use-mobile';
import { Skeleton } from '../components/ui/skeleton';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import ReviewCard from '../components/review/ReviewCard';
import type { Review, ReviewListItem } from '../types/review.type';
import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getReviewList } from '../services/api/review.api';

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
  const [searchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<
    'all' | '쉬웠어요' | '적당했어요' | '힘들었어요'
  >('all');

  // 무한 스크롤을 위한 observer ref
  const observerTarget = useRef<HTMLDivElement>(null);

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
  } = useInfiniteQuery({
    queryKey: ['reviewList'],
    queryFn: ({ pageParam = 0 }) => getReviewList(pageParam, 10),
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

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-10 w-32 hidden md:block" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-full md:w-[180px]" />
              <Skeleton className="h-10 w-full md:w-[180px]" />
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
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
        </div>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* 헤더 및 리뷰 작성 버튼 */}
      <div className="space-y-4">
        {/* 데스크톱: 카드 형태의 리뷰 작성 CTA */}
        <Card className="hidden md:block bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    다이어트 성공 경험을 공유해보세요!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    당신의 노하우가 다른 사람들에게 큰 도움이 됩니다
                  </p>
                </div>
              </div>
              <Button
                onClick={handleOpenReviewForm}
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
        <Card className="md:hidden bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">성공 경험을 공유해보세요!</h3>
                <p className="text-xs text-muted-foreground">
                  다른 사람들에게 동기부여를 주세요
                </p>
              </div>
            </div>
            <Button
              onClick={handleOpenReviewForm}
              className="w-full gap-2"
              size="lg"
            >
              <PenSquare className="h-4 w-4" />
              리뷰 작성하기
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="리뷰 검색..."
                // value={searchQuery}
                // onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
            // value={sortBy}
            // onValueChange={(value: any) => setSortBy(value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">최신순</SelectItem>
                <SelectItem value="likes">좋아요순</SelectItem>
                <SelectItem value="achievement">달성률순</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterDifficulty}
              onValueChange={(
                value: 'all' | '쉬웠어요' | '적당했어요' | '힘들었어요'
              ) => setFilterDifficulty(value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="난이도 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="쉬웠어요">쉬웠어요</SelectItem>
                <SelectItem value="적당했어요">적당했어요</SelectItem>
                <SelectItem value="힘들었어요">힘들었어요</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 && !isLoading ? (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <Star className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
              <h3 className="text-xl font-medium mb-3">리뷰가 없습니다</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery || filterDifficulty !== 'all'
                  ? '검색 조건에 맞는 리뷰가 없습니다. 필터를 변경해보세요.'
                  : '목표를 완료하고 첫 번째 리뷰를 작성해보세요!'}
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
