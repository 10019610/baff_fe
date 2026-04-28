import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card.tsx';
import { Input } from '../../ui/input.tsx';
import { Label } from '../../ui/label.tsx';
import { Button } from '../../ui/button.tsx';
import { Badge } from '../../ui/badge.tsx';
import { Textarea } from '../../ui/textarea.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog.tsx';
import { api } from '../../../services/api/Api.ts';
import type {
  AdMetricDailyEntry,
  AdMetricDailyRequest,
} from '../../../types/AdMetric.api.type.ts';
import {
  getSampleTag,
  getYesterday,
  isAfterDPlus7,
} from '../../../utils/AdMetricUtil.ts';

/**
 * 탭 ② 데이터 입력 — A 항목 13종 + 일자 선택 + D+7 사유 모달.
 *
 * spec v0.3 §4-1 A 정본 + §4-2 폼 동작 룰.
 */

type FormState = Omit<AdMetricDailyRequest, 'metricDate'>;

const EMPTY_FORM: FormState = {
  tossRevenueR: null,
  tossRevenueF: null,
  tossRevenueBTotal: null,
  tossRevenueI: null,
  ecpmRReported: null,
  ecpmFReported: null,
  ecpmBTotalReported: null,
  ecpmIReported: null,
  impressionRReported: null,
  impressionFReported: null,
  impressionBTotal: null,
  impressionI: null,
  newInflowToss: null,
  avgSessionSec: null,
  benefitsTabInflow: null,
};

const FIELD_GROUPS: {
  group: string;
  fields: {
    key: keyof FormState;
    label: string;
    unit: string;
    hint?: string;
  }[];
}[] = [
  {
    group: '토스 수익 (콘솔 reported)',
    fields: [
      { key: 'tossRevenueR', label: 'R 수익', unit: '원' },
      { key: 'tossRevenueF', label: 'F 수익', unit: '원' },
      { key: 'tossRevenueBTotal', label: 'B 합산 수익', unit: '원' },
      { key: 'tossRevenueI', label: 'I 수익', unit: '원' },
    ],
  },
  {
    group: 'eCPM (콘솔 reported)',
    fields: [
      { key: 'ecpmRReported', label: 'R-eCPM', unit: '원' },
      { key: 'ecpmFReported', label: 'F-eCPM', unit: '원' },
      { key: 'ecpmBTotalReported', label: 'B-eCPM 합산', unit: '원' },
      { key: 'ecpmIReported', label: 'I-eCPM', unit: '원' },
    ],
  },
  {
    group: '노출',
    fields: [
      {
        key: 'impressionRReported',
        label: 'R 노출 (검증용)',
        unit: '건',
        hint: 'truth는 DB observed (자동 집계)',
      },
      {
        key: 'impressionFReported',
        label: 'F 노출 (검증용)',
        unit: '건',
        hint: 'truth는 DB observed (자동 집계)',
      },
      { key: 'impressionBTotal', label: 'B 노출 합산 (truth)', unit: '건' },
      { key: 'impressionI', label: 'I 노출 (truth)', unit: '건' },
    ],
  },
  {
    group: '토스 외 자동 미수집',
    fields: [
      { key: 'newInflowToss', label: '신규 유입 (토스 진입)', unit: '명' },
      { key: 'avgSessionSec', label: '체류시간 평균', unit: '초' },
      { key: 'benefitsTabInflow', label: '혜택탭 유입', unit: '명' },
    ],
  },
];

const AdMetricInputSubTab = () => {
  const queryClient = useQueryClient();
  const [date, setDate] = useState<string>(getYesterday());
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [reasonModal, setReasonModal] = useState<{
    open: boolean;
    reason: string;
  }>({
    open: false,
    reason: '',
  });

  // 일자 선택 → 자동 로드
  const { data: existing, isLoading } = useQuery<AdMetricDailyEntry | null>({
    queryKey: ['adMetricDaily', date],
    queryFn: async () => {
      const res = await api.get<AdMetricDailyEntry | null>(
        `/api/admin/ad-metrics/daily`,
        { params: { date } }
      );
      return res.data ?? null;
    },
  });

  useEffect(() => {
    if (existing) {
      const next: FormState = { ...EMPTY_FORM };
      (Object.keys(EMPTY_FORM) as (keyof FormState)[]).forEach((key) => {
        next[key] =
          (existing[key as keyof AdMetricDailyEntry] as number | null) ?? null;
      });
      setForm(next);
    } else {
      setForm(EMPTY_FORM);
    }
  }, [existing]);

  // POST/PUT/PATCH 분기
  const { mutate: save, isPending } = useMutation({
    mutationFn: async (override?: { reason?: string }) => {
      const payload: Record<string, unknown> = { metricDate: date, ...form };

      if (!existing) {
        await api.post('/api/admin/ad-metrics/daily', payload);
        return { mode: 'create' as const };
      }
      if (isAfterDPlus7(date)) {
        await api.patch(`/api/admin/ad-metrics/daily/${date}`, {
          ...payload,
          reason: override?.reason,
        });
        return { mode: 'patch' as const };
      }
      await api.put(`/api/admin/ad-metrics/daily/${date}`, payload);
      return { mode: 'update' as const };
    },
    onSuccess: ({ mode }) => {
      const labels = {
        create: '신규 저장',
        update: '수정',
        patch: 'D+7 이후 수정 (변경 이력 적재)',
      };
      toast.success(`${labels[mode]} 완료`);
      queryClient.invalidateQueries({ queryKey: ['adMetricDaily', date] });
      queryClient.invalidateQueries({ queryKey: ['adMetricKpi'] });
      queryClient.invalidateQueries({ queryKey: ['adMetricDailyTable'] });
      setReasonModal({ open: false, reason: '' });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? '저장 실패';
      toast.error(msg);
    },
  });

  const handleSave = () => {
    if (existing && isAfterDPlus7(date)) {
      setReasonModal({ open: true, reason: '' });
      return;
    }
    save(undefined);
  };

  const handlePatchConfirm = () => {
    if (!reasonModal.reason.trim()) {
      toast.error('수정 사유는 필수입니다');
      return;
    }
    save({ reason: reasonModal.reason });
  };

  const setField = (key: keyof FormState, raw: string) => {
    if (raw === '') {
      setForm({ ...form, [key]: null });
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) return;
    setForm({ ...form, [key]: num });
  };

  return (
    <div className="space-y-4">
      {/* 일자 선택 + 모드 표시 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            데이터 입력 일자
            <Badge variant="outline">[표본: {getSampleTag(date)}]</Badge>
            {existing && isAfterDPlus7(date) && (
              <Badge className="bg-amber-500">
                D+7 이후 — 수정 시 사유 필수
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-48"
          />
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? '로딩 중…'
              : existing
                ? '기존 입력값 자동 로드됨'
                : '신규 모드'}
          </span>
        </CardContent>
      </Card>

      {/* 폼 그룹 */}
      {FIELD_GROUPS.map(({ group, fields }) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle className="text-base">{group}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {fields.map(({ key, label, unit, hint }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-sm">
                    {label}
                    <span className="text-muted-foreground ml-1">({unit})</span>
                  </Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={form[key] === null ? '' : String(form[key])}
                    onChange={(e) => setField(key, e.target.value)}
                    placeholder={
                      existing
                        ? '미입력 = NULL 유지'
                        : '0과 미입력 구분: 빈칸 = NULL'
                    }
                  />
                  {hint && (
                    <p className="text-xs text-muted-foreground">{hint}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* 저장 버튼 */}
      <div className="flex justify-end gap-2">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? '저장 중…' : existing ? '수정 저장' : '신규 저장'}
        </Button>
      </div>

      {/* D+7 이후 수정 사유 모달 */}
      <Dialog
        open={reasonModal.open}
        onOpenChange={(open) => setReasonModal({ ...reasonModal, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>D+7 이후 수정 — 사유 입력</DialogTitle>
            <DialogDescription>
              {date} 데이터는 metric_date 기준 D+7이 지난 일자입니다. 수정 시
              변경 이력이 적재되며, 사유는 필수 입력입니다.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reasonModal.reason}
            onChange={(e) =>
              setReasonModal({ ...reasonModal, reason: e.target.value })
            }
            placeholder="예: 토스 콘솔 재산정으로 reported 값 갱신"
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReasonModal({ open: false, reason: '' })}
            >
              취소
            </Button>
            <Button onClick={handlePatchConfirm} disabled={isPending}>
              {isPending ? '저장 중…' : '수정 + 이력 적재'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdMetricInputSubTab;
