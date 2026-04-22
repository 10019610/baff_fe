import { useQuery } from '@tanstack/react-query';
import {
  configApi,
  type FeatureAccessConfig,
} from '../services/api/Config.api';

/**
 * S6-2 — 기능별 접근 제어 설정 조회 훅 (나만그래 패턴).
 *
 * 앱 시작 시 한번 fetch → 5분 캐싱.
 * config 미로드 / 키 없음 시 fail-open: enabled=true, loginRequired=false.
 */
export const useFeatureAccess = () => {
  const { data: featureConfig } = useQuery<FeatureAccessConfig>({
    queryKey: ['featureAccessConfig'],
    queryFn: () => configApi.getFeatureAccess(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const isEnabled = (featureKey: string): boolean => {
    return featureConfig?.[featureKey]?.enabled ?? true;
  };

  const isLoginRequired = (featureKey: string): boolean => {
    return featureConfig?.[featureKey]?.loginRequired ?? false;
  };

  return { featureConfig, isEnabled, isLoginRequired };
};
