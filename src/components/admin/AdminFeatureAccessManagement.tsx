import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api/Api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { Switch } from '../ui/switch.tsx';
import { Badge } from '../ui/badge.tsx';
import toast from 'react-hot-toast';

/**
 * S6-2 — 기능별 접근 제어 관리 (어드민).
 *
 *  - enabled: 기능 전체 ON/OFF (AI/베타 긴급 차단)
 *  - loginRequired: 로그인 필수 여부
 *
 * featureKey 1행 = 1 기능. Initializer가 기본 8건 시딩 (AI_ANALYSIS, LEADERBOARD, ACCOUNT_LINK_TOSS 등).
 */

interface FeatureAccessRow {
  id: number;
  featureKey: string;
  enabled: boolean;
  loginRequired: boolean;
  description: string | null;
}

const AdminFeatureAccessManagement = () => {
  const queryClient = useQueryClient();

  const { data: configs, isLoading } = useQuery<FeatureAccessRow[]>({
    queryKey: ['adminFeatureAccess'],
    queryFn: async () => {
      const res = await api.get<FeatureAccessRow[]>(
        '/admin/config/feature-access'
      );
      return res.data;
    },
  });

  const { mutate: updateConfig } = useMutation({
    mutationFn: async ({
      key,
      enabled,
      loginRequired,
    }: {
      key: string;
      enabled: boolean;
      loginRequired: boolean;
    }) => {
      await api.put(`/admin/config/feature-access/${key}`, {
        enabled,
        loginRequired,
      });
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.key} 설정 변경 완료`);
      queryClient.invalidateQueries({ queryKey: ['adminFeatureAccess'] });
      queryClient.invalidateQueries({ queryKey: ['featureAccessConfig'] });
    },
    onError: () => {
      toast.error('설정 변경에 실패했어요');
    },
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">로딩 중...</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>기능 접근 제어</CardTitle>
          <p className="text-sm text-muted-foreground">
            AI/베타 기능 ON/OFF + 기능별 로그인 요구 토글. 배포 없이 즉시 반영.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {configs?.map((config) => (
              <div
                key={config.featureKey}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{config.featureKey}</h3>
                    <Badge variant={config.enabled ? 'default' : 'secondary'}>
                      {config.enabled ? '활성' : '비활성'}
                    </Badge>
                    {config.loginRequired && (
                      <Badge className="bg-blue-500">로그인 필수</Badge>
                    )}
                  </div>
                  {config.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <span>활성</span>
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(checked) =>
                        updateConfig({
                          key: config.featureKey,
                          enabled: checked,
                          loginRequired: config.loginRequired,
                        })
                      }
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <span>로그인 필수</span>
                    <Switch
                      checked={config.loginRequired}
                      onCheckedChange={(checked) =>
                        updateConfig({
                          key: config.featureKey,
                          enabled: config.enabled,
                          loginRequired: checked,
                        })
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFeatureAccessManagement;
