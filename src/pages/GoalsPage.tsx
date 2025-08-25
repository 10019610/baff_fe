import GoalSetting from '../components/GoalSetting.tsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { GetGoalListResponse, RecordGoalsRequest } from '../types/Goals.api.type.ts';
import { useState } from 'react';
import { goalsInitializer } from '../types/Goal.initializer.ts';
import type { PresetDurationType } from '../types/Goals.type.ts';
import GoalSetupGuide from '../components/GoalSetupGuide.tsx';
import { api } from '../services/api/Api.ts';
import toast from 'react-hot-toast';

/**
 * 체중 목표 설정 페이지
 *
 * @description
 *
 * @author hjkim
 * @constructor
 */
const GoalsPage = () => {
  /**
   * Variables
   */
  const presetDuration: PresetDurationType[] = [
    { value: '1week', label: '1주', hours: 168 },
    { value: '1month', label: '1달', hours: 720 },
  ];
  /**
   * States
   */
  /* 목표 설정 저장 파라미터 state */
  const [recordWeightParam, setRecordWeightParam] = useState<RecordGoalsRequest>(goalsInitializer.INITIAL_RECORD_WEIGHT_PARAM);
  /* 체중 기록여부 state */
  const [hasWeightEntry] = useState<boolean>(true);
  /* 페이지 로딩 제어 state */
  // const [isLoading, setIsLoading] = useState<boolean>(true);
  /**
   * APIs
   */
  /* 체중 목표 설정 api */
  const { mutate: recordWeightMutation } = useMutation({
    mutationFn: (param: RecordGoalsRequest) => api.post('/goals/recordGoals', param),
    onSuccess: () => {
      refetchGoalList();
    }
  });
  /* 현재 체중기록 확인 api */
  // 임시
  const currentWeight = 60;
  /* 설정된 목표 리스트 조회 api */
  const { data: goalList, refetch: refetchGoalList } = useQuery<GetGoalListResponse[]>({
    queryKey: ['goal'],
    initialData: goalsInitializer.INITIAL_GET_GOAL_LIST,
    queryFn: () => {
      return api.get('/goals/getGoalsList').then((res) => {
        return res.data;
      });
    },
  });
  /**
   * Handlers
   */
  /* 목표 설정 handler */
  const handleRecordWeight = () => {
    // Validation: 제목, 목표기간, 현재 및 목표 체중(모두 필수값)
    console.log(recordWeightParam);
    // 제목
    if (recordWeightParam.title.trim() === '') {
      toast.error('모든 값을 입력해주세요.');
      return;
    }
    // 목표기간
    if (recordWeightParam.presetDuration === 0) {
      toast.error('모든 값을 입력해주세요.');
      return;
    }

    recordWeightMutation(recordWeightParam);
    // tes(recordWeightParam);
  };
  /* 목표 설정 파라미터 변경 handler */
  const handleRecordGoalsParam = (key: keyof RecordGoalsRequest, value: string | number) => {
    setRecordWeightParam((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
  /* 남은일자 계산 handler */
  const handleGetDaysRemaining = (startDate: string, endDate: string) => {
    const today = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);

  };
  if (!hasWeightEntry) {
    return <GoalSetupGuide />;
  }
  return (
    <div className="goals-page">
      <GoalSetting onClickRecord={handleRecordWeight} onChangeParam={handleRecordGoalsParam} param={recordWeightParam}
                   presetDuration={presetDuration} currentWeight={currentWeight} goalList={goalList}
                   handleGetDaysRemaining={handleGetDaysRemaining} />
    </div>
  );
};

export default GoalsPage;
