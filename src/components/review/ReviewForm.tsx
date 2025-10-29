import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Star,
  X,
  Upload,
  CheckCircle,
  Smile,
  Meh,
  Frown,
  Camera,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DIET_METHODS, DIFFICULTY_LABELS } from '../../types/review.type';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  uploadReviewImages,
  createReview,
} from '../../services/api/review.api';
import { getGoalDetailForReview } from '../../services/api/goals.api';
import { getBattleDetailForReview } from '../../services/api/battleRoom.api';

interface ReviewFormProps {
  goalId?: number;
  battleRoomEntryCode?: string; // battleRoomId에서 battleRoomEntryCode로 변경
  startWeight?: number;
  endWeight?: number;
  duration?: number;
  onCancel: () => void;
  onSuccess?: () => void; // 성공 콜백 추가
}

export default function ReviewForm({
  goalId,
  battleRoomEntryCode,
  startWeight: propStartWeight = 0,
  endWeight: propEndWeight = 0,
  duration: propDuration = 0,
  onCancel,
  onSuccess,
}: ReviewFormProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [otherMethod, setOtherMethod] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'moderate' | 'hard'>(
    'moderate'
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>([null, null]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);

  // 추가 다이어트 관련 문항
  const [hardestPeriod, setHardestPeriod] = useState('');
  const [overcomingMethod, setOvercomingMethod] = useState('');
  const [supportHelp, setSupportHelp] = useState('');
  const [wouldRetry, setWouldRetry] = useState(''); // 가장 효과적이었던 방법
  const [recommendTarget, setRecommendTarget] = useState('');

  // 수동 입력 모드 (목표/대결 없이 작성)
  const isManualMode = !goalId && !battleRoomEntryCode;
  const [manualStartWeight, setManualStartWeight] = useState('');
  const [manualEndWeight, setManualEndWeight] = useState('');
  const [manualDuration, setManualDuration] = useState('');

  // goalId가 있을 때 목표 상세 정보 가져오기
  const {
    data: goalDetail,
    isLoading: isLoadingGoalDetail,
    isError: isErrorGoalDetail,
  } = useQuery({
    queryKey: ['goalDetailForReview', goalId],
    queryFn: () => getGoalDetailForReview(goalId!),
    enabled: !!goalId, // goalId가 있을 때만 실행
    retry: 1, // 실패 시 1번만 재시도
  });

  // battleRoomEntryCode가 있을 때 배틀 상세 정보 가져오기
  const {
    data: battleDetail,
    isLoading: isLoadingBattleDetail,
    isError: isErrorBattleDetail,
  } = useQuery({
    queryKey: ['battleDetailForReview', battleRoomEntryCode],
    queryFn: () => getBattleDetailForReview(battleRoomEntryCode!),
    enabled: !!battleRoomEntryCode, // battleRoomEntryCode가 있을 때만 실행
    retry: 1, // 실패 시 1번만 재시도
  });

  // 실제 사용할 값 결정 (goalDetail 또는 battleDetail이 있으면 우선 사용)
  const startWeight =
    goalDetail?.startWeight ?? battleDetail?.startWeight ?? propStartWeight;
  const endWeight =
    goalDetail?.currentWeight ?? battleDetail?.currentWeight ?? propEndWeight;
  const duration =
    goalDetail?.durationDays ?? battleDetail?.durationDays ?? propDuration;

  // 이미지 업로드 mutation
  const uploadImagesMutation = useMutation({
    mutationFn: uploadReviewImages,
    onSuccess: (data) => {
      setUploadedImageUrls(data);
      toast.success('이미지가 업로드되었습니다');
    },
    onError: (error: unknown) => {
      console.error('이미지 업로드 실패:', error);
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
          ? String(error.response.data.message)
          : '이미지 업로드에 실패했습니다';
      toast.error(errorMessage);
    },
  });

  // 리뷰 작성 mutation
  const createReviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      toast.success('리뷰가 성공적으로 작성되었습니다! 🎉');
      // 리뷰 리스트 캐시 무효화 (자동으로 다시 불러옴)
      queryClient.invalidateQueries({ queryKey: ['reviewList'] });
      onSuccess?.(); // 부모 컴포넌트 콜백 실행
      onCancel(); // 모달 닫기
    },
    onError: (error: unknown) => {
      console.error('리뷰 작성 실패:', error);
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
          ? String(error.response.data.message)
          : '리뷰 작성에 실패했습니다';
      toast.error(errorMessage);
    },
  });

  const handleMethodToggle = (method: string) => {
    console.log('handleMethodToggle called with:', method);
    console.log('Current selectedMethods:', selectedMethods);

    if (selectedMethods.includes(method)) {
      console.log('Removing method:', method);
      setSelectedMethods(selectedMethods.filter((m) => m !== method));
      // 기타 직접 입력을 해제할 때 입력한 텍스트도 초기화
      if (method === 'other') {
        setOtherMethod('');
      }
    } else {
      console.log('Adding method:', method);
      setSelectedMethods([...selectedMethods, method]);
    }
  };

  const handlePhotoUpload = async (
    type: 'before' | 'after',
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 허용된 이미지 확장자 목록
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      toast.error(
        'JPG, JPEG, PNG, GIF, WEBP 형식의 이미지만 업로드 가능합니다'
      );
      return;
    }

    // 파일 크기 체크 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('이미지 크기는 5MB 이하여야 합니다');
      return;
    }

    // 이미지 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다');
      return;
    }

    // 미리보기를 위한 FileReader
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const index = type === 'before' ? 0 : 1;

      // 미리보기 이미지 설정
      const newPhotos = [...photos];
      newPhotos[index] = result;
      setPhotos(newPhotos);

      // 파일 객체 저장
      const newPhotoFiles = [...photoFiles];
      newPhotoFiles[index] = file;
      setPhotoFiles(newPhotoFiles);
    };
    reader.readAsDataURL(file);

    // 서버에 업로드
    try {
      // 현재 저장된 파일들과 새 파일을 합쳐서 업로드
      const index = type === 'before' ? 0 : 1;
      const newPhotoFiles = [...photoFiles];
      newPhotoFiles[index] = file;

      // null이 아닌 파일들만 필터링
      const filesToUpload = newPhotoFiles.filter((f): f is File => f !== null);

      if (filesToUpload.length > 0) {
        await uploadImagesMutation.mutateAsync(filesToUpload);
      }
    } catch (error) {
      console.error('이미지 업로드 중 오류:', error);
      // 업로드 실패 시 미리보기 이미지 제거
      const newPhotos = [...photos];
      const index = type === 'before' ? 0 : 1;
      newPhotos[index] = '';
      setPhotos(newPhotos);

      const newPhotoFiles = [...photoFiles];
      newPhotoFiles[index] = null;
      setPhotoFiles(newPhotoFiles);
    }
  };

  const handlePhotoRemove = (index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = '';
    setPhotos(newPhotos);

    const newPhotoFiles = [...photoFiles];
    newPhotoFiles[index] = null;
    setPhotoFiles(newPhotoFiles);

    // 업로드된 URL도 제거
    const newUploadedUrls = [...uploadedImageUrls];
    newUploadedUrls[index] = '';
    setUploadedImageUrls(newUploadedUrls);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('리뷰 제목을 입력해주세요');
      return;
    }

    if (!content.trim()) {
      toast.error('리뷰 내용을 입력해주세요');
      return;
    }

    if (selectedMethods.length === 0) {
      toast.error('최소 1개 이상의 다이어트 방법을 선택해주세요');
      return;
    }

    // 수동 입력 모드 검증
    let finalStartWeight = startWeight;
    let finalEndWeight = endWeight;
    let finalDuration = duration;

    if (isManualMode) {
      if (!manualStartWeight || !manualEndWeight || !manualDuration) {
        toast.error('시작 체중, 목표 체중, 기간을 모두 입력해주세요');
        return;
      }

      const start = parseFloat(manualStartWeight);
      const end = parseFloat(manualEndWeight);
      const dur = parseInt(manualDuration);

      if (isNaN(start) || isNaN(end) || isNaN(dur) || dur <= 0) {
        toast.error('올바른 값을 입력해주세요');
        return;
      }

      finalStartWeight = start;
      finalEndWeight = end;
      finalDuration = dur;
    }

    // dietMethods 문자열 생성: 선택된 라벨들을 쉼표로 구분
    const dietMethodsString = selectedMethods
      .map((method) => {
        // 기타 직접 입력인 경우, 사용자가 입력한 텍스트 사용
        if (method === 'other') {
          return otherMethod.trim() || '기타';
        }
        const dietMethod = DIET_METHODS.find((m) => m.value === method);
        return dietMethod?.label || method;
      })
      .join(',');

    // difficulty를 텍스트로 변환
    const difficultyText = DIFFICULTY_LABELS[difficulty];

    // reviewType 결정
    let reviewType: 'GOAL' | 'BATTLE' | 'MANUAL' = 'MANUAL';
    if (goalId) {
      reviewType = 'GOAL';
    } else if (battleRoomEntryCode) {
      reviewType = 'BATTLE';
    }

    // 리뷰 작성 API 호출
    createReviewMutation.mutate({
      title: title.trim(),
      dietMethods: dietMethodsString,
      difficulty: difficultyText,
      startWeight: finalStartWeight,
      targetWeight: finalEndWeight,
      period: finalDuration,
      question_hardest_period: hardestPeriod.trim(),
      question_diet_management: overcomingMethod.trim(),
      question_exercise: supportHelp.trim(),
      question_effective_method: wouldRetry.trim(),
      question_recommend_target: recommendTarget.trim(),
      content: content.trim(),
      imageUrl1: uploadedImageUrls[0] || undefined,
      imageUrl2: uploadedImageUrls[1] || undefined,
      isWeightPrivate: isPrivate,
      reviewType,
      goalId: goalId || undefined,
      battleRoomEntryCode: battleRoomEntryCode || undefined,
    });
  };

  //   const getDifficultyIcon = (diff: 'easy' | 'moderate' | 'hard') => {
  //     switch (diff) {
  //       case 'easy':
  //         return <Smile className="h-5 w-5 text-green-600" />;
  //       case 'moderate':
  //         return <Meh className="h-5 w-5 text-yellow-600" />;
  //       case 'hard':
  //         return <Frown className="h-5 w-5 text-red-600" />;
  //     }
  //   };

  const weightChange =
    isManualMode && manualStartWeight && manualEndWeight
      ? parseFloat(manualStartWeight) - parseFloat(manualEndWeight)
      : startWeight - endWeight;
  const isWeightLoss = weightChange > 0;

  // 목표 또는 배틀 정보 로딩 중
  if (isLoadingGoalDetail || isLoadingBattleDetail) {
    return (
      <Card className="border-primary/0">
        <CardContent className="pt-12 pb-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {isLoadingGoalDetail ? '목표' : '배틀'} 정보를 불러오는 중...
          </p>
        </CardContent>
      </Card>
    );
  }

  // 목표 정보 로딩 실패 시
  if (isErrorGoalDetail && goalId) {
    toast.error('목표 정보를 불러올 수 없습니다. 수동으로 입력해주세요.');
  }

  // 배틀 정보 로딩 실패 시
  if (isErrorBattleDetail && battleRoomEntryCode) {
    toast.error('배틀 정보를 불러올 수 없습니다. 수동으로 입력해주세요.');
  }

  return (
    <Card className="border-primary/0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          성공 경험 리뷰 작성
        </CardTitle>
        <CardDescription>
          당신의 성공 경험을 공유하고 다른 사람들에게 동기부여를 주세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 성과 요약 - 수동 입력 모드일 때는 숨김 */}
          {!isManualMode && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {duration}일 동안 {startWeight}kg에서 {endWeight}kg로{' '}
                <strong>
                  {isWeightLoss
                    ? `${weightChange.toFixed(1)}kg 감량`
                    : `${Math.abs(weightChange).toFixed(1)}kg 증량`}
                </strong>{' '}
                성공! 축하드립니다! 🎉
              </AlertDescription>
            </Alert>
          )}

          {/* 수동 입력 모드 - 체중 정보 입력 */}
          {isManualMode && (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <div className="space-y-3">
                  <p className="font-medium">체중 변화 정보를 입력해주세요</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label
                        htmlFor="manual-start"
                        className="text-xs text-blue-700 dark:text-blue-300"
                      >
                        시작 체중 (kg)
                      </Label>
                      <Input
                        id="manual-start"
                        type="number"
                        step="0.1"
                        placeholder="70.0"
                        value={manualStartWeight}
                        onChange={(e) => setManualStartWeight(e.target.value)}
                        className="mt-1 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="manual-end"
                        className="text-xs text-blue-700 dark:text-blue-300"
                      >
                        목표 체중 (kg)
                      </Label>
                      <Input
                        id="manual-end"
                        type="number"
                        step="0.1"
                        placeholder="65.0"
                        value={manualEndWeight}
                        onChange={(e) => setManualEndWeight(e.target.value)}
                        className="mt-1 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="manual-duration"
                        className="text-xs text-blue-700 dark:text-blue-300"
                      >
                        기간 (일)
                      </Label>
                      <Input
                        id="manual-duration"
                        type="number"
                        placeholder="30"
                        value={manualDuration}
                        onChange={(e) => setManualDuration(e.target.value)}
                        className="mt-1 bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  {manualStartWeight && manualEndWeight && manualDuration && (
                    <p className="text-sm">
                      {manualDuration}일 동안 {manualStartWeight}kg에서{' '}
                      {manualEndWeight}kg으로{' '}
                      <strong>
                        {weightChange > 0
                          ? `${weightChange.toFixed(1)}kg 감량`
                          : `${Math.abs(weightChange).toFixed(1)}kg 증량`}
                      </strong>
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 리뷰 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">리뷰 제목 *</Label>
            <Input
              id="title"
              placeholder="예: 3개월 만에 10kg 감량 성공!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">{title.length}/100</p>
          </div>

          {/* 다이어트 방법 선택 */}
          <div className="space-y-3">
            <Label>사용한 다이어트 방법 * (복수 선택 가능)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DIET_METHODS.map((method) => (
                <div key={method.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={method.value}
                    checked={selectedMethods.includes(method.value)}
                    onCheckedChange={() => handleMethodToggle(method.value)}
                  />
                  <Label
                    htmlFor={method.value}
                    className="cursor-pointer text-sm"
                  >
                    {method.label}
                  </Label>
                </div>
              ))}
            </div>
            {selectedMethods.includes('other') && (
              <Input
                placeholder="기타 방법을 입력해주세요"
                value={otherMethod}
                onChange={(e) => setOtherMethod(e.target.value)}
                className="mt-2"
              />
            )}
            {selectedMethods.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedMethods.map((method) => {
                  // 기타 직접 입력인 경우 사용자가 입력한 값 표시
                  let methodLabel = DIET_METHODS.find(
                    (m) => m.value === method
                  )?.label;

                  if (method === 'other' && otherMethod.trim()) {
                    methodLabel = otherMethod.trim();
                  }

                  return (
                    <Badge
                      key={method}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      <span>{methodLabel}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMethodToggle(method);
                        }}
                        className="ml-1 hover:text-red-600 focus:outline-none pointer-events-auto cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* 난이도 평가 */}
          <div className="space-y-3">
            <Label>난이도는 어땠나요? *</Label>
            <RadioGroup
              value={difficulty}
              onValueChange={(value) =>
                setDifficulty(value as 'easy' | 'moderate' | 'hard')
              }
            >
              <div className="grid grid-cols-3 gap-3">
                <div
                  className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                    difficulty === 'easy'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                      : 'border-border hover:border-green-300'
                  }`}
                >
                  <RadioGroupItem value="easy" id="easy" className="sr-only" />
                  <Label
                    htmlFor="easy"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Smile
                      className={`h-8 w-8 ${difficulty === 'easy' ? 'text-green-600' : 'text-muted-foreground'}`}
                    />
                    <span className="text-sm">쉬웠어요</span>
                  </Label>
                </div>
                <div
                  className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                    difficulty === 'moderate'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                      : 'border-border hover:border-yellow-300'
                  }`}
                >
                  <RadioGroupItem
                    value="moderate"
                    id="moderate"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="moderate"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Meh
                      className={`h-8 w-8 ${difficulty === 'moderate' ? 'text-yellow-600' : 'text-muted-foreground'}`}
                    />
                    <span className="text-sm">적당했어요</span>
                  </Label>
                </div>
                <div
                  className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                    difficulty === 'hard'
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                      : 'border-border hover:border-red-300'
                  }`}
                >
                  <RadioGroupItem value="hard" id="hard" className="sr-only" />
                  <Label
                    htmlFor="hard"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Frown
                      className={`h-8 w-8 ${difficulty === 'hard' ? 'text-red-600' : 'text-muted-foreground'}`}
                    />
                    <span className="text-sm">힘들었어요</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* 추가 다이어트 관련 문항 */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-muted">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              다이어트 상세 경험
            </h3>

            <div className="space-y-2">
              <Label htmlFor="hardest-period">
                가장 힘들었던 시기는 언제였나요?
              </Label>
              <Input
                id="hardest-period"
                placeholder="예: 시작 2주차, 정체기, 마지막 단계 등"
                value={hardestPeriod}
                onChange={(e) => setHardestPeriod(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overcoming-method">
                식단 관리는 어떻게 하셨나요?
              </Label>
              <Textarea
                id="overcoming-method"
                placeholder="예: 아침 단백질 중심, 저녁 탄수화물 제한, 간식 대신 과일 등"
                value={overcomingMethod}
                onChange={(e) => setOvercomingMethod(e.target.value)}
                rows={2}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="support-help">운동은 어떤 것을 하셨나요?</Label>
              <Input
                id="support-help"
                placeholder="예: 매일 아침 30분 걷기, 주 3회 헬스, 홈트레이닝 등"
                value={supportHelp}
                onChange={(e) => setSupportHelp(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="would-retry">가장 효과적이었던 방법은?</Label>
              <Input
                id="would-retry"
                placeholder="예: 아침 공복 유산소, 매일 체중 기록, 물 2L 이상 마시기 등"
                value={wouldRetry}
                onChange={(e) => setWouldRetry(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommend-target">
                이 방법을 누구에게 추천하시나요?
              </Label>
              <Input
                id="recommend-target"
                placeholder="예: 직장인, 운동 초보자, 시간이 부족한 분들 등"
                value={recommendTarget}
                onChange={(e) => setRecommendTarget(e.target.value)}
                maxLength={100}
              />
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div className="space-y-2">
            <Label htmlFor="content">성공 경험 및 노하우 공유 *</Label>
            <Textarea
              id="content"
              placeholder="어떻게 목표를 달성하셨나요? 힘들었던 점이나 극복 방법, 도움이 된 팁 등을 자유롭게 작성해주세요.&#10;&#10;예시:&#10;- 매일 아침 공복에 물 2잔 마시기&#10;- 저녁 8시 이후 금식&#10;- 주 3회 30분 유산소 운동&#10;- 단백질 위주의 식단"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/1000
            </p>
          </div>

          {/* 다이어트 관련 이미지 업로드 */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              다이어트 관련 이미지 (선택사항)
            </Label>
            <p className="text-sm text-muted-foreground">
              식단, 운동, 변화 등 관련 사진을 최대 2장까지 첨부할 수 있습니다
            </p>
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
              <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
                <ul className="list-disc list-inside space-y-1">
                  <li>허용 형식: JPG, JPEG, PNG, GIF, WEBP</li>
                  <li>최대 용량: 5MB</li>
                  <li>최대 2장까지 업로드 가능</li>
                </ul>
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Photo 1 */}
              <div className="space-y-2">
                <Label
                  htmlFor="photo-1"
                  className="text-sm text-muted-foreground"
                >
                  이미지 1
                </Label>
                {photos[0] ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-primary">
                    <img
                      src={photos[0]}
                      alt="업로드된 이미지 1"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 z-10"
                      onClick={() => handlePhotoRemove(0)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Label
                    htmlFor="photo-1"
                    className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      사진 업로드
                    </span>
                    <input
                      id="photo-1"
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload('before', e)}
                    />
                  </Label>
                )}
              </div>

              {/* Photo 2 */}
              <div className="space-y-2">
                <Label
                  htmlFor="photo-2"
                  className="text-sm text-muted-foreground"
                >
                  이미지 2
                </Label>
                {photos[1] ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-primary">
                    <img
                      src={photos[1]}
                      alt="업로드된 이미지 2"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 z-10"
                      onClick={() => handlePhotoRemove(1)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Label
                    htmlFor="photo-2"
                    className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      사진 업로드
                    </span>
                    <input
                      id="photo-2"
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload('after', e)}
                    />
                  </Label>
                )}
              </div>
            </div>
          </div>

          {/* 비공개 옵션 */}
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              id="private"
              checked={isPrivate}
              onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
            />
            <Label htmlFor="private" className="cursor-pointer text-sm">
              체중 수치 비공개 (달성률과 감량 수치는 표시)
            </Label>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createReviewMutation.isPending}
            >
              {createReviewMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  작성 중...
                </>
              ) : (
                '리뷰 작성 완료'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
