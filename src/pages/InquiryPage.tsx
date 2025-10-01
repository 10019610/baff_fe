import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
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
import { useState } from 'react';
interface CategoryInfo {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface InquiryItem {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
  response?: string;
}

const categories: CategoryInfo[] = [
  {
    id: 'inquiry',
    label: '문의사항',
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'improvement',
    label: '개선 제안',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  {
    id: 'bug',
    label: '버그 제보',
    icon: <Bug className="h-4 w-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  {
    id: 'other',
    label: '기타',
    icon: <HelpCircle className="h-4 w-4" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950/30',
    borderColor: 'border-gray-200 dark:border-gray-800',
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
    id: 'pending',
    label: '접수 완료',
    icon: <Clock className="h-3 w-3" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
  },
  {
    id: 'in-progress',
    label: '확인 중',
    icon: <FileText className="h-3 w-3" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    id: 'resolved',
    label: '답변 완료',
    icon: <CheckCircle2 className="h-3 w-3" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
  },
];

const InquiryPage = () => {
  const navigate = useNavigate();
  /**
   * states
   */
  // TODO: 실제 API 연동 시 사용할 상태들
  // const [inquiryList, setInquiryList] = useState<InquiryItem[]>([]);
  // const [filteredInquiryList, setFilteredInquiryList] = useState<InquiryItem[]>([]);

  // 임시 데이터 (개발용)
  const filteredInquiryList: InquiryItem[] = [];
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
        <motion.div
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
                <span className="text-3xl">22</span>
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
                    <span className="text-3xl">22</span>
                    <span className="text-muted-foreground">건</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
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
                {/* 모바일: 전체 + 2x2 그리드, 데스크탑: 5개 한 줄 */}
                <div className="md:hidden space-y-2">
                  {/* 모바일 레이아웃: 전체 버튼 - 첫 번째 줄 */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCategoryFilter('all')}
                    className={`w-full p-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                      categoryFilter === 'all'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-xs">전체</span>
                      <span className="text-[10px] text-muted-foreground">
                        22
                      </span>
                    </div>
                  </motion.button>

                  {/* 모바일 레이아웃: 카테고리 버튼들 - 2x2 그리드 */}
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
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
                            22
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 데스크탑 레이아웃: 5개 한 줄 */}
                <div className="hidden md:grid grid-cols-5 gap-2">
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
                        22
                      </span>
                    </div>
                  </motion.button>

                  {categories.map((category) => (
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
                          22
                        </span>
                      </div>
                    </motion.button>
                  ))}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStatusFilter('all')}
                    className={`p-2.5 rounded-lg border-2 transition-all cursor-pointer ${
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
                          22건
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  {statuses.map((status) => (
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
                          <div className="text-xs truncate">{status.label}</div>
                          <div className="text-[10px] text-muted-foreground">
                            22 건
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
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
                  (category) => category.id === ticket.category
                );
                const statusInfo = statuses.find(
                  (status) => status.id === ticket.status
                );

                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="border-2 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => navigate('/inquiry/detail')}
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
                                  {formatDate(ticket.createdAt)}
                                </span>
                                {ticket.response && (
                                  <span className="flex items-center gap-1 text-green-600 flex-shrink-0">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span className="hidden sm:inline">
                                      답변 있음
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
