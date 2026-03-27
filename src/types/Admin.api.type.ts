export interface AdminStats {
  totalUsers: number;
  newUsersThisWeek: number;
  activeBattles: number;
  totalReviews: number;
  totalInquiries: number;
  pendingInquiries: number;
}

export interface UserGrowth {
  label: string;
  count: number;
}

export interface WeightTrend {
  label: string;
  count: number;
}

export interface PlatformDistribution {
  platform: string;
  count: number;
}

export interface RecentActivity {
  type: string;
  message: string;
  timestamp: string;
}

export interface AdminUserListItem {
  userId: number;
  nickname: string;
  email: string;
  profileImageUrl: string;
  role: string;
  status: string;
  provider: string;
  platform: string;
  height: number;
  regDateTime: string;
}

export interface AdminUserDetail extends AdminUserListItem {
  totalWeightRecords: number;
  totalGoals: number;
  totalBattles: number;
  totalReviews: number;
  pieceBalance: number;
}

export interface AdminInquiryListItem {
  inquiryId: number;
  userId: number;
  nickname: string;
  title: string;
  content: string;
  inquiryType: string;
  inquiryStatus: string;
  regDateTime: string;
  replyCount: number;
}

export interface AdminInquiryDetail {
  inquiryId: number;
  userId: number;
  nickname: string;
  email: string;
  title: string;
  content: string;
  inquiryType: string;
  inquiryStatus: string;
  regDateTime: string;
  replies: InquiryReplyItem[];
}

export interface InquiryReplyItem {
  replyId: number;
  content: string;
  adminId: number;
  adminNickname: string;
  regDateTime: string;
}

export interface AdminBattleListItem {
  battleId: number;
  entryCode: string;
  name: string;
  hostNickname: string;
  participantCount: number;
  maxParticipants: number;
  status: string;
  durationDays: number;
  betAmount: number;
  startDate: string;
  endDate: string;
  regDateTime: string;
}

export interface AdminReviewListItem {
  reviewId: number;
  title: string;
  authorNickname: string;
  difficulty: string;
  dietMethods: string;
  isPublic: boolean;
  likes: number;
  commentCount: number;
  regDateTime: string;
}

export interface NoticeItem {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  regDateTime: string;
  modDateTime: string;
}

export interface AdminRewardSummary {
  totalIssuedPieces: number;
  totalBurnedPieces: number;
  currentCirculating: number;
  totalExchangeAmount: number;
  todayIssuedPieces: number;
  todayBurnedPieces: number;
  activeRewardUsers: number;
  pendingExchanges: number;
}

export interface AdminRewardConfig {
  configId: number;
  rewardType: string;
  actionType: string;
  pieceAmount: number;
  description: string;
  isActive: boolean;
  regDateTime: string;
  modDateTime: string;
}

export interface AdminRewardExchange {
  exchangeId: number;
  userId: number;
  nickname: string;
  pieceAmount: number;
  exchangeAmount: number;
  status: string;
  regDateTime: string;
}

export interface LoginHistoryItem {
  id: number;
  userId: number;
  nickname: string;
  userAgent: string;
  loginDateTime: string;
}

export interface WeightHistoryItem {
  id: number;
  userId: number;
  nickname: string;
  weight: number;
  recordDate: string;
  regDateTime: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AdWatchSummary {
  totalWatchCount: number;
  todayWatchCount: number;
  uniqueUsers: number;
  todayUniqueUsers: number;
  locationStats: AdWatchLocationStat[];
}

export interface AdWatchLocationStat {
  location: string;
  count: number;
}

export interface AdWatchHistoryItem {
  id: number;
  userId: number;
  nickname: string;
  watchLocation: string;
  referenceId: number;
  tossAdResponse: string;
  regDateTime: string;
}

export interface TossAdPositionConfig {
  id: number;
  position: string;
  tossAdRatio: number;
  tossAdGroupId: string | null;
  isTossAdEnabled: boolean;
  tossImageAdGroupId: string | null;
  tossImageAdRatio: number;
  isTossImageAdEnabled: boolean;
  tossBannerAdGroupId: string | null;
  tossBannerAdRatio: number;
  isTossBannerAdEnabled: boolean;
  tossInterstitialAdGroupId: string | null;
  isTossInterstitialAdEnabled: boolean;
  rewardedAdRatio: number;
  rewardedAdGrams: number;
  interstitialAdGrams: number;
  regDateTime: string;
  modDateTime: string;
}

export interface UpdateTossAdConfigRequest {
  tossAdRatio?: number;
  tossAdGroupId?: string | null;
  isTossAdEnabled?: boolean;
  tossImageAdGroupId?: string | null;
  tossImageAdRatio?: number;
  isTossImageAdEnabled?: boolean;
  tossBannerAdGroupId?: string | null;
  tossBannerAdRatio?: number;
  isTossBannerAdEnabled?: boolean;
  tossInterstitialAdGroupId?: string | null;
  isTossInterstitialAdEnabled?: boolean;
  rewardedAdRatio?: number;
  rewardedAdGrams?: number;
  interstitialAdGrams?: number;
}
