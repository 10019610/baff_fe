import WeightTracker from '../components/weightTracker/WeightTracker';

import type {
  RecordWeightRequest,
  GetWeightListResponse,
  WeightResponseDto,
  WeightEntry,
} from '../types/WeightTracker.api.type';
import { useState } from 'react';
import { weightTrackerInitializer } from '../types/WeightTracker.initializer';
import { api } from '../services/api/Api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * 체중 기록 페이지
 */
const WeightTrackerPage = () => {
  const { user } = useAuth();

  // 체중 기록 저장 state
  const [recordWeightParam, setRecordWeightParam] =
    useState<RecordWeightRequest>({
      ...weightTrackerInitializer.INITIAL_RECORD_WEIGHT_PARAM,
      recordDate: new Date().toISOString().split('T')[0],
    });

  /* 
    체중 기록 api
  */
  const { mutate: recordWeightMutation, isPending: isSubmitting } = useMutation(
    {
      mutationFn: async (param: RecordWeightRequest) => {
        try {
          const response = await api.post('/weight/recordWeight', param);
          return response.data;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          // API가 없는 경우 임시로 성공 처리
          if (
            error.response?.status === 404 ||
            error.code === 'NETWORK_ERROR'
          ) {
            console.warn('recordWeight API not available, simulating success');
            return { success: true, message: 'Mock success' };
          }
          throw error;
        }
      },
      onSuccess: () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateInfo = (window as any).updateInfo;

        if (updateInfo) {
          // 업데이트 토스트 - 변화량 정보 포함
          const change = updateInfo.newWeight - updateInfo.oldWeight;
          const changeText = `${change > 0 ? '+' : ''}${change.toFixed(1)}kg`;

          toast.success(
            `체중 기록이 업데이트되었습니다!\n${updateInfo.oldWeight}kg → ${updateInfo.newWeight}kg (${changeText})`,
            {
              icon: '✏️',
              duration: 4000,
            }
          );

          // 전역 변수 정리
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delete (window as any).updateInfo;
        } else {
          // 새 기록 토스트
          toast.success('체중이 성공적으로 기록되었습니다!', {
            icon: '⚖️',
            duration: 3000,
          });
        }

        // 기록 후 목록 새로고침
        refetchEntries();

        // 체중 입력값 초기화
        setRecordWeightParam((prev) => ({
          ...prev,
          weight: 0,
        }));
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        console.error('Record weight error:', error);
        toast.error(
          `체중 기록 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`,
          {
            icon: '❌',
            duration: 4000,
          }
        );
      },
    }
  );

  // 체중 기록 목록 조회 핸들러 (임시로 비활성화)
  const {
    data: weightEntries,
    isLoading,
    refetch: refetchEntries,
  } = useQuery({
    queryKey: ['weightEntries', user?.id],

    queryFn: async (): Promise<{
      entries: WeightEntry[];
      currentWeight?: number;
      totalChange?: number;
      recordedDays?: number;
    }> => {
      if (!user?.id) return { entries: [] };

      try {
        const response = await api.get('/weight/getWeightList');
        const data: GetWeightListResponse = response.data;

        // 백엔드 DTO를 UI용 WeightEntry로 변환
        const convertedEntries: WeightEntry[] = data.dailyWeightRecords.map(
          (record: WeightResponseDto, index: number) => ({
            id: `${record.recordDate}_${index}`,
            userId: user.id,
            date: record.recordDate.split('T')[0],
            weight: record.recordWeight,
            change: record.weightChange,
            createdAt: record.recordDate,
            updatedAt: record.recordDate,
          })
        );

        return {
          entries: convertedEntries,
          currentWeight: data.currentWeight,
          totalChange: data.totalWeightChange,
          recordedDays: data.recordedDays,
        };
      } catch (error) {
        console.warn('getWeightList API not available:', error);
        return { entries: [] };
      }
    },
    enabled: !!user?.id,
  });

  const handleRecordWeight = () => {
    if (!recordWeightParam.weight || !recordWeightParam.recordDate) {
      toast.error('체중과 날짜를 모두 입력해주세요', {
        icon: '⚠️',
        duration: 3000,
      });
      return;
    }

    // 기존 기록이 있는지 확인
    const existingEntry = weightEntries?.entries.find(
      (entry) => entry.date === recordWeightParam.recordDate
    );
    const isUpdate = !!existingEntry;
    const oldWeight = existingEntry?.weight;

    // 날짜를 DateTime 형식으로 변환 (현재 시간 사용)
    const now = new Date();
    const dateTimeParam = {
      ...recordWeightParam,
      recordDate: `${recordWeightParam.recordDate}T${now.toTimeString().slice(0, 8)}`, // 현재 시간으로 설정
    };

    console.log('handleRecordWeight', dateTimeParam, 'isUpdate:', isUpdate);

    // 상태를 저장해서 mutation 성공 시 사용
    if (isUpdate && oldWeight) {
      // 업데이트 정보를 전역 변수나 state에 저장
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).updateInfo = {
        oldWeight,
        newWeight: recordWeightParam.weight,
      };
    }

    recordWeightMutation(dateTimeParam);
  };

  /* 
    체중 기록 파라미터 변경 핸들러
  */
  const handleRecordWeightParam = (
    key: keyof RecordWeightRequest,
    value: string | number
  ) => {
    console.log('handleRecordWeightParam', key, value);
    setRecordWeightParam((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  return (
    <div className="tracker-page">
      <WeightTracker
        onClickRecord={handleRecordWeight}
        onChangeParam={handleRecordWeightParam}
        param={recordWeightParam}
        entries={weightEntries?.entries || []}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        currentWeight={weightEntries?.currentWeight}
        totalChange={weightEntries?.totalChange}
        recordedDays={weightEntries?.recordedDays}
      />
    </div>
  );
};

export default WeightTrackerPage;
