import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '../ui/badge';
import { adminApi } from '../../services/api/admin.api';

interface AiFeatureConfig {
  id: number;
  featureType: string;
  enabled: boolean;
  description: string;
}

const FEATURE_LABELS: Record<string, { name: string; desc: string }> = {
  RUNNING: {
    name: '달리기 AI 분석',
    desc: '달리기 기록을 AI가 분석하여 현황 평가, 추세 분석, 개선 제안을 제공합니다. Haiku + Sonnet 두 모델을 병렬로 실행합니다.',
  },
  FASTING: {
    name: '간헐적 단식 AI 분석',
    desc: '단식 기록을 AI가 분석하여 달성률, 패턴 분석, 모드 추천, 개선 제안을 제공합니다. Haiku + Sonnet 두 모델을 병렬로 실행합니다.',
  },
};

const AdminAiManagement = () => {
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading } = useQuery<AiFeatureConfig[]>({
    queryKey: ['adminAiConfigs'],
    queryFn: async () => (await adminApi.getAiFeatureConfigs()).data,
  });

  const handleToggle = async (config: AiFeatureConfig) => {
    try {
      await adminApi.updateAiFeatureConfig(config.id, { enabled: !config.enabled });
      await queryClient.refetchQueries({ queryKey: ['adminAiConfigs'] });
    } catch (err) {
      console.error('AI 설정 업데이트 실패:', err);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-lg font-bold">AI 기능 관리</h2>
        <p className="text-sm text-gray-500 mt-1">
          AI 분석 기능의 활성화/비활성화를 관리합니다. 활성화 시 Anthropic API 호출 비용이 발생합니다.
        </p>
      </div>

      {/* 비용 안내 */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm font-medium text-yellow-800">비용 참고</p>
        <ul className="text-xs text-yellow-700 mt-1 space-y-1">
          <li>Haiku: ~$0.001/요청 · Sonnet: ~$0.01/요청</li>
          <li>사용자당 신규 기록 추가 시에만 호출 (캐싱 적용)</li>
          <li>두 모델 합산 월 ~$0.33/사용자 (일 1회 기록 기준)</li>
        </ul>
      </div>

      {/* 기능별 토글 카드 */}
      <div className="space-y-4">
        {configs.map((config) => {
          const meta = FEATURE_LABELS[config.featureType] ?? {
            name: config.featureType,
            desc: config.description,
          };

          return (
            <div
              key={config.id}
              className="rounded-lg border p-4"
              style={{
                borderColor: config.enabled ? '#3b82f6' : '#e5e7eb',
                backgroundColor: config.enabled ? '#eff6ff' : '#fff',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{meta.name}</span>
                    <Badge
                      className={`cursor-pointer ${
                        config.enabled
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-400 text-white hover:bg-gray-500'
                      }`}
                      onClick={() => handleToggle(config)}
                    >
                      {config.enabled ? '활성' : '비활성'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{meta.desc}</p>
                </div>

                {/* 토글 스위치 */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.enabled}
                  onClick={() => handleToggle(config)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {configs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          AI 기능 설정이 없습니다. 서버를 확인해주세요.
        </div>
      )}
    </div>
  );
};

export default AdminAiManagement;
