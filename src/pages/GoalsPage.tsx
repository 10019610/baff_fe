import GoalSetting from '../components/GoalSetting.tsx';
import { useMutation } from '@tanstack/react-query';
import type { RecordGoalsRequest } from '../types/Goals.api.type.ts';
import { useState } from 'react';
import { goalsInitializer } from '../types/Goal.initializer.ts';
import type { PresetDurationType } from '../types/Goals.type.ts';
import GoalSetupGuide from '../components/GoalSetupGuide.tsx';

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
  const [hasWeightEntry, setHasWeightEntry] = useState<boolean>(false);
  /* 페이지 로딩 제어 state */
  // const [isLoading, setIsLoading] = useState<boolean>(true);
  /**
   * APIs
   */
  /* 체중 목표 설정 api */
  const { mutate: recordWeight } = useMutation({
    mutationFn: (param: RecordGoalsRequest) => {
      console.log('recordWeight', param);
    },
  });
  /**
   * Handlers
   */
  /* 목표 설정 handler */
  const handleRecordWeight = () => {
    console.log('recordWeight', recordWeightParam);
  };
  /* 목표 설정 파라미터 변경 handler */
  const handleRecordGoalsParam = (key: keyof RecordGoalsRequest, value: string | number) => {
    console.log('handleRecordGoalsParam', key, value);
  };
  if (!hasWeightEntry) {
    return <GoalSetupGuide />;
  }
  return (
    <div className="goals-page">
      <GoalSetting onClickRecord={handleRecordWeight} onChangeParam={handleRecordGoalsParam} param={recordWeightParam}
                   presetDuration={presetDuration} />
    </div>
  );
};

export default GoalsPage;
