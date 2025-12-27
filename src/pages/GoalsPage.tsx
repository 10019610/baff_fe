import GoalSetting from '../components/GoalSetting.tsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  GetCurrentWeightInfoResponse,
  GetGoalListResponse,
  RecordGoalsRequest,
} from '../types/Goals.api.type.ts';
import { useEffect, useState } from 'react';
import { goalsInitializer } from '../types/Goal.initializer.ts';
import type { PresetDurationType } from '../types/Goals.type.ts';
import GoalSetupGuide from '../components/GoalSetupGuide.tsx';
import { api } from '../services/api/Api.ts';
import toast from 'react-hot-toast';
import GoalsDeleteDialog from '../components/modal/GoalsDeleteDialog.tsx';
import { useAuth } from '../context/AuthContext';

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

  /* 유저 정보 가져오기 */
  const { user } = useAuth();

  /* 예외처리: 첫 몸무게 입력 전에 목표를 만든 유저들 (userId: 78, 80, 81) */
  const EXCEPTION_USER_IDS = [78, 80, 81];
  /**
   * States
   */
  /* 목표 설정 저장 파라미터 state */
  const [recordWeightParam, setRecordWeightParam] =
    useState<RecordGoalsRequest>(goalsInitializer.INITIAL_RECORD_WEIGHT_PARAM);
  /* 페이지 로딩 제어 state */
  // const [isLoading, setIsLoading] = useState<boolean>(true);
  /* 목표삭제 팝업 오픈 제어 state */
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  /* 삭제 대상 목표 ID */
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  /**
   * APIs
   */
  /* 체중 목표 설정 api */
  const { mutate: recordWeightMutation, isPending: isPendingForRecord } =
    useMutation({
      mutationFn: (param: RecordGoalsRequest) =>
        api.post('/goals/recordGoals', param),
      onSuccess: () => {
        refetchGoalList();
        // 폼 초기화
        setRecordWeightParam(goalsInitializer.INITIAL_RECORD_WEIGHT_PARAM);
        toast.success('목표가 성공적으로 설정되었습니다!');
      },
    });
  /* 목표 삭제 api */
  const { mutate: deleteGoalMutation, isPending: isPendingForDelete } =
    useMutation({
      mutationFn: (deleteGoalId: string) =>
        api.post(`/goals/deleteGoal/${deleteGoalId}`),
      onSuccess: () => {
        refetchGoalList();
      },
    });
  /* 현재 체중기록 확인 api */
  // 임시
  // const currentWeight = 60;

  const { data: getCurrentWeightInfo, isSuccess } =
    useQuery<GetCurrentWeightInfoResponse>({
      queryKey: ['currentWeight'],
      initialData: { currentWeight: 0 },
      queryFn: () => {
        return api.get('/weight/getCurrentWeight').then((res) => {
          // setRecordWeightParam((prevState) => ({
          //   ...prevState,
          //   startWeight: getCurrentWeightInfo.currentWeight,
          // }));
          return res.data;
        });
      },
    });

  /* 설정된 목표 리스트 조회 api */
  const { data: goalList, refetch: refetchGoalList } = useQuery<
    GetGoalListResponse[]
  >({
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
  const handleRecordGoalsParam = (
    key: keyof RecordGoalsRequest,
    value: string | number
  ) => {
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
  /**/
  const handleDeleteGoalModal = (goalsId: string) => {
    setIsDeleteModalOpen(true);
    setDeleteGoalId(goalsId);
  };
  /**/
  const cancelDeleteGoal = () => {
    setDeleteGoalId(null);
  };
  /* 목표 삭제 handler */
  const handleGoalDelete = (goalId: string) => {
    deleteGoalMutation(goalId);
    setIsDeleteModalOpen(false);
    toast.success('목표가 삭제되었습니다.');
  };

  useEffect(() => {
    if (isSuccess && getCurrentWeightInfo) {
      setRecordWeightParam((prevState) => ({
        ...prevState,
        startWeight: getCurrentWeightInfo.currentWeight,
      }));
    }
  }, [getCurrentWeightInfo, isSuccess]);

  /**
   * 첫 몸무게 입력 여부 확인
   * - 현재 체중이 0 또는 undefined 이면 첫 몸무게를 입력하지 않은 것
   * - 예외 유저(78,79, 80, 81)는 무시
   */
  const hasNoInitialWeight =
    getCurrentWeightInfo.currentWeight === 0 ||
    getCurrentWeightInfo.currentWeight === undefined;

  const isExceptionUser =
    user?.id !== undefined && EXCEPTION_USER_IDS.includes(Number(user.id));

  /* 가이드 표시: 초기 체중이 없고 && 예외 유저가 아닌 경우 */
  const shouldShowSetupGuide = hasNoInitialWeight && !isExceptionUser;

  /* 목표 생성 버튼 비활성화: 초기 체중이 없고 && 예외 유저가 아닌 경우 */
  const isGoalCreationDisabled = hasNoInitialWeight && !isExceptionUser;

  return (
    <div className="goals-page">
      {shouldShowSetupGuide ? (
        <GoalSetupGuide />
      ) : (
        <>
          <GoalSetting
            onClickRecord={handleRecordWeight}
            onChangeParam={handleRecordGoalsParam}
            param={recordWeightParam}
            presetDuration={presetDuration}
            currentWeight={getCurrentWeightInfo.currentWeight}
            goalList={goalList}
            handleGetDaysRemaining={handleGetDaysRemaining}
            handleDeleteGoalModal={handleDeleteGoalModal}
            isPending={isPendingForRecord}
            isGoalCreationDisabled={isGoalCreationDisabled}
          />

          {/* 목표 삭제 확인 다이얼로그 */}
          {deleteGoalId && (
            <GoalsDeleteDialog
              deleteGoalId={deleteGoalId}
              isDeleteModalOpen={isDeleteModalOpen}
              onClickCloseDelete={cancelDeleteGoal}
              goalList={goalList}
              handleGoalDelete={handleGoalDelete}
              isPending={isPendingForDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default GoalsPage;
