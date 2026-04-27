import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api/admin.api.ts';

interface SelfBanner {
  id: number;
  bannerType: string;
  position: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  enabled: boolean;
  priority: number;
  dailyImpressionLimit: number | null;
}

const ALL_POSITIONS = [
  'HOME_TOP',
  'WEIGHT_TAB_TOP',
  'ANALYSIS_TAB_TOP',
  'REVIEW_TAB_TOP',
  'ATTENDANCE',
  'BENEFIT_TOP',
  'BENEFIT',
  'FASTING_BOTTOM',
  'ATTENDANCE_RESULT',
  'EXCHANGE_RESULT',
  'WEIGHT_RESULT',
  'MISSION_RESULT',
  'FASTING_RESULT',
];

const AdminSelfBannerManagement = () => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    bannerType: 'NOTICE',
    position: 'HOME_TOP',
    title: '',
    imageUrl: '',
    linkUrl: '',
    priority: 100,
    dailyImpressionLimit: 0,
  });

  const { data, isLoading, isError } = useQuery<SelfBanner[]>({
    queryKey: ['admin-self-banners'],
    queryFn: () => adminApi.getSelfBanners().then((res) => res.data),
  });
  const list = data ?? [];

  const submit = async () => {
    try {
      await adminApi.createSelfBanner({
        bannerType: form.bannerType,
        position: form.position,
        title: form.title,
        imageUrl: form.imageUrl,
        linkUrl: form.linkUrl,
        priority: form.priority,
        ...(form.dailyImpressionLimit > 0
          ? { dailyImpressionLimit: form.dailyImpressionLimit }
          : {}),
      });
      qc.invalidateQueries({ queryKey: ['admin-self-banners'] });
      setShowForm(false);
      setForm({
        bannerType: 'NOTICE',
        position: 'HOME_TOP',
        title: '',
        imageUrl: '',
        linkUrl: '',
        priority: 100,
        dailyImpressionLimit: 0,
      });
    } catch {
      alert('등록 실패');
    }
  };

  const toggle = async (b: SelfBanner) => {
    try {
      await adminApi.updateSelfBanner(b.id, { enabled: !b.enabled });
      qc.invalidateQueries({ queryKey: ['admin-self-banners'] });
    } catch {
      alert('상태 변경 실패');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('삭제할까요?')) return;
    try {
      await adminApi.deleteSelfBanner(id);
      qc.invalidateQueries({ queryKey: ['admin-self-banners'] });
    } catch {
      alert('삭제 실패');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>자체 배너광고 (공지/외부앱)</CardTitle>
            <CardDescription>
              토스 광고 미수신 시 fallback 노출. 위치별 enabled 항목 중 priority
              오름차순.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? '취소' : '+ 추가'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="space-y-3 p-4 border rounded mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">유형</label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={form.bannerType}
                  onChange={(e) =>
                    setForm({ ...form, bannerType: e.target.value })
                  }
                >
                  <option value="NOTICE">공지사항</option>
                  <option value="EXTERNAL_APP">외부 앱</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">노출 위치</label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                >
                  {ALL_POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">제목</label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="예: 새 공지사항 / 나만그래 앱 추천"
              />
            </div>
            <div>
              <label className="text-sm font-medium">이미지 URL</label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">링크 URL</label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="/notice/123 또는 intoss://onlyme 등"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">
                  우선순위 (낮을수록 먼저)
                </label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  유저당 1일 노출 상한 (0 = 무제한)
                </label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={form.dailyImpressionLimit}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dailyImpressionLimit: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={submit}>
                저장
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            로딩 중...
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-destructive">불러오기 실패</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>유형</TableHead>
                <TableHead>위치</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>링크</TableHead>
                <TableHead>우선순위</TableHead>
                <TableHead>일일 상한</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>삭제</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {b.bannerType === 'NOTICE' ? '공지' : '외부앱'}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {b.position}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {b.title}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                    {b.linkUrl}
                  </TableCell>
                  <TableCell>{b.priority}</TableCell>
                  <TableCell>{b.dailyImpressionLimit ?? '무제한'}</TableCell>
                  <TableCell>
                    <Badge
                      className={`cursor-pointer ${b.enabled ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}
                      onClick={() => toggle(b)}
                    >
                      {b.enabled ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => remove(b.id)}
                    >
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    등록된 자체 배너가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSelfBannerManagement;
