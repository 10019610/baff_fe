import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Textarea } from '../ui/textarea.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select.tsx';
import {
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  User,
} from 'lucide-react';
import { adminApi } from '../../services/api/admin.api.ts';
import type {
  AdminInquiryDetail,
  InquiryReplyItem,
} from '../../types/Admin.api.type.ts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDateTime } from '../../utils/DateUtil.ts';
import { useState } from 'react';

interface AdminInquiryDetailModalProps {
  inquiryId: number;
  open: boolean;
  onClose: () => void;
}

/**
 * 어드민 문의 상세 + 답변 모달 컴포넌트
 *
 * @description
 * - 문의 상세 정보 표시 (제목, 내용, 유형, 상태, 작성자, 작성일)
 * - 답변 목록 표시 (시간순)
 * - 답변 작성 폼
 * - 문의 상태 변경
 *
 * @author hjkim
 */
const AdminInquiryDetailModal = ({
  inquiryId,
  open,
  onClose,
}: AdminInquiryDetailModalProps) => {
  /**
   * States
   */
  const [replyContent, setReplyContent] = useState<string>('');

  const queryClient = useQueryClient();

  /**
   * Query - 문의 상세 조회
   */
  const { data: inquiry, isLoading } = useQuery<AdminInquiryDetail>({
    queryKey: ['adminInquiryDetail', inquiryId],
    queryFn: async () => {
      const response = await adminApi.getInquiryDetail(inquiryId);
      return response.data;
    },
    enabled: open && inquiryId > 0,
  });

  /**
   * Mutation - 답변 등록
   */
  const replyMutation = useMutation({
    mutationFn: (content: string) =>
      adminApi.replyToInquiry(inquiryId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['adminInquiryDetail', inquiryId],
      });
      queryClient.invalidateQueries({ queryKey: ['adminInquiries'] });
      setReplyContent('');
    },
    onError: () => {
      alert('답변 등록에 실패했습니다.');
    },
  });

  /**
   * Mutation - 상태 변경
   */
  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      adminApi.updateInquiryStatus(inquiryId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['adminInquiryDetail', inquiryId],
      });
      queryClient.invalidateQueries({ queryKey: ['adminInquiries'] });
    },
    onError: () => {
      alert('상태 변경에 실패했습니다.');
    },
  });

  /**
   * Handlers
   */
  const handleSubmitReply = () => {
    const trimmed = replyContent.trim();
    if (trimmed) {
      replyMutation.mutate(trimmed);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    statusMutation.mutate(newStatus);
  };

  /* 문의 유형 배지 */
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'IMPROVEMENT':
        return (
          <Badge className="bg-blue-500 text-white">
            <MessageSquare className="h-3 w-3 mr-1" />
            개선요청
          </Badge>
        );
      case 'QUESTION':
        return (
          <Badge className="bg-purple-500 text-white">
            <MessageSquare className="h-3 w-3 mr-1" />
            질문
          </Badge>
        );
      case 'BUG':
        return (
          <Badge className="bg-red-500 text-white">
            <AlertCircle className="h-3 w-3 mr-1" />
            버그
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  /* 문의 상태 배지 */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            접수
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="h-3 w-3 mr-1" />
            진행중
          </Badge>
        );
      case 'ANSWERED':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            답변완료
          </Badge>
        );
      case 'CLOSED':
        return (
          <Badge variant="outline">
            <CheckCircle className="h-3 w-3 mr-1" />
            종료
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            문의 상세
            {inquiry && (
              <>
                {getTypeBadge(inquiry.inquiryType)}
                {getStatusBadge(inquiry.inquiryStatus)}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            로딩 중...
          </div>
        ) : !inquiry ? (
          <div className="text-center py-8 text-muted-foreground">
            문의 정보를 찾을 수 없습니다.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* 문의 정보 */}
            <div className="space-y-4">
              {/* 제목 */}
              <div>
                <h3 className="text-lg font-semibold">{inquiry.title}</h3>
              </div>

              {/* 작성자 정보 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">작성자</span>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{inquiry.nickname}</span>
                    {inquiry.email && (
                      <span className="text-muted-foreground">
                        ({inquiry.email})
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">작성일</span>
                  <p className="font-medium mt-1">
                    {formatDateTime(inquiry.regDateTime)}
                  </p>
                </div>
              </div>

              {/* 상태 변경 */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  상태 변경
                </span>
                <Select
                  value={inquiry.inquiryStatus}
                  onValueChange={handleStatusChange}
                  disabled={statusMutation.isPending}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECEIVED">접수</SelectItem>
                    <SelectItem value="IN_PROGRESS">진행중</SelectItem>
                    <SelectItem value="ANSWERED">답변완료</SelectItem>
                    <SelectItem value="CLOSED">종료</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 문의 내용 */}
              <div>
                <span className="text-sm text-muted-foreground">문의 내용</span>
                <div className="mt-2 rounded-lg bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {inquiry.content}
                </div>
              </div>
            </div>

            {/* 답변 목록 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  답변 ({inquiry.replies?.length ?? 0}개)
                </span>
              </div>

              {inquiry.replies && inquiry.replies.length > 0 ? (
                <div className="space-y-3">
                  {inquiry.replies.map((reply: InquiryReplyItem) => (
                    <div
                      key={reply.replyId}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">
                            {reply.adminNickname}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(reply.regDateTime)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                  아직 답변이 없습니다.
                </div>
              )}
            </div>

            {/* 답변 작성 폼 */}
            <div className="space-y-3 border-t pt-4">
              <span className="text-sm font-medium">답변 작성</span>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답변 내용을 입력하세요"
                rows={3}
                className="min-h-[80px]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  닫기
                </Button>
                <Button
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || replyMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                  {replyMutation.isPending ? '등록 중...' : '답변 등록'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminInquiryDetailModal;
