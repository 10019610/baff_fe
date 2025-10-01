import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

interface InquiryHeaderProps {
  step: 'category' | 'form';
  onBack: () => void;
  isSubmitting: boolean;
}

const InquiryHeader: React.FC<InquiryHeaderProps> = ({
  step,
  onBack,
  isSubmitting,
}) => {
  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={isSubmitting}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로
          </Button>
          {step === 'category' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>문의 유형 선택</span>
            </div>
          )}

          {step === 'form' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>문의 작성 중</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiryHeader;
