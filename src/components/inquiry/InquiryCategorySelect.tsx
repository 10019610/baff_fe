import React from 'react';
import {
  MessageSquare,
  Sparkles,
  Bug,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
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
  examples: string[];
}

const categories: CategoryInfo[] = [
  {
    id: 'inquiry',
    label: '문의사항',
    icon: <MessageSquare className="h-5 w-5" />,
    description: '서비스 이용 방법이나 기능에 대한 질문',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    examples: [
      '체중 기록은 어떻게 수정하나요?',
      '대결 모드 참여 방법이 궁금해요',
    ],
  },
  {
    id: 'improvement',
    label: '개선 제안',
    icon: <Sparkles className="h-5 w-5" />,
    description: '더 나은 서비스를 위한 아이디어와 제안',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    examples: [
      '알림 기능을 추가해주세요',
      '통계 그래프를 더 자세히 보여주면 좋겠어요',
    ],
  },
  {
    id: 'bug',
    label: '버그 제보',
    icon: <Bug className="h-5 w-5" />,
    description: '오류나 문제점 발견 시 알려주세요',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    examples: ['로그인이 안 돼요', '데이터가 사라졌어요'],
  },
  {
    id: 'other',
    label: '기타',
    icon: <HelpCircle className="h-5 w-5" />,
    description: '위 항목에 해당하지 않는 기타 문의',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950/30',
    borderColor: 'border-gray-200 dark:border-gray-800',
    examples: ['협업 제안', '기타 피드백'],
  },
];

interface InquiryCategorySelectProps {
  selectedCategory: CategoryType | null;
  onCategorySelect: (categoryId: CategoryType) => void;
}

const InquiryCategorySelect: React.FC<InquiryCategorySelectProps> = ({
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="mb-2">무엇을 도와드릴까요?</h1>
          <p className="text-muted-foreground">문의 유형을 선택해주세요</p>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 ${
                selectedCategory === category.id
                  ? `${category.borderColor} shadow-md`
                  : 'border-border hover:border-primary/30'
              }`}
              onClick={() => onCategorySelect(category.id)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${category.bgColor}`}>
                      <div className={category.color}>{category.icon}</div>
                    </div>
                    {selectedCategory === category.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-primary"
                      >
                        <CheckCircle2 className="h-6 w-6" />
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className={category.color}>{category.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>

                  <div className={`pt-3 border-t ${category.borderColor}`}>
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-muted-foreground space-y-1">
                        {category.examples.map((example, i) => (
                          <div key={i}>• {example}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InquiryCategorySelect;
