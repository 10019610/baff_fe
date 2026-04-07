import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { adminApi } from '../../services/api/admin.api';
import { Send, Play } from 'lucide-react';

interface SmartPushConfig {
  id: number;
  pushType: string;
  enabled: boolean;
  title: string;
  body: string;
  deepLink: string;
  thresholdDays: number | null;
  cronExpression: string | null;
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

const DEFAULT_CONFIGS = [
  {
    pushType: 'EXCHANGE_REMINDER',
    title: '꺼낼 수 있는 그램이 있어요!',
    body: '모은 그램을 토스포인트로 바꿔보세요.',
    deepLink: '/profile',
    thresholdDays: 7,
  },
  {
    pushType: 'ATTENDANCE_REMINDER',
    title: '오늘 출석체크 아직 안 하셨어요!',
    body: '매일 출석하고 그램 받으세요.',
    deepLink: '/profile',
    thresholdDays: null,
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
    queryFn: () => adminApi.getSmartPushHistory({ page: 0, size: 20 }).then((res) => res.data),
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: ({ pushType, data }: { pushType: string; data: Partial<SmartPushConfig> }) =>
      adminApi.updateSmartPushConfig(pushType, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSmartPushConfigs'] });
      setEditingType(null);
    },
  });

  const triggerMutation = useMutation({
    mutationFn: (pushType: string) => adminApi.triggerSmartPush(pushType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSmartPushHistory'] });
      alert('스마트발송이 실행되었습니다.');
    },
  });

  const getConfig = (pushType: string) => configs.find((c) => c.pushType === pushType);

  const handleEdit = (pushType: string) => {
    const existing = getConfig(pushType);
    const defaults = DEFAULT_CONFIGS.find((d) => d.pushType === pushType);
    setEditForm({
      enabled: existing?.enabled ?? false,
      title: existing?.title ?? defaults?.title ?? '',
      body: existing?.body ?? defaults?.body ?? '',
      deepLink: existing?.deepLink ?? defaults?.deepLink ?? '',
      thresholdDays: existing?.thresholdDays ?? defaults?.thresholdDays ?? null,
    });
    setEditingType(pushType);
  };

  const handleSave = () => {
    if (!editingType) return;
    updateMutation.mutate({ pushType: editingType, data: editForm });
  };

  return (
    <div className="space-y-6">
      {/* 발송 지점 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            스마트발송 설정
          </CardTitle>
          <CardDescription>토스 미니앱 사용자에게 푸시 알림을 보내는 설정입니다. 토스 스마트발송 API 연동 후 활성화됩니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : (
            <div className="space-y-4">
              {DEFAULT_CONFIGS.map(({ pushType }) => {
                const config = getConfig(pushType);
                const isEditing = editingType === pushType;

                return (
                  <div key={pushType} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{PUSH_TYPE_LABELS[pushType]}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${config?.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {config?.enabled ? '활성' : '비활성'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(pushType)}>
                          설정
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => triggerMutation.mutate(pushType)}
                          disabled={triggerMutation.isPending}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          수동 실행
                        </Button>
                      </div>
                    </div>

                    {config && (
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>제목: {config.title || '(미설정)'}</div>
                        <div>딥링크: {config.deepLink || '(미설정)'}</div>
                        {config.thresholdDays && <div>기준일: {config.thresholdDays}일</div>}
                      </div>
                    )}

                    {isEditing && (
                      <div className="mt-4 p-3 bg-gray-50 rounded space-y-3">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">활성화</label>
                          <input
                            type="checkbox"
                            checked={editForm.enabled ?? false}
                            onChange={(e) => setEditForm({ ...editForm, enabled: e.target.checked })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">제목</label>
                          <input
                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                            value={editForm.title ?? ''}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">본문</label>
                          <textarea
                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                            rows={2}
                            value={editForm.body ?? ''}
                            onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">딥링크</label>
                          <input
                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                            value={editForm.deepLink ?? ''}
                            onChange={(e) => setEditForm({ ...editForm, deepLink: e.target.value })}
                          />
                        </div>
                        {pushType === 'EXCHANGE_REMINDER' && (
                          <div>
                            <label className="text-sm font-medium">기준일 (일)</label>
                            <input
                              type="number"
                              className="mt-1 w-full rounded border px-3 py-2 text-sm"
                              value={editForm.thresholdDays ?? 7}
                              onChange={(e) => setEditForm({ ...editForm, thresholdDays: Number(e.target.value) })}
                              min={1}
                            />
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingType(null)}>취소</Button>
                          <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
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
            <div className="text-center py-8 text-muted-foreground">발송 이력이 없습니다</div>
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
                    <td className="py-2">{PUSH_TYPE_LABELS[h.pushType] ?? h.pushType}</td>
                    <td className="py-2">{h.userId}</td>
                    <td className="py-2">{h.success ? '✓' : '✗'}</td>
                    <td className="py-2 truncate max-w-[200px]">{h.apiResponse}</td>
                    <td className="py-2">{new Date(h.regDateTime).toLocaleString('ko')}</td>
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
