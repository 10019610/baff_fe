import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { adminApi } from '../../services/api/admin.api';
import { Send, Play } from 'lucide-react';

type SmartPushTargetStrategy =
  | 'ALL_TOSS_USERS'
  | 'ACTIVE_LAST_7_DAYS_NOT_ATTENDED'
  | 'BALANCE_OVER_100G';

interface SmartPushConfig {
  id: number;
  pushType: string;
  enabled: boolean;
  title: string;
  body: string;
  deepLink: string;
  thresholdDays: number | null;
  cronExpression: string | null;
  templateCode: string | null;
  targetStrategy: SmartPushTargetStrategy;
}

interface SmartPushHistory {
  id: number;
  userId: number;
  pushType: string;
  apiResponse: string;
  success: boolean;
  regDateTime: string;
}

const PUSH_TYPE_LABELS: Record<string, string> = {
  EXCHANGE_REMINDER: '환전 알림',
  ATTENDANCE_REMINDER: '출석 알림',
};

const STRATEGY_LABELS: Record<SmartPushTargetStrategy, string> = {
  ALL_TOSS_USERS: '토스 유저 전체',
  ACTIVE_LAST_7_DAYS_NOT_ATTENDED: '최근 7일 활동 + 오늘 미출석',
  BALANCE_OVER_100G: '100g 이상 보유',
};

const DEFAULT_CONFIGS: Array<{
  pushType: string;
  title: string;
  body: string;
  deepLink: string;
  thresholdDays: number | null;
  targetStrategy: SmartPushTargetStrategy;
}> = [
  {
    pushType: 'EXCHANGE_REMINDER',
    title: '꺼낼 수 있는 그램이 있어요!',
    body: '모은 그램을 토스포인트로 바꿔보세요.',
    deepLink: '/profile',
    thresholdDays: 7,
    targetStrategy: 'BALANCE_OVER_100G',
  },
  {
    pushType: 'ATTENDANCE_REMINDER',
    title: '오늘 출석체크 아직 안 하셨어요!',
    body: '매일 출석하고 그램 받으세요.',
    deepLink: '/profile',
    thresholdDays: null,
    targetStrategy: 'ACTIVE_LAST_7_DAYS_NOT_ATTENDED',
  },
];

export const AdminSmartPushManagement = () => {
  const queryClient = useQueryClient();
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SmartPushConfig>>({});

  const { data: configs = [], isLoading } = useQuery<SmartPushConfig[]>({
    queryKey: ['adminSmartPushConfigs'],
    queryFn: () => adminApi.getSmartPushConfigs().then((res) => res.data),
    retry: 1,
  });

  const { data: historyData } = useQuery<{ content: SmartPushHistory[] }>({
    queryKey: ['adminSmartPushHistory'],
    queryFn: () =>
      adminApi
        .getSmartPushHistory({ page: 0, size: 20 })
        .then((res) => res.data),
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      pushType,
      data,
    }: {
      pushType: string;
      data: Partial<SmartPushConfig>;
    }) => adminApi.updateSmartPushConfig(pushType, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSmartPushConfigs'] });
      setEditingType(null);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? '저장에 실패했습니다.';
      alert(msg);
    },
  });

  const triggerMutation = useMutation({
    mutationFn: (pushType: string) => adminApi.triggerSmartPush(pushType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSmartPushHistory'] });
      alert('스마트발송이 실행되었습니다.');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? '실행에 실패했습니다.';
      alert(msg);
    },
  });

  const getConfig = (pushType: string) =>
    configs.find((c) => c.pushType === pushType);

  const handleEdit = (pushType: string) => {
    const existing = getConfig(pushType);
    const defaults = DEFAULT_CONFIGS.find((d) => d.pushType === pushType);
    setEditForm({
      enabled: existing?.enabled ?? false,
      title: existing?.title ?? defaults?.title ?? '',
      body: existing?.body ?? defaults?.body ?? '',
      deepLink: existing?.deepLink ?? defaults?.deepLink ?? '',
      thresholdDays: existing?.thresholdDays ?? defaults?.thresholdDays ?? null,
      templateCode: existing?.templateCode ?? '',
      targetStrategy:
        existing?.targetStrategy ??
        defaults?.targetStrategy ??
        'ALL_TOSS_USERS',
    });
    setEditingType(pushType);
  };

  const handleSave = () => {
    if (!editingType) return;
    updateMutation.mutate({ pushType: editingType, data: editForm });
  };

  const isTemplateCodeBlank =
    !editForm.templateCode || editForm.templateCode.trim() === '';
  const cannotEnable = (editForm.enabled ?? false) && isTemplateCodeBlank;

  return (
    <div className="space-y-6">
      {/* 발송 지점 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            스마트발송 설정
          </CardTitle>
          <CardDescription>
            토스 미니앱 사용자에게 기능성 푸시를 발송합니다. 토스 콘솔에서 검수
            완료된 템플릿 코드를 입력한 뒤 활성화해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              로딩 중...
            </div>
          ) : (
            <div className="space-y-4">
              {DEFAULT_CONFIGS.map(({ pushType }) => {
                const config = getConfig(pushType);
                const isEditing = editingType === pushType;
                const triggerDisabled =
                  !config?.templateCode ||
                  !config?.enabled ||
                  triggerMutation.isPending;

                return (
                  <div key={pushType} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {PUSH_TYPE_LABELS[pushType]}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            config?.enabled
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {config?.enabled ? '활성' : '비활성'}
                        </span>
                        {config && !config.templateCode && (
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                            템플릿 코드 미입력
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(pushType)}
                        >
                          설정
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => triggerMutation.mutate(pushType)}
                          disabled={triggerDisabled}
                          title={
                            !config?.templateCode
                              ? '템플릿 코드를 먼저 입력해주세요'
                              : !config?.enabled
                                ? '먼저 활성화해주세요'
                                : ''
                          }
                        >
                          <Play className="h-3 w-3 mr-1" />
                          수동 실행
                        </Button>
                      </div>
                    </div>

                    {config && (
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>
                          템플릿 코드: {config.templateCode || '(미입력)'}
                        </div>
                        <div>
                          발송 대상:{' '}
                          {STRATEGY_LABELS[config.targetStrategy] ??
                            config.targetStrategy}
                        </div>
                        <div>제목: {config.title || '(미설정)'}</div>
                        <div>딥링크: {config.deepLink || '(미설정)'}</div>
                        {config.thresholdDays != null &&
                          config.targetStrategy === 'BALANCE_OVER_100G' && (
                            <div>기준일: {config.thresholdDays}일</div>
                          )}
                      </div>
                    )}

                    {isEditing && (
                      <div className="mt-4 p-3 bg-gray-50 rounded space-y-3">
                        <div>
                          <label className="text-sm font-medium">
                            템플릿 코드 *
                          </label>
                          <input
                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                            value={editForm.templateCode ?? ''}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                templateCode: e.target.value,
                              })
                            }
                            placeholder="예: changeup-attendance-reminder"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            토스 콘솔에서 검수 완료된 템플릿 코드를 입력하세요.
                            비어 있으면 활성화할 수 없습니다.
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            발송 대상
                          </label>
                          <select
                            className="mt-1 w-full rounded border px-3 py-2 text-sm bg-white"
                            value={editForm.targetStrategy ?? 'ALL_TOSS_USERS'}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                targetStrategy: e.target
                                  .value as SmartPushTargetStrategy,
                              })
                            }
                          >
                            <option value="ALL_TOSS_USERS">
                              {STRATEGY_LABELS.ALL_TOSS_USERS}
                            </option>
                            <option value="ACTIVE_LAST_7_DAYS_NOT_ATTENDED">
                              {STRATEGY_LABELS.ACTIVE_LAST_7_DAYS_NOT_ATTENDED}
                            </option>
                            <option value="BALANCE_OVER_100G">
                              {STRATEGY_LABELS.BALANCE_OVER_100G}
                            </option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">활성화</label>
                          <input
                            type="checkbox"
                            checked={editForm.enabled ?? false}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                enabled: e.target.checked,
                              })
                            }
                          />
                        </div>
                        {cannotEnable && (
                          <div className="text-xs text-red-600">
                            활성화하려면 템플릿 코드를 먼저 입력해주세요.
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium">
                            제목 (참고용)
                          </label>
                          <input
                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                            value={editForm.title ?? ''}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                title: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            본문 (참고용)
                          </label>
                          <textarea
                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                            rows={2}
                            value={editForm.body ?? ''}
                            onChange={(e) =>
                              setEditForm({ ...editForm, body: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">딥링크</label>
                          <input
                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                            value={editForm.deepLink ?? ''}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                deepLink: e.target.value,
                              })
                            }
                          />
                        </div>
                        {editForm.targetStrategy === 'BALANCE_OVER_100G' && (
                          <div>
                            <label className="text-sm font-medium">
                              기준일 (일)
                            </label>
                            <input
                              type="number"
                              className="mt-1 w-full rounded border px-3 py-2 text-sm"
                              value={editForm.thresholdDays ?? 7}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  thresholdDays: Number(e.target.value),
                                })
                              }
                              min={1}
                            />
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingType(null)}
                          >
                            취소
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={updateMutation.isPending || cannotEnable}
                          >
                            {updateMutation.isPending ? '저장 중...' : '저장'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 발송 이력 */}
      <Card>
        <CardHeader>
          <CardTitle>발송 이력</CardTitle>
          <CardDescription>최근 스마트발송 실행 이력</CardDescription>
        </CardHeader>
        <CardContent>
          {!historyData?.content?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              발송 이력이 없습니다
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">타입</th>
                  <th className="text-left py-2">사용자 ID</th>
                  <th className="text-left py-2">성공</th>
                  <th className="text-left py-2">응답</th>
                  <th className="text-left py-2">일시</th>
                </tr>
              </thead>
              <tbody>
                {historyData.content.map((h) => (
                  <tr key={h.id} className="border-b">
                    <td className="py-2">
                      {PUSH_TYPE_LABELS[h.pushType] ?? h.pushType}
                    </td>
                    <td className="py-2">{h.userId}</td>
                    <td className="py-2">{h.success ? '✓' : '✗'}</td>
                    <td className="py-2 truncate max-w-[200px]">
                      {h.apiResponse}
                    </td>
                    <td className="py-2">
                      {new Date(h.regDateTime).toLocaleString('ko')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSmartPushManagement;
