// Review system types
export interface Review {
  id: string;
  goalId?: string;
  battleId?: string;
  userId: string;
  userName: string;
  userProfileImage: string;
  title: string;
  content: string;
  dietMethods: string[]; // 선택한 다이어트 방법들
  difficulty: string; // '쉬웠어요', '적당했어요', '힘들었어요'
  startWeight: number;
  endWeight: number;
  duration: number; // 일수
  imageUrl1?: string; // 이미지 1
  imageUrl2?: string; // 이미지 2
  createdAt: string;
  likes: number;
  liked: boolean; // 현재 사용자가 좋아요를 눌렀는지 여부
  isPrivate?: boolean; // 비공개 모드 (체중 숨김)
  // 추가 다이어트 관련 문항
  hardestPeriod?: string; // 가장 힘들었던 시기는 언제였나요?
  dietManagement?: string; // 식단 관리는 어떻게 하셨나요?
  exercise?: string; // 운동은 어떤 것을 하셨나요?
  effectiveMethod?: string; // 가장 효과적이었던 방법은?
  recommendTarget?: string; // 이 방법을 누구에게 추천하시나요?
  reviewType: 'GOAL' | 'BATTLE' | 'MANUAL';
  commentCount?: number; // 댓글 개수
  battleRoomEntryCode?: string; // 배틀룸 입장 코드
  public?: boolean; // 목표/배틀 관련 데이터를 리뷰 게시글에 공개할지 여부
}

export interface Comment {
  id: string;
  reviewId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

// 백엔드 getReviewCommentList DTO와 매칭
export interface ReviewComment {
  commentId: number;
  userId: number;
  profileImageUrl?: string;
  userNickName: string;
  content: string;
  regDateTime: string; // LocalDateTime은 ISO 8601 형식 문자열로 전송됨
}

// 다이어트 방법 선택지
export const DIET_METHODS = [
  { value: 'calorie-deficit', label: '칼로리 제한' },
  { value: 'intermittent-fasting', label: '간헐적 단식' },
  { value: 'low-carb', label: '저탄수화물' },
  { value: 'keto', label: '키토제닉' },
  { value: 'exercise', label: '운동 (유산소)' },
  { value: 'strength-training', label: '운동 (근력)' },
  { value: 'meal-prep', label: '식단 준비' },
  { value: 'portion-control', label: '식사량 조절' },
  { value: 'no-snacking', label: '간식 끊기' },
  { value: 'water-intake', label: '물 많이 마시기' },
  { value: 'sleep', label: '충분한 수면' },
  { value: 'stress-management', label: '스트레스 관리' },
  { value: 'other', label: '기타 (직접 입력)' },
];

// 난이도 레이블
export const DIFFICULTY_LABELS = {
  easy: '쉬웠어요',
  moderate: '적당했어요',
  hard: '힘들었어요',
};

// 리뷰 작성 요청 DTO
export interface CreateReviewRequest {
  title: string;
  dietMethods: string; // 쉼표로 구분된 문자열
  difficulty: string; // '쉬웠어요', '적당했어요', '힘들었어요'
  startWeight: number;
  targetWeight: number;
  period: number;
  question_hardest_period: string; // 가장 힘들었던 시기는 언제였나요?
  question_diet_management: string; // 식단 관리는 어떻게 하셨나요?
  question_exercise: string; // 운동은 어떤 것을 하셨나요?
  question_effective_method: string; // 가장 효과적이었던 방법은?
  question_recommend_target: string; // 이 방법을 누구에게 추천하시나요?
  content: string;
  imageUrl1?: string;
  imageUrl2?: string;
  isWeightPrivate: boolean;
  reviewType: 'GOAL' | 'BATTLE' | 'MANUAL'; // 리뷰 타입
  goalId?: number; // 목표 ID (reviewType이 GOAL일 때)
  battleRoomEntryCode?: string; // 배틀룸 입장 코드 (reviewType이 BATTLE일 때, 6자리 문자열)
  isPublic?: boolean; // 목표/배틀 관련 데이터를 리뷰 게시글에 공개할지 여부
}

// 리뷰 리스트 응답 DTO (백엔드 getReviewList와 매칭)
export interface ReviewListItem {
  reviewId: number; // 리뷰 고유 ID
  title: string;
  dietMethods: string; // 쉼표로 구분된 문자열
  difficulty: string;
  startWeight: number;
  targetWeight: number;
  period: number;
  question_hardest_period: string;
  question_diet_management: string;
  question_exercise: string;
  question_effective_method: string;
  question_recommend_target: string;
  content: string;
  imageUrl1?: string;
  imageUrl2?: string;
  weightPrivate: boolean; // 백엔드에서 weightPrivate로 반환
  regDateTime: string; // LocalDateTime은 ISO 8601 형식 문자열로 전송됨
  userId: number;
  userNickName: string; // 사용자 닉네임 추가
  userProfileImage: string; // 사용자 프로필 이미지 추가
  reviewType: string;
  battleRoomId?: number;
  battleRoomEntryCode?: string; // 배틀룸 입장 코드
  goalId?: number;
  likes: number;
  liked: boolean;
  commentCount?: number; // 댓글 개수 (백엔드에서 추가 필요)
  public?: boolean; // 목표/배틀 관련 데이터를 리뷰 게시글에 공개할지 여부
}

// 페이지네이션 응답
export interface ReviewListResponse {
  content: ReviewListItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface BattleDataForReview {
  hostWeightChange: number;
  opponentWeightChange: number;
  durationDays: number;
  hostTargetWeight: number;
  hostGoalType: string;
}
