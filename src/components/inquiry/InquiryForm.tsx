import React from 'react';
import {
  MessageSquare,
  Sparkles,
  Bug,
  CheckCircle2,
  Send,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { motion } from 'motion/react';
import type { CategoryType } from '../../pages/InquiryCreatePage';

interface CategoryInfo {
  id: CategoryType;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const categories: CategoryInfo[] = [
  {
    id: 'IMPROVEMENT',
    label: '개선',
    icon: <Sparkles className="h-5 w-5" />,
    description: '더 나은 서비스를 위한 아이디어와 제안',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  {
    id: 'QUESTION',
    label: '문의',
    icon: <MessageSquare className="h-5 w-5" />,
    description: '서비스 이용 방법이나 기능에 대한 질문',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'BUG',
    label: '오류 제보',
    icon: <Bug className="h-5 w-5" />,
    description: '오류나 문제점 발견 시 알려주세요',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
  },
];

interface InquiryFormProps {
  selectedCategory: CategoryType | null;
  title: string;
  content: string;
  isSubmitting: boolean;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onCategoryChange: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const InquiryForm: React.FC<InquiryFormProps> = ({
  selectedCategory,
  title,
  content,
  isSubmitting,
  onTitleChange,
  onContentChange,
  onCategoryChange,
  onSubmit,
  onCancel,
}) => {
  const currentCategoryInfo = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null;

  return (
    <div className="space-y-6">
      {/* Selected Category Header */}
      {currentCategoryInfo && (
        <Card className={`border-2 ${currentCategoryInfo.borderColor}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${currentCategoryInfo.bgColor}`}
                >
                  <div className={currentCategoryInfo.color}>
                    {currentCategoryInfo.icon}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={currentCategoryInfo.color}>
                      {currentCategoryInfo.label}
                    </h3>
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentCategoryInfo.description}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCategoryChange}
                disabled={isSubmitting}
              >
                변경
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-3">
          <Label htmlFor="title" className="text-base">
            제목 <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="어떤 도움이 필요하신가요?"
              maxLength={100}
              disabled={isSubmitting}
              className="h-14 text-base pr-16 border-2 focus:border-primary transition-colors"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {title.length}/100
            </div>
          </div>
          {title.length > 0 && title.length < 5 && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-xs text-orange-500 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              제목을 5자 이상 입력해주세요
            </motion.p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <Label htmlFor="content" className="text-base">
            내용 <span className="text-destructive">*</span>
          </Label>
          <div className="space-y-2">
            <Textarea
              id="content"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder={`자세히 설명해주실수록 더 정확한 답변을 드릴 수 있습니다.

예시:
• 문제가 발생한 상황
• 기대했던 결과
• 실제로 발생한 결과
• 오류 메시지 (있다면)`}
              rows={12}
              maxLength={2000}
              disabled={isSubmitting}
              className="resize-none border-2 focus:border-primary transition-colors leading-relaxed text-base"
            />
            <div className="flex justify-end">
              <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                {content.length}/2000
              </div>
            </div>
          </div>
          {content.length > 0 && content.length < 10 && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-xs text-orange-500 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              내용을 10자 이상 입력해주세요
            </motion.p>
          )}
          {content.length >= 10 && content.length < 50 && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-xs text-blue-500 flex items-center gap-1"
            >
              <Lightbulb className="h-3 w-3" />
              조금만 더 자세히 작성하면 더 정확한 답변을 받을 수 있어요
            </motion.p>
          )}
        </div>

        {/* Info Alert */}
        <Alert className="border-primary/30 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm leading-relaxed">
            <div className="space-y-2">
              <p>
                <strong className="text-foreground">💡 알아두세요</strong>
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  • 답변은{' '}
                  <strong className="text-foreground">문의 목록</strong>에서
                  확인할 수 있습니다
                </li>
                <li>
                  • 긴급 문의:{' '}
                  <strong className="text-primary">a10019610@gmail.com</strong>
                </li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 h-12 border-2"
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !title.trim() ||
              !content.trim() ||
              title.length < 5 ||
              content.length < 10
            }
            className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl shadow-primary/25 hover:shadow-primary/30 transition-all duration-200 hover:scale-105 active:scale-95 border-0 font-medium relative overflow-hidden group"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                제출 중...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-1" />
                문의 등록하기
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InquiryForm;
