import { useQuery } from '@tanstack/react-query';
import Dashboard from '../components/dashboard/Dashboard';
import type { GetGoalListResponse } from '../types/Goals.api.type';
import type {
  GetWeightListResponse,
  WeightResponseDto,
  WeightEntry,
} from '../types/WeightTracker.api.type';
import { goalsInitializer } from '../types/Goal.initializer';
import { api } from '../services/api/Api';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

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

  /* 체중 기록 목록 조회 api */
  const { data: weightData } = useQuery({
    queryKey: ['weightEntries', user?.id],
    queryFn: async (): Promise<{
      entries: WeightEntry[];
      currentWeight: number;
      totalChange: number;
      recordedDays: number;
    }> => {
      if (!user?.id)
        return {
          entries: [],
          currentWeight: 0,
          totalChange: 0,
          recordedDays: 0,
        };

      try {
        const response = await api.get('/weight/getWeightList');
        const data: GetWeightListResponse = response.data;

        // 날짜순으로 정렬 (오래된 것부터)
        const sortedRecords = data.dailyWeightRecords.sort((a, b) =>
          a.recordDate.localeCompare(b.recordDate)
        );

        // 백엔드 DTO를 UI용 WeightEntry로 변환하면서 전일 대비 변화량 계산
        const convertedEntries: WeightEntry[] = sortedRecords.map(
          (record: WeightResponseDto, index: number) => {
            // 전일 대비 변화량 계산 (첫 번째 기록은 변화량 0)
            const previousRecord = index > 0 ? sortedRecords[index - 1] : null;
            const change = previousRecord
              ? record.recordWeight - previousRecord.recordWeight
              : 0;

            return {
              id: `${record.recordDate}_${index}`,
              userId: user.id,
              date: record.recordDate.split('T')[0], // "2025-08-25T15:37:26" → "2025-08-25"
              weight: record.recordWeight,
              change: Number(change.toFixed(1)), // 소수점 1자리로 반올림
              createdAt: record.recordDate,
              updatedAt: record.recordDate,
            };
          }
        );

        const result = {
          entries: convertedEntries,
          currentWeight: data.currentWeight, // 85.9
          totalChange: Number(data.totalWeightChange.toFixed(1)), // -3.1 (반올림)
          recordedDays: data.recordedDays, // 3
        };
        return result;
      } catch (error) {
        console.warn('getWeightList API not available:', error);
        return {
          entries: [],
          currentWeight: 0,
          totalChange: 0,
          recordedDays: 0,
        };
      }
    },
    enabled: !!user?.id,
  });

  return (
    <Dashboard
      entries={weightData?.entries || []}
      goals={goalList} // TODO: 목표 API 연동 후 실제 데이터로 교체
      goalList={goalList}
      refetchGoalList={refetchGoalList}
      weightStats={{
        currentWeight: weightData?.currentWeight || 0,
        totalChange: weightData?.totalChange || 0,
        recordedDays: weightData?.recordedDays || 0,
      }}
    />
  );
};

export default DashboardPage;
