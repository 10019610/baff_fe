import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Heart,
  MessageCircle,
  Calendar,
  TrendingDown,
  TrendingUp,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  Users,
  RotateCcw,
  Target,
  Smile,
  Meh,
  Frown,
  Swords,
  Flag,
  PenLine,
  Trash2,
  MoreVertical,
  ZoomIn,
  ChevronsDown,
  EyeOff,
  Minus,
  Pencil,
} from 'lucide-react';
import { DIET_METHODS } from '../../types/review.type';
import type { BattleDataForReview, Review } from '../../types/review.type';
import toast from 'react-hot-toast';
import CommentSection from './CommentSection.tsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  toggleReviewLike,
  deleteReview,
  getBattleDataForReview,
  getGoalDataForReview,
} from '../../services/api/review.api';
import { useAuth } from '../../context/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Drawer, DrawerContent, DrawerTitle } from '../ui/drawer';
import LoginModal from '../auth/LoginModal.tsx';
import type { GoalDetailForReview } from '../../types/Goals.type';
import ReviewForm from './ReviewForm.tsx';
import { useIsMobile } from '../ui/use-mobile';
import { formatTimeAgo } from '../../util/DateUtil';

interface ReviewCardProps {
  review: Review;
  onLike?: (reviewId: string) => void;
  showComments?: boolean;
  onDelete?: (reviewId: string) => void;
}

const ReviewCard = ({
  review,
  onLike,
  showComments = true,
  onDelete,
}: ReviewCardProps) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [localLikes, setLocalLikes] = useState(review.likes);
  const [hasLiked, setHasLiked] = useState(review.liked); // 백엔드에서 받은 liked 상태로 초기화
  const [commentCount, setCommentCount] = useState(review.commentCount || 0);
  const [imageError1, setImageError1] = useState(false);
  const [imageError2, setImageError2] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [battleDataFetched, setBattleDataFetched] = useState(false);
  const [goalDataFetched, setGoalDataFetched] = useState(false);
  const [goalDataForReview, setGoalDataForReview] =
    useState<GoalDetailForReview | null>(null);
  const [battleDataForReview, setBattleDataForReview] =
    useState<BattleDataForReview | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  // 좋아요 토글 mutation
  const toggleLikeMutation = useMutation({
    mutationFn: () => toggleReviewLike(review.id),
    onSuccess: () => {
      // API 성공 시 부모 컴포넌트 콜백 실행 (필요한 경우)
      if (onLike) {
        onLike(review.id);
      }
    },
    onError: (error: unknown) => {
      // 실패 시 이전 상태로 롤백
      setLocalLikes(review.likes);
      setHasLiked(review.liked);

      console.error('좋아요 토글 실패:', error);
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
          ? String(error.response.data.message)
          : '좋아요 처리에 실패했습니다';
      toast.error(errorMessage);
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    // 낙관적 업데이트: 즉시 UI 반영
    if (hasLiked) {
      setLocalLikes(localLikes - 1);
      setHasLiked(false);
    } else {
      setLocalLikes(localLikes + 1);
      setHasLiked(true);
    }

    // API 호출
    toggleLikeMutation.mutate();
  };

  // 리뷰 삭제 mutation
  const deleteReviewMutation = useMutation({
    mutationFn: () => deleteReview(review.id),
    onSuccess: () => {
      toast.success('리뷰가 삭제되었습니다');
      queryClient.invalidateQueries({ queryKey: ['reviewList'] });
      setIsDeleteDialogOpen(false);
      if (onDelete) {
        onDelete(review.id);
      }
    },
    onError: (error: unknown) => {
      console.error('리뷰 삭제 실패:', error);
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
          ? String(error.response.data.message)
          : '리뷰 삭제에 실패했습니다';
      toast.error(errorMessage);
    },
  });

  const getBattleDataForReviewMutation = useMutation({
    mutationFn: () => {
      if (!review.battleRoomEntryCode) {
        throw new Error('battleRoomEntryCode가 없습니다.');
      }
      return getBattleDataForReview(
        review.battleRoomEntryCode,
        Number(review.userId)
      );
    },
    onSuccess: (data) => {
      console.log('배틀 데이터 조회 성공:', data);
      setBattleDataFetched(true);
      setBattleDataForReview(data);
    },
    onError: (error) => {
      console.error('배틀 데이터 조회 실패:', error);
    },
  });

  const getGoalDataForReviewMutation = useMutation({
    mutationFn: () => {
      return getGoalDataForReview(Number(review.goalId), Number(review.userId));
    },
    onSuccess: (data) => {
      console.log('목표 데이터 조회 성공:', data);
      setGoalDataFetched(true);
      setGoalDataForReview(data);
    },
    onError: (error) => {
      console.error('목표 데이터 조회 실패:', error);
    },
  });

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteReviewMutation.mutate();
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  // 현재 사용자가 작성한 리뷰인지 확인
  const isMyReview =
    user &&
    (user.userId === Number(review.userId) ||
      Number(user.id) === Number(review.userId));

  const weightChange = review.startWeight - review.endWeight;
  const isWeightLoss = weightChange > 0;

  const selectedMethodsLabels = review.dietMethods.map((method) => {
    const found = DIET_METHODS.find((m) => m.value === method);
    return found?.label || method;
  });

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <img
                src={review.userProfileImage}
                alt={review.userName}
                className="h-10 w-10 rounded-full"
              />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="font-medium truncate max-w-[200px] md:max-w-none">
              {review.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
              <span>{review.userName}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatTimeAgo(review.createdAt)}
              </span>

              {/* 리뷰 타입 뱃지 */}
              {review.reviewType === 'GOAL' && (
                <Badge
                  variant="default"
                  className="gap-1 h-5 text-xs bg-blue-500 hover:bg-blue-600"
                >
                  <Flag className="h-2.5 w-2.5" />
                  목표 후기
                </Badge>
              )}
              {review.reviewType === 'BATTLE' && (
                <Badge
                  variant="default"
                  className="gap-1 h-5 text-xs bg-purple-500 hover:bg-purple-600"
                >
                  <Swords className="h-2.5 w-2.5" />
                  대결 후기
                </Badge>
              )}
              {review.reviewType === 'MANUAL' && (
                <Badge
                  variant="default"
                  className="gap-1 h-5 text-xs bg-green-500 hover:bg-green-600"
                >
                  <PenLine className="h-2.5 w-2.5" />
                  자유 후기
                </Badge>
              )}
            </div>
          </div>

          {/* 내가 작성한 리뷰면 삭제 버튼 표시 */}
          {isMyReview && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setIsEditMode(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  수정하기
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제하기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 성과 요약 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs">기간</span>
            </div>
            <p className="font-medium">{review.duration}일</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              {isWeightLoss ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              <span className="text-xs">변화량</span>
            </div>
            <p className="font-medium">
              {isWeightLoss ? '-' : '+'}
              {Math.abs(weightChange).toFixed(1)}kg
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Award className="h-3 w-3" />
              <span className="text-xs">난이도</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              {review.difficulty === '쉬웠어요' && (
                <>
                  <Smile className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium">쉬움</span>
                </>
              )}
              {review.difficulty === '적당했어요' && (
                <>
                  <Meh className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium">적당</span>
                </>
              )}
              {review.difficulty === '힘들었어요' && (
                <>
                  <Frown className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium">어려움</span>
                </>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <TrendingDown className="h-3 w-3" />
              <span className="text-xs">체중</span>
            </div>
            {review.isPrivate ? (
              <p className="font-medium flex items-center justify-center gap-1 text-muted-foreground">
                <EyeOff className="h-3 w-3" />
                <span className="text-xs">비공개</span>
              </p>
            ) : (
              <p className="font-medium text-sm">
                {review.startWeight}→{review.endWeight}kg
              </p>
            )}
          </div>
        </div>

        {/* 사용한 방법들 */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            사용한 다이어트 방법
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedMethodsLabels.map((method, index) => (
              <Badge key={index} variant="outline" className="bg-primary/5">
                {method}
              </Badge>
            ))}
          </div>
        </div>

        {/* 더보기 버튼 */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => {
              const newExpanded = !isExpanded;
              setIsExpanded(newExpanded);
              // 더보기 버튼을 눌렀을 때 (확장될 때) 배틀 데이터 API 호출
              if (
                newExpanded &&
                review.public &&
                review.reviewType === 'BATTLE' &&
                review.battleRoomEntryCode &&
                !battleDataFetched &&
                !getBattleDataForReviewMutation.isPending
              ) {
                getBattleDataForReviewMutation.mutate();
              } else if (newExpanded && review.reviewType === 'BATTLE') {
                console.log('배틀 데이터 API 호출 조건 불만족:', {
                  reviewType: review.reviewType,
                  battleRoomEntryCode: review.battleRoomEntryCode,
                  battleDataFetched,
                  isPending: getBattleDataForReviewMutation.isPending,
                  public: review.public,
                });
              }
              if (
                newExpanded &&
                review.public &&
                review.reviewType === 'GOAL' &&
                !getGoalDataForReviewMutation.isPending
              ) {
                getGoalDataForReviewMutation.mutate();
              } else if (newExpanded && review.reviewType === 'GOAL') {
                console.log('목표 데이터 API 호출 조건 불만족:', {
                  reviewType: review.reviewType,
                  goalId: review.goalId,
                  goalDataFetched,
                  isPending: getGoalDataForReviewMutation.isPending,
                  public: review.public,
                });
              }
            }}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                접기
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                더보기
              </>
            )}
          </Button>
        </div>

        {/* 확장된 내용 - Q&A, 사진, 내용 */}
        {isExpanded && (
          <div className="space-y-4">
            {/* 목표/배틀 상세 정보 */}
            {/* 목표 결과 */}
            {goalDataForReview &&
              review.reviewType === 'GOAL' &&
              review.public && (
                <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Flag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300">
                      목표 종료 결과
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-2">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2.5 sm:p-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-600" />
                        <span className="text-xs text-muted-foreground">
                          기간
                        </span>
                      </div>
                      <p className="font-medium text-sm sm:text-base">
                        {goalDataForReview.durationDays}일
                      </p>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2.5 sm:p-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <TrendingDown className="h-3.5 w-3.5 text-blue-600" />
                        <span className="text-xs text-muted-foreground">
                          변화량
                        </span>
                      </div>
                      <p className="font-medium text-sm sm:text-base">
                        {goalDataForReview.currentWeight !== null
                          ? (
                              goalDataForReview.startWeight -
                              goalDataForReview.currentWeight
                            ).toFixed(1)
                          : (
                              goalDataForReview.startWeight -
                              goalDataForReview.targetWeight
                            ).toFixed(1)}
                        kg
                      </p>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2.5 sm:p-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <TrendingDown className="h-3.5 w-3.5 text-gray-600" />
                        <span className="text-xs text-muted-foreground">
                          시작 체중
                        </span>
                      </div>
                      <p className="font-medium text-sm sm:text-base">
                        {goalDataForReview.startWeight.toFixed(1)}kg
                      </p>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2.5 sm:p-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-xs text-muted-foreground">
                          목표 체중
                        </span>
                      </div>
                      <p className="font-medium text-green-600 text-sm sm:text-base">
                        {goalDataForReview.targetWeight.toFixed(1)}kg
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* 배틀 결과 */}
            {battleDataForReview &&
              review.reviewType === 'BATTLE' &&
              review.public &&
              (battleDataForReview.hostGoalType === 'WEIGHT_LOSS' ||
                battleDataForReview.hostGoalType === 'WEIGHT_GAIN' ||
                battleDataForReview.hostGoalType === 'MAINTAIN') && (
                <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Swords className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                      대결 종료 결과
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-2">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2.5 sm:p-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-600" />
                        <span className="text-xs text-muted-foreground">
                          기간
                        </span>
                      </div>
                      <p className="font-medium text-sm sm:text-base">
                        {battleDataForReview.durationDays}일
                      </p>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2.5 sm:p-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        {battleDataForReview.hostGoalType === 'WEIGHT_LOSS' ? (
                          <TrendingDown className="h-3.5 w-3.5 text-blue-600" />
                        ) : battleDataForReview.hostGoalType ===
                          'WEIGHT_GAIN' ? (
                          <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <Minus className="h-3.5 w-3.5 text-blue-600" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {battleDataForReview.hostGoalType === 'WEIGHT_LOSS'
                            ? '나의 감량'
                            : battleDataForReview.hostGoalType === 'WEIGHT_GAIN'
                              ? '나의 증량'
                              : '나의 변화'}
                        </span>
                      </div>
                      <p className="font-medium text-sm sm:text-base">
                        {battleDataForReview.hostWeightChange.toFixed(1)}kg
                      </p>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2.5 sm:p-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-xs text-muted-foreground">
                          {battleDataForReview.hostGoalType === 'WEIGHT_LOSS'
                            ? '목표 감량'
                            : battleDataForReview.hostGoalType === 'WEIGHT_GAIN'
                              ? '목표 증량'
                              : '목표 유지'}
                        </span>
                      </div>
                      <p className="font-medium text-green-600 text-sm sm:text-base">
                        {battleDataForReview.hostTargetWeight.toFixed(1)}kg
                      </p>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2.5 sm:p-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-orange-600" />
                        <span className="text-xs text-muted-foreground">
                          {battleDataForReview.hostGoalType === 'WEIGHT_LOSS'
                            ? '상대 감량'
                            : battleDataForReview.hostGoalType === 'WEIGHT_GAIN'
                              ? '상대 증량'
                              : '상대 변화'}
                        </span>
                      </div>
                      <p className="font-medium text-orange-600 text-sm sm:text-base">
                        {battleDataForReview.opponentWeightChange.toFixed(1)}
                        kg
                      </p>
                    </div>
                  </div>
                </div>
              )}
            {/* 다이어트 상세 경험 Q&A */}
            {(review.hardestPeriod ||
              review.dietManagement ||
              review.exercise ||
              review.effectiveMethod ||
              review.recommendTarget) && (
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-muted">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-semibold">실전 경험 Q&A</h4>
                </div>

                <div className="space-y-3">
                  {review.hardestPeriod && (
                    <div className="bg-background/80 rounded-lg p-3 space-y-1.5">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-medium text-muted-foreground">
                          Q. 가장 힘들었던 시기는 언제였나요?
                        </p>
                      </div>
                      <p className="text-sm pl-5">{review.hardestPeriod}</p>
                    </div>
                  )}

                  {review.dietManagement && (
                    <div className="bg-background/80 rounded-lg p-3 space-y-1.5">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-medium text-muted-foreground">
                          Q. 식단 관리는 어떻게 하셨나요?
                        </p>
                      </div>
                      <p className="text-sm pl-5 whitespace-pre-wrap">
                        {review.dietManagement}
                      </p>
                    </div>
                  )}

                  {review.exercise && (
                    <div className="bg-background/80 rounded-lg p-3 space-y-1.5">
                      <div className="flex items-start gap-2">
                        <Users className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-medium text-muted-foreground">
                          Q. 운동은 어떤 것을 하셨나요?
                        </p>
                      </div>
                      <p className="text-sm pl-5">{review.exercise}</p>
                    </div>
                  )}

                  {review.effectiveMethod && (
                    <div className="bg-background/80 rounded-lg p-3 space-y-1.5">
                      <div className="flex items-start gap-2">
                        <RotateCcw className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-medium text-muted-foreground">
                          Q. 가장 효과적이었던 방법은?
                        </p>
                      </div>
                      <p className="text-sm pl-5">{review.effectiveMethod}</p>
                    </div>
                  )}

                  {review.recommendTarget && (
                    <div className="bg-background/80 rounded-lg p-3 space-y-1.5">
                      <div className="flex items-start gap-2">
                        <Target className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-medium text-muted-foreground">
                          Q. 이 방법을 누구에게 추천하시나요?
                        </p>
                      </div>
                      <p className="text-sm pl-5 whitespace-pre-wrap">
                        {review.recommendTarget}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 인증 사진 */}
            {(review.imageUrl1 || review.imageUrl2) && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  인증 사진
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {review.imageUrl1 && !imageError1 && (
                    <div
                      className="space-y-1 relative group cursor-pointer"
                      onClick={() => {
                        console.log('Image 1 clicked:', review.imageUrl1);
                        setSelectedImage(review.imageUrl1!);
                      }}
                    >
                      <img
                        src={review.imageUrl1}
                        alt="리뷰 이미지 1"
                        className="w-full aspect-square object-cover rounded-lg"
                        onError={() => {
                          console.error('이미지 로딩 실패:', review.imageUrl1);
                          setImageError1(true);
                          toast.error('이미지를 불러올 수 없습니다');
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                        <ZoomIn className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}
                  {review.imageUrl1 && imageError1 && (
                    <div className="space-y-1 flex items-center justify-center aspect-square bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        이미지를 불러올 수 없습니다
                      </p>
                    </div>
                  )}
                  {review.imageUrl2 && !imageError2 && (
                    <div
                      className="space-y-1 relative group cursor-pointer"
                      onClick={() => {
                        console.log('Image 2 clicked:', review.imageUrl2);
                        setSelectedImage(review.imageUrl2!);
                      }}
                    >
                      <img
                        src={review.imageUrl2}
                        alt="리뷰 이미지 2"
                        className="w-full aspect-square object-cover rounded-lg"
                        onError={() => {
                          console.error('이미지 로딩 실패:', review.imageUrl2);
                          setImageError2(true);
                          toast.error('이미지를 불러올 수 없습니다');
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                        <ZoomIn className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}
                  {review.imageUrl2 && imageError2 && (
                    <div className="space-y-1 flex items-center justify-center aspect-square bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        이미지를 불러올 수 없습니다
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 리뷰 내용 */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                상세 내용
              </p>
              <p className="text-sm whitespace-pre-wrap">{review.content}</p>
            </div>
          </div>
        )}

        {/* 좋아요 & 댓글 버튼 */}
        <div className="flex items-center gap-3 pt-2 border-t">
          <Button
            variant="ghost"
            onClick={handleLike}
            className="gap-2 h-auto p-2"
            disabled={toggleLikeMutation.isPending}
          >
            <Heart
              className={`h-6 w-6 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`}
            />
            <span className="text-base font-medium min-w-[20px]">
              {localLikes > 0 ? localLikes : '0'}
            </span>
          </Button>
          {showComments && (
            <Button
              variant="ghost"
              onClick={() => setShowCommentSection(!showCommentSection)}
              className="gap-2 h-auto p-2"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="text-base font-medium min-w-[20px]">
                {commentCount > 0 ? commentCount : '0'}
              </span>
            </Button>
          )}
        </div>

        {/* 댓글 섹션 */}
        {showComments && showCommentSection && (
          <div className="pt-4 border-t">
            <CommentSection
              reviewId={review.id}
              onCommentCountChange={setCommentCount}
              onClose={() => setShowCommentSection(false)}
            />
          </div>
        )}
      </CardContent>

      {/* 리뷰 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="text-left">
                <AlertDialogTitle className="text-left">
                  리뷰를 삭제하시겠습니까?
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-1 text-left">
                  삭제된 리뷰는 복구할 수 없습니다.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={handleDeleteCancel}
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              disabled={deleteReviewMutation.isPending}
            >
              {deleteReviewMutation.isPending ? '삭제 중...' : '삭제하기'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 이미지 뷰어 다이얼로그 */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-[100vw] w-full max-h-[100vh] h-full p-0 border-0 bg-transparent backdrop-blur-md [&>button]:hidden">
          <div className="relative w-full h-full">
            {selectedImage && (
              <>
                <div
                  ref={imageContainerRef}
                  className="w-full h-[calc(100vh-100px)] p-4 pb-2 overflow-y-auto"
                  onClick={(e) => {
                    // 배경 클릭 시 닫기
                    if (e.target === e.currentTarget) {
                      setSelectedImage(null);
                    }
                  }}
                  onScroll={(e) => {
                    const target = e.currentTarget;
                    // 스크롤이 끝에 도달하면 인디케이터 숨김
                    const isAtBottom =
                      target.scrollHeight - target.scrollTop <=
                      target.clientHeight + 10;
                    setShowScrollIndicator(
                      !isAtBottom && target.scrollHeight > target.clientHeight
                    );
                  }}
                >
                  <img
                    src={selectedImage}
                    alt="확대된 이미지"
                    className="w-full h-auto object-contain rounded-lg shadow-2xl mx-auto"
                    onLoad={() => {
                      // 이미지 로드 후 스크롤 가능한지 체크
                      if (imageContainerRef.current) {
                        const hasScroll =
                          imageContainerRef.current.scrollHeight >
                          imageContainerRef.current.clientHeight;
                        setShowScrollIndicator(hasScroll);
                      }
                    }}
                  />
                </div>

                {/* 스크롤 인디케이터 */}
                {showScrollIndicator && (
                  <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 pointer-events-none animate-bounce">
                    <div className="bg-white/90 rounded-full p-2 shadow-lg">
                      <ChevronsDown className="h-6 w-6 text-black" />
                    </div>
                  </div>
                )}

                {/* 닫기 버튼 - 하단 고정 */}
                <div className="absolute bottom-0 left-0 right-0 w-full p-4 pt-2 bg-gradient-to-t from-black/40 to-transparent">
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="w-full max-w-2xl mx-auto py-4 bg-white text-black text-lg font-semibold rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-lg block"
                  >
                    닫기
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 로그인 모달 */}
      {loginModalOpen && (
        <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      )}

      {/* 리뷰 수정 폼 */}
      {isMobile ? (
        <Drawer
          open={isEditMode}
          onOpenChange={setIsEditMode}
          modal={true}
          shouldScaleBackground={false}
        >
          <DrawerContent className="max-h-[90vh]">
            <DrawerTitle className="sr-only">리뷰 수정</DrawerTitle>
            <div className="overflow-y-auto px-4 pb-4">
              <ReviewForm
                reviewId={review.id}
                initialData={review}
                goalId={review.goalId ? Number(review.goalId) : undefined}
                battleRoomEntryCode={review.battleRoomEntryCode}
                onCancel={() => setIsEditMode(false)}
                onSuccess={() => {
                  setIsEditMode(false);
                  queryClient.invalidateQueries({ queryKey: ['reviewList'] });
                }}
              />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">리뷰 수정</DialogTitle>
            <ReviewForm
              reviewId={review.id}
              initialData={review}
              goalId={review.goalId ? Number(review.goalId) : undefined}
              battleRoomEntryCode={review.battleRoomEntryCode}
              onCancel={() => setIsEditMode(false)}
              onSuccess={() => {
                setIsEditMode(false);
                queryClient.invalidateQueries({ queryKey: ['reviewList'] });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default ReviewCard;
