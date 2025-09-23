import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Ruler, User, TrendingUp } from 'lucide-react';
import { api } from '../../services/api/Api';
import toast from 'react-hot-toast';

interface HeightInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHeightSaved: (height: number) => void;
}

const HeightInputModal: React.FC<HeightInputModalProps> = ({
  isOpen,
  onClose,
  onHeightSaved,
}) => {
  const [height, setHeight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // ESC 키로 모달이 닫히지 않도록 방지
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const heightValue = parseFloat(height);

    // 유효성 검사
    if (!heightValue || heightValue < 100 || heightValue > 250) {
      toast.error('신장은 100cm ~ 250cm 사이의 값을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 사용자 키 정보 업데이트 API 호출
      await api.post(`/user/insertHeight`, heightValue);

      toast.success('신장 정보가 성공적으로 저장되었습니다!');
      onHeightSaved(heightValue);
      onClose();
    } catch (error) {
      console.error('Failed to save height:', error);
      toast.error('신장 정보 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => e.stopPropagation()} // 외부 클릭 방지
    >
      <Card className="w-full max-w-md animate-in fade-in-0 duration-300 scale-95 animate-in">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Ruler className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              신장(키) 정보 입력
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              정확한 건강 분석을 위해 신장 정보 입력이 필요합니다
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 키 입력의 중요성 설명 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <div className="font-medium">BMI 계산</div>
                <div className="text-muted-foreground">
                  체질량지수 분석에 활용
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <User className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <div className="font-medium">맞춤형 분석</div>
                <div className="text-muted-foreground">
                  개인별 건강 목표 설정
                </div>
              </div>
            </div>
          </div>

          {/* 키 입력 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="height" className="text-sm font-medium">
                신장 (cm)
              </Label>
              <div className="relative">
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="예: 170"
                  min="100"
                  max="250"
                  step="0.1"
                  className="text-center text-lg font-medium"
                  autoFocus
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  cm
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                100cm ~ 250cm 사이의 값을 입력해주세요
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !height}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    저장 중...
                  </div>
                ) : (
                  '저장하고 시작하기'
                )}
              </Button>
            </div>
          </form>

          <div className="text-xs text-muted-foreground text-center border-t pt-4">
            <div className="font-medium text-primary mb-1">필수 정보입니다</div>
            입력하신 정보는 안전하게 암호화되어 저장됩니다
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeightInputModal;
