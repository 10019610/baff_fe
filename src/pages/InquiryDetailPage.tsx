import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Bug,
  Clock,
  FileText,
  CheckCircle2,
  X,
  Calendar,
  User,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion } from 'motion/react';
import { api } from '../services/api/Api';
import { formatDate } from '../utils/DateUtil';
import type {
  InquiryResponseDto,
  InquiryType,
  InquiryStatus,
} from '../types/Inquiry.api.type';

interface CategoryInfo {
  id: InquiryType;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface StatusInfo {
  id: InquiryStatus;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

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

const InquiryDetailPage = () => {
  const { inquiryId } = useParams<{ inquiryId: string }>();
  const navigate = useNavigate();

  // 페이지 로드 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: inquiry, isLoading } = useQuery<InquiryResponseDto>({
    queryKey: ['inquiryDetail', inquiryId],
    queryFn: async () => {
      try {
        const response = await api.get(
          `/inquiry/getInquiryDetail/${inquiryId}`
        );
        return response.data;
      } catch (error) {
        console.warn('getInquiryDetail API not available:', error);
        return null;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="bg-background min-h-screen pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="border-2 border-dashed">
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted">
                  <MessageSquare className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="mb-2">문의를 찾을 수 없습니다</h3>
                  <p className="text-muted-foreground">
                    요청하신 문의가 존재하지 않거나 삭제되었습니다
                  </p>
                </div>
                <Button onClick={() => navigate('/inquiry')} className="mt-4">
                  문의 목록으로 돌아가기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const categoryInfo = categories.find((cat) => cat.id === inquiry.inquiryType);
  const statusInfo = statuses.find((stat) => stat.id === inquiry.inquiryStatus);

  return (
    <div className="bg-background min-h-screen pb-20 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/inquiry')}
              className="flex items-center gap-2 hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">돌아가기</span>
            </Button>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold truncate">
                  문의 상세
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  문의 #{inquiry.inquiryId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* 문의 정보 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 overflow-hidden">
            {/* 헤더 섹션 */}
            <div className="bg-gradient-to-r from-muted/30 to-muted/10 px-6 py-6 border-b">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    {categoryInfo && (
                      <div
                        className={`p-2 rounded-lg ${categoryInfo.bgColor} flex-shrink-0`}
                      >
                        <div className={categoryInfo.color}>
                          {categoryInfo.icon}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      {categoryInfo && (
                        <Badge
                          variant="outline"
                          className={`${categoryInfo.bgColor} ${categoryInfo.color} border ${categoryInfo.borderColor}`}
                        >
                          {categoryInfo.label}
                        </Badge>
                      )}
                      {statusInfo && (
                        <Badge
                          variant="outline"
                          className={`${statusInfo.bgColor} ${statusInfo.color}`}
                        >
                          <span className="mr-1">{statusInfo.icon}</span>
                          {statusInfo.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-xl sm:text-2xl leading-tight text-foreground">
                    {inquiry.title}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 px-3 py-2 rounded-lg">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(inquiry.regDateTime)}</span>
                </div>
              </div>
            </div>

            {/* 내용 섹션 */}
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    문의 내용
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-primary/30">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                        {inquiry.content}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 답변 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-2 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-muted/20 to-muted/5 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                관리자 답변
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {inquiry.inquiryStatus === 'ANSWERED' ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold">관리자</span>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-700 border-green-200"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          답변 완료
                        </Badge>
                      </div>
                      <div className="bg-gradient-to-r from-muted/40 to-muted/20 rounded-lg p-4 border-l-4 border-green-400">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                            문의해주신 내용에 대해 확인했습니다. 빠른 시일 내에
                            해당 기능을 개선하여 더 나은 서비스를 제공하도록
                            하겠습니다. 추가 문의사항이 있으시면 언제든 연락
                            주세요. 감사합니다.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 mb-6 border-2 border-muted/30">
                    <Clock className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">답변 대기 중</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    관리자가 검토 중입니다. 빠른 시일 내에 답변드리겠습니다.
                  </p>
                  <div className="mt-4 text-xs text-muted-foreground bg-muted/20 px-3 py-2 rounded-full inline-block">
                    평균 답변 시간: 1-2일
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 액션 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            onClick={() => navigate('/inquiry')}
            variant="outline"
            className="flex-1 h-12 border-2"
          >
            문의 목록으로 돌아가기
          </Button>
          <Button
            onClick={() => navigate('/inquiry/create')}
            className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl shadow-primary/25 hover:shadow-primary/30 transition-all duration-200 hover:scale-105 active:scale-95 border-0 font-medium"
          >
            새 문의 작성하기
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default InquiryDetailPage;
