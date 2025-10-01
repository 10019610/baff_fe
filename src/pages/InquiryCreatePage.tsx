import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import toast from 'react-hot-toast';
import InquiryCategorySelect from '../components/inquiry/InquiryCategorySelect.tsx';
import InquiryForm from '../components/inquiry/InquiryForm.tsx';
import InquiryHeader from '../components/inquiry/InquiryHeader.tsx';

export type CategoryType = 'inquiry' | 'improvement' | 'bug' | 'other';

export interface InquiryItem {
  id: string;
  title: string;
  category: CategoryType;
  status: 'pending' | 'in-progress' | 'resolved';
  content: string;
  createdAt: string;
  response?: string;
}

const InquiryCreatePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'category' | 'form'>('category');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategorySelect = (categoryId: CategoryType) => {
    setSelectedCategory(categoryId);
    setStep('form');
  };

  const handleBack = () => {
    if (step === 'form') {
      setStep('category');
    } else {
      navigate('/inquiry');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      toast.error('카테고리를 선택해주세요');
      return;
    }

    if (!title.trim()) {
      toast.error('제목을 입력해주세요');
      return;
    }

    if (title.trim().length < 5) {
      toast.error('제목을 5자 이상 입력해주세요');
      return;
    }

    if (!content.trim()) {
      toast.error('문의 내용을 입력해주세요');
      return;
    }

    if (content.trim().length < 10) {
      toast.error('내용을 10자 이상 입력해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: 실제 API 호출로 교체
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('문의가 등록되었습니다');
      navigate('/inquiry');
    } catch (error) {
      console.error('Failed to create inquiry:', error);
      toast.error('문의 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen pb-20 md:pb-6">
      <InquiryHeader
        step={step}
        onBack={handleBack}
        isSubmitting={isSubmitting}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <AnimatePresence mode="wait">
          {step === 'category' ? (
            <motion.div
              key="category"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <InquiryCategorySelect
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <InquiryForm
                selectedCategory={selectedCategory}
                title={title}
                content={content}
                isSubmitting={isSubmitting}
                onTitleChange={setTitle}
                onContentChange={setContent}
                onCategoryChange={() => setStep('category')}
                onSubmit={handleSubmit}
                onCancel={handleBack}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InquiryCreatePage;
