import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Plus,
  Sparkles,
  Search,
  X,
} from 'lucide-react';
import { Bug } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { AnimatePresence, motion } from 'motion/react';
import { Badge } from '../components/ui/badge';
import { formatDate } from '../utils/DateUtil';
import { Input } from '../components/ui/input';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api/Api';
import type {
  GetInquiryListRequest,
  GetInquiryListResponse,
  InquiryType,
  InquiryStatus,
} from '../types/Inquiry.api.type';
interface CategoryInfo {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

// InquiryResponseDto를 직접 사용

const categories: CategoryInfo[] = [
  {
    id: 'IMPROVEMENT',
    label: '개선',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  {
    id: 'QUESTION',
    label: '문의',
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'BUG',
    label: '오류 제보',
    icon: <Bug className="h-4 w-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
  },
];

interface StatusInfo {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}
const statuses: StatusInfo[] = [
  {
    id: 'RECEIVED',
    label: '접수됨',
    icon: <Clock className="h-3 w-3" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
  },
  {
    id: 'IN_PROGRESS',
    label: '처리 중',
    icon: <FileText className="h-3 w-3" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    id: 'ANSWERED',
    label: '답변 완료',
    icon: <CheckCircle2 className="h-3 w-3" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
  },
  {
    id: 'CLOSED',
    label: '종결',
    icon: <X className="h-3 w-3" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950/30',
  },
];

const InquiryPage = () => {
  const navigate = useNavigate();

  // 페이지 로드 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /**
   * states
   */
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 문의 목록 조회 API
  const { data: inquiryList = [] } = useQuery<GetInquiryListResponse>({
    queryKey: ['inquiryList', categoryFilter, statusFilter],
    queryFn: async () => {
      try {
        const params: GetInquiryListRequest = {
          inquiryType:
            categoryFilter === 'all' ? 'ALL' : (categoryFilter as InquiryType),
          inquiryStatus:
            statusFilter === 'all' ? 'ALL' : (statusFilter as InquiryStatus),
        };

        const response = await api.get('/inquiry/getInquiryList', { params });
        return response.data;
      } catch (error) {
        console.warn('getInquiryList API not available:', error);
        return [];
      }
    },
  });

  // 검색어로 필터링된 목록
  const filteredInquiryList = inquiryList.filter(
    (inquiry) =>
      searchQuery === '' ||
      inquiry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 카테고리별 카운트 계산
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return inquiryList.length;
    return inquiryList.filter((inquiry) => inquiry.inquiryType === categoryId)
      .length;
  };

  // 상태별 카운트 계산
  const getStatusCount = (statusId: string) => {
    if (statusId === 'all') return inquiryList.length;
    return inquiryList.filter((inquiry) => inquiry.inquiryStatus === statusId)
      .length;
  };

  const hasActiveFilters =
    categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery !== '';

  return (
    <div className="bg-background min-h-screen pb-20 md:pb-6">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="mb-0 text-lg sm:text-xl">내 문의 내역</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  문의사항을 편하게 남겨주세요
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/inquiry/create')}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl shadow-primary/25 hover:shadow-primary/30 h-10 sm:h-12 px-4 sm:px-6 flex-shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 border-0 font-medium cursor-pointer"
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="p-1 bg-white/20 rounded-full">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <span className="hidden sm:inline">새 문의 작성</span>
                <span className="sm:hidden text-xs font-medium">문의</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="border-2 hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2">
                전체 문의
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl">{inquiryList.length}</span>
                <span className="text-muted-foreground">건</span>
              </div>
            </CardContent>
          </Card>
          {statuses.map((status, index) => (
            <motion.div
              key={status.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-2 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`${status.color}`}>{status.icon}</div>
                    <div className="text-sm text-muted-foreground">
                      {status.label}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl">
                      {getStatusCount(status.id)}
                    </span>
                    <span className="text-muted-foreground">건</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div> */}
        {/* Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="문의 제목이나 내용 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-10 border-2"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Category & Status Filters */}
          <Card className="border-2">
            <CardContent className="p-4 space-y-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">
                    카테고리
                  </label>
                  {categoryFilter !== 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCategoryFilter('all')}
                      className="h-6 px-2 text-xs cursor-pointer"
                    >
                      <X className="h-3 w-3 mr-1" />
                      초기화
                    </Button>
                  )}
                </div>
                {/* 카테고리 필터: 전체 + 3개 카테고리를 2열로 배치 */}
                <div className="space-y-2">
                  {/* 첫 번째 줄: 전체 + 개선 */}
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCategoryFilter('all')}
                      className={`p-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                        categoryFilter === 'all'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card hover:border-primary/30'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs">전체</span>
                        <span className="text-[10px] text-muted-foreground">
                          {getCategoryCount('all')}
                        </span>
                      </div>
                    </motion.button>

                    {categories[0] && (
                      <motion.button
                        key={categories[0].id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCategoryFilter(categories[0].id)}
                        className={`p-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                          categoryFilter === categories[0].id
                            ? `${categories[0].borderColor} ${categories[0].bgColor} ${categories[0].color}`
                            : 'border-border bg-card hover:border-primary/30'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          {categories[0].icon}
                          <span className="text-xs leading-tight text-center">
                            {categories[0].label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {getCategoryCount(categories[0].id)}
                          </span>
                        </div>
                      </motion.button>
                    )}
                  </div>

                  {/* 두 번째 줄: 문의 + 오류 제보 */}
                  <div className="grid grid-cols-2 gap-2">
                    {categories.slice(1).map((category) => (
                      <motion.button
                        key={category.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCategoryFilter(category.id)}
                        className={`p-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                          categoryFilter === category.id
                            ? `${category.borderColor} ${category.bgColor} ${category.color}`
                            : 'border-border bg-card hover:border-primary/30'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          {category.icon}
                          <span className="text-xs leading-tight text-center">
                            {category.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {getCategoryCount(category.id)}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">상태</label>
                  {statusFilter !== 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStatusFilter('all')}
                      className="h-6 px-2 text-xs cursor-pointer"
                    >
                      <X className="h-3 w-3 mr-1" />
                      초기화
                    </Button>
                  )}
                </div>
                {/* 상태 필터: 전체가 첫 열 혹자, 나머지 2열에 2개씩 */}
                <div className="space-y-2">
                  {/* 첫 번째 줄: 전체 */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStatusFilter('all')}
                    className={`w-full p-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                      statusFilter === 'all'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-xs">전체</div>
                        <div className="text-[10px] text-muted-foreground">
                          {getStatusCount('all')}건
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  {/* 두 번째 줄: 접수됨 + 처리 중 */}
                  <div className="grid grid-cols-2 gap-2">
                    {statuses.slice(0, 2).map((status) => (
                      <motion.button
                        key={status.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setStatusFilter(status.id)}
                        className={`p-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                          statusFilter === status.id
                            ? `${status.bgColor} ${status.color} border-current`
                            : 'border-border bg-card hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0">{status.icon}</div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-xs truncate">
                              {status.label}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {getStatusCount(status.id)}건
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* 세 번째 줄: 답변 완료 + 종결 */}
                  <div className="grid grid-cols-2 gap-2">
                    {statuses.slice(2).map((status) => (
                      <motion.button
                        key={status.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setStatusFilter(status.id)}
                        className={`p-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                          statusFilter === status.id
                            ? `${status.bgColor} ${status.color} border-current`
                            : 'border-border bg-card hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0">{status.icon}</div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-xs truncate">
                              {status.label}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {getStatusCount(status.id)}건
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Result Indicator */}
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm px-1"
            >
              <span className="text-muted-foreground">
                &ldquo;{searchQuery}&rdquo; 검색 결과:
              </span>
              <span className="text-foreground">
                {filteredInquiryList.length}건
              </span>
            </motion.div>
          )}
        </div>

        {/* Tickets List */}
        <AnimatePresence mode="wait">
          {filteredInquiryList.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-2 border-dashed">
                <CardContent className="p-12">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted">
                      <MessageSquare className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="mb-2">
                        {hasActiveFilters
                          ? '검색 결과가 없습니다'
                          : '아직 문의가 없습니다'}
                      </h3>
                      <p className="text-muted-foreground">
                        {hasActiveFilters
                          ? '다른 검색어나 필터를 시도해보세요'
                          : '궁금한 점이나 개선사항을 자유롭게 문의해주세요'}
                      </p>
                    </div>
                    {!hasActiveFilters && (
                      <Button
                        onClick={() => navigate('/inquiry/create')}
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground cursor-pointer shadow-lg hover:shadow-xl shadow-primary/25 hover:shadow-primary/30 transition-all duration-200 hover:scale-105 active:scale-95 border-0 font-medium px-6 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-white/20 rounded-full">
                            <Plus className="h-4 w-4" />
                          </div>
                          <span>첫 문의 작성하기</span>
                        </div>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredInquiryList.map((ticket, index) => {
                const categoryInfo = categories.find(
                  (category) => category.id === ticket.inquiryType
                );
                const statusInfo = statuses.find(
                  (status) => status.id === ticket.inquiryStatus
                );

                return (
                  <motion.div
                    key={ticket.inquiryId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="border-2 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => navigate(`/inquiry/${ticket.inquiryId}`)}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Category Icon */}
                          <div
                            className={`p-2 sm:p-3 rounded-xl ${categoryInfo?.bgColor} flex-shrink-0`}
                          >
                            <div className={categoryInfo?.color}>
                              {categoryInfo?.icon}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 sm:gap-4 mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="mb-2 line-clamp-2 sm:line-clamp-1 group-hover:text-primary transition-colors text-sm sm:text-base">
                                  {ticket.title}
                                </h3>
                                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                  <Badge
                                    variant="outline"
                                    className={`${categoryInfo?.bgColor} ${categoryInfo?.color} border ${categoryInfo?.borderColor} text-xs`}
                                  >
                                    {categoryInfo?.label}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`${statusInfo?.bgColor} ${statusInfo?.color} text-xs`}
                                  >
                                    <span className="mr-1">
                                      {statusInfo?.icon}
                                    </span>
                                    {statusInfo?.label}
                                  </Badge>
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                            </div>

                            <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                <span className="truncate">
                                  {formatDate(ticket.regDateTime)}
                                </span>
                                {ticket.inquiryStatus === 'ANSWERED' && (
                                  <span className="flex items-center gap-1 text-green-600 flex-shrink-0">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span className="hidden sm:inline">
                                      답변 완료
                                    </span>
                                    <span className="sm:hidden">답변</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InquiryPage;
