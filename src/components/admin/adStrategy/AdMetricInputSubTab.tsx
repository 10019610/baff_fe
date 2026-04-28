import { useEffect, useMemo, useState } from 'react';
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
  AdMetricDailyBundle,
  AdMetricFullRequest,
  PositionEntry,
  TossAdPositionConfig,
} from '../../../types/AdMetric.api.type.ts';
import {
  getSampleTag,
  getYesterday,
  isAfterDPlus7,
} from '../../../utils/AdMetricUtil.ts';

/**
 * 데이터 입력 — 나만그래 패턴 정합.
 *  · R(리워드) 일별 4축
 *  · F(전면) 일별 4축
 *  · B(배너) 위치별 4축 — AdPositionConfig 활성 위치별 분리, 없으면 합산 모드
 *  · I(이미지배너) 위치별 4축 — 동일
 *
 * 4축 = 노출 / 시청률(%) / eCPM(원) / 수익(원).
 * 신규/전체 유저 + D1 리텐션은 토스 콘솔에서 운영자가 직접 옮김. 체류·혜택탭만 CSV(P2).
 * 활성유저·체중·출석·환전·신규가입은 BE에서 자동 집계 (분석 탭).
 */

const POSITION_LABELS: Record<string, string> = {
  HOME_TOP: '홈(대시보드) 상단',
  WEIGHT_TAB_TOP: '체중 탭 상단',
  ANALYSIS_TAB_TOP: '분석 탭 상단',
  REVIEW_TAB_TOP: '후기 탭 상단',
  BENEFIT_TOP: '혜택 상단',
  BENEFIT: '혜택 카드 사이',
  ATTENDANCE: '출석 달력 하단',
  FASTING_BOTTOM: '간헐적 단식 하단',
  ATTENDANCE_RESULT: '출석 완료 페이지',
  WEIGHT_RESULT: '체중기록 완료 페이지',
  EXCHANGE_RESULT: '꺼내기(환전) 완료 페이지',
  MISSION_RESULT: '미션 완료 페이지',
  FASTING_RESULT: '간헐적 단식 완료 페이지',
};

type DailyKey =
  | 'tossRevenueR'
  | 'tossRevenueF'
  | 'tossRevenueBTotal'
  | 'tossRevenueI'
  | 'ecpmRReported'
  | 'ecpmFReported'
  | 'ecpmBTotalReported'
  | 'ecpmIReported'
  | 'ctrRReported'
  | 'ctrFReported'
  | 'ctrBTotalReported'
  | 'ctrIReported'
  | 'impressionRReported'
  | 'impressionFReported'
  | 'impressionBTotal'
  | 'impressionI'
  | 'newUsersReported'
  | 'totalUsersReported'
  | 'retentionD1New'
  | 'retentionD1Total';

const POSITION_OTHER = 'OTHER';

type DailyForm = Partial<Record<DailyKey, number | null>>;

const EMPTY: DailyForm = {};

const AdMetricInputSubTab = () => {
  const queryClient = useQueryClient();
  const [date, setDate] = useState<string>(getYesterday());
  const [daily, setDaily] = useState<DailyForm>(EMPTY);
  const [banners, setBanners] = useState<PositionEntry[]>([]);
  const [images, setImages] = useState<PositionEntry[]>([]);
  const [reasonModal, setReasonModal] = useState<{
    open: boolean;
    reason: string;
  }>({
    open: false,
    reason: '',
  });

  // 일자 선택 → 자동 로드
  const { data: bundle, isLoading } = useQuery<AdMetricDailyBundle>({
    queryKey: ['adMetricBundle', date],
    queryFn: async () => {
      const res = await api.get<AdMetricDailyBundle>(
        '/api/admin/ad-metrics/daily',
        {
          params: { date },
        }
      );
      return res.data ?? { daily: null, banners: [], images: [] };
    },
  });

  // 활성 위치 (AdPositionConfig)
  const { data: positionConfigs } = useQuery<TossAdPositionConfig[]>({
    queryKey: ['tossAdConfigs'],
    queryFn: async () => {
      const res = await api.get<TossAdPositionConfig[]>(
        '/api/admin/dashboard/toss-ad/configs'
      );
      return res.data;
    },
  });

  const enabledBannerPositions = useMemo(
    () =>
      (positionConfigs ?? [])
        .filter((c) => c.isTossBannerAdEnabled)
        .map((c) => c.position),
    [positionConfigs]
  );

  const enabledImagePositions = useMemo(
    () =>
      (positionConfigs ?? [])
        .filter((c) => c.isTossImageAdEnabled)
        .map((c) => c.position),
    [positionConfigs]
  );

  const bannerAdIdByPosition = useMemo(() => {
    const map: Record<string, string> = {};
    (positionConfigs ?? []).forEach((c) => {
      if (c.tossBannerAdGroupId) map[c.position] = c.tossBannerAdGroupId;
    });
    return map;
  }, [positionConfigs]);

  const imageAdIdByPosition = useMemo(() => {
    const map: Record<string, string> = {};
    (positionConfigs ?? []).forEach((c) => {
      if (c.tossImageAdGroupId) map[c.position] = c.tossImageAdGroupId;
    });
    return map;
  }, [positionConfigs]);

  useEffect(() => {
    if (bundle?.daily) {
      const next: DailyForm = {};
      (
        [
          'tossRevenueR',
          'tossRevenueF',
          'tossRevenueBTotal',
          'tossRevenueI',
          'ecpmRReported',
          'ecpmFReported',
          'ecpmBTotalReported',
          'ecpmIReported',
          'ctrRReported',
          'ctrFReported',
          'ctrBTotalReported',
          'ctrIReported',
          'impressionRReported',
          'impressionFReported',
          'impressionBTotal',
          'impressionI',
          'newUsersReported',
          'totalUsersReported',
          'retentionD1New',
          'retentionD1Total',
        ] as DailyKey[]
      ).forEach((k) => {
        next[k] =
          (bundle.daily as Record<string, number | null> | null)?.[k] ?? null;
      });
      setDaily(next);
    } else {
      setDaily(EMPTY);
    }
    setBanners(bundle?.banners ?? []);
    setImages(bundle?.images ?? []);
  }, [bundle]);

  const setDailyField = (key: DailyKey, raw: string) => {
    if (raw === '') {
      setDaily({ ...daily, [key]: null });
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) return;
    setDaily({ ...daily, [key]: num });
  };

  const upsertPositionNum = (
    list: PositionEntry[],
    setter: (next: PositionEntry[]) => void,
    position: string,
    field: 'impression' | 'ctrReported' | 'ecpmReported' | 'revenue',
    raw: string
  ) => {
    const value = raw === '' ? null : Number(raw);
    if (value !== null && Number.isNaN(value)) return;
    const idx = list.findIndex((p) => p.adPositionCode === position);
    const next = [...list];
    if (idx >= 0) {
      next[idx] = { ...next[idx], [field]: value };
    } else {
      next.push({
        adPositionCode: position,
        impression: null,
        ctrReported: null,
        ecpmReported: null,
        revenue: null,
        [field]: value,
      });
    }
    setter(next);
  };

  const upsertPositionAdId = (
    list: PositionEntry[],
    setter: (next: PositionEntry[]) => void,
    position: string,
    raw: string
  ) => {
    const idx = list.findIndex((p) => p.adPositionCode === position);
    const next = [...list];
    if (idx >= 0) {
      next[idx] = { ...next[idx], adIdSnapshot: raw };
    } else {
      next.push({
        adPositionCode: position,
        impression: null,
        ctrReported: null,
        ecpmReported: null,
        revenue: null,
        adIdSnapshot: raw,
      });
    }
    setter(next);
  };

  const getPositionNumValue = (
    list: PositionEntry[],
    position: string,
    field: 'impression' | 'ctrReported' | 'ecpmReported' | 'revenue'
  ): string => {
    const row = list.find((p) => p.adPositionCode === position);
    const v = row?.[field];
    return v === null || v === undefined ? '' : String(v);
  };

  const getPositionAdId = (list: PositionEntry[], position: string): string => {
    const row = list.find((p) => p.adPositionCode === position);
    return row?.adIdSnapshot ?? '';
  };

  const { mutate: save, isPending } = useMutation({
    mutationFn: async (override?: { reason?: string }) => {
      const payload: AdMetricFullRequest = {
        metricDate: date,
        ...daily,
        banners: banners.length > 0 ? banners : undefined,
        images: images.length > 0 ? images : undefined,
        reason: override?.reason,
      };
      const res = await api.post('/api/admin/ad-metrics/daily', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('저장 완료');
      queryClient.invalidateQueries({ queryKey: ['adMetricBundle', date] });
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
    if (bundle?.daily && isAfterDPlus7(date)) {
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

  return (
    <div className="space-y-4">
      {/* 일자 선택 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            데이터 입력 일자
            <Badge variant="outline">[표본: {getSampleTag(date)}]</Badge>
            {bundle?.daily && isAfterDPlus7(date) && (
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
              : bundle?.daily
                ? '기존 입력값 자동 로드됨'
                : '신규 모드'}
          </span>
        </CardContent>
      </Card>

      {/* R 리워드 (일별 4축) */}
      <SectionCard title="리워드 광고 R (일별)" colorClass="text-blue-600">
        <FourAxisGrid
          impressionKey="impressionRReported"
          ctrKey="ctrRReported"
          ecpmKey="ecpmRReported"
          revenueKey="tossRevenueR"
          daily={daily}
          onChange={setDailyField}
        />
      </SectionCard>

      {/* F 전면 (일별 4축) */}
      <SectionCard title="전면 광고 F (일별)" colorClass="text-rose-600">
        <FourAxisGrid
          impressionKey="impressionFReported"
          ctrKey="ctrFReported"
          ecpmKey="ecpmFReported"
          revenueKey="tossRevenueF"
          daily={daily}
          onChange={setDailyField}
        />
      </SectionCard>

      {/* B 배너 — 활성 위치 N개 + 미분리(OTHER) + 일별 합산. 활성 0개여도 OTHER+합산은 항상 노출 */}
      <SectionCard
        title="배너 광고 B (위치별 + 미분리 + 합산)"
        colorClass="text-orange-600"
      >
        <div className="space-y-3">
          {enabledBannerPositions.length === 0 && (
            <p className="text-xs text-muted-foreground">
              현재 활성된 작은 배너 위치가 없습니다 (어드민 → 광고관리에서
              활성). 미분리(OTHER) 행과 일별 합산만 입력하세요.
            </p>
          )}
          {enabledBannerPositions.map((position) => (
            <PositionRow
              key={position}
              label={POSITION_LABELS[position] ?? position}
              colorClass="border-orange-200"
              adId={bannerAdIdByPosition[position]}
              getValue={(field) =>
                getPositionNumValue(banners, position, field)
              }
              onChange={(field, raw) =>
                upsertPositionNum(banners, setBanners, position, field, raw)
              }
            />
          ))}
          <PositionRow
            label="기타 (미분리)"
            colorClass="border-gray-300"
            editableAdId
            getAdId={() => getPositionAdId(banners, POSITION_OTHER)}
            onAdIdChange={(raw) =>
              upsertPositionAdId(banners, setBanners, POSITION_OTHER, raw)
            }
            getValue={(field) =>
              getPositionNumValue(banners, POSITION_OTHER, field)
            }
            onChange={(field, raw) =>
              upsertPositionNum(banners, setBanners, POSITION_OTHER, field, raw)
            }
          />
          <div className="pt-3 border-t border-dashed">
            <p className="text-xs text-muted-foreground mb-2">
              일별 합산 (위치별 합과 검증) — reconciliation_status 기준
            </p>
            <FourAxisGrid
              impressionKey="impressionBTotal"
              ctrKey="ctrBTotalReported"
              ecpmKey="ecpmBTotalReported"
              revenueKey="tossRevenueBTotal"
              daily={daily}
              onChange={setDailyField}
            />
          </div>
        </div>
      </SectionCard>

      {/* I 이미지배너 — 동일 구조: 활성 N개 + OTHER + 합산 항상 노출 */}
      <SectionCard
        title="이미지배너 I (위치별 + 미분리 + 합산)"
        colorClass="text-emerald-600"
      >
        <div className="space-y-3">
          {enabledImagePositions.length === 0 && (
            <p className="text-xs text-muted-foreground">
              현재 활성된 이미지배너 위치가 없습니다 (어드민 → 광고관리에서
              활성). 미분리(OTHER) 행과 일별 합산만 입력하세요.
            </p>
          )}
          {enabledImagePositions.map((position) => (
            <PositionRow
              key={position}
              label={POSITION_LABELS[position] ?? position}
              colorClass="border-emerald-200"
              adId={imageAdIdByPosition[position]}
              getValue={(field) => getPositionNumValue(images, position, field)}
              onChange={(field, raw) =>
                upsertPositionNum(images, setImages, position, field, raw)
              }
            />
          ))}
          <PositionRow
            label="기타 (미분리)"
            colorClass="border-gray-300"
            editableAdId
            getAdId={() => getPositionAdId(images, POSITION_OTHER)}
            onAdIdChange={(raw) =>
              upsertPositionAdId(images, setImages, POSITION_OTHER, raw)
            }
            getValue={(field) =>
              getPositionNumValue(images, POSITION_OTHER, field)
            }
            onChange={(field, raw) =>
              upsertPositionNum(images, setImages, POSITION_OTHER, field, raw)
            }
          />
          <div className="pt-3 border-t border-dashed">
            <p className="text-xs text-muted-foreground mb-2">
              일별 합산 (위치별 합과 검증)
            </p>
            <FourAxisGrid
              impressionKey="impressionI"
              ctrKey="ctrIReported"
              ecpmKey="ecpmIReported"
              revenueKey="tossRevenueI"
              daily={daily}
              onChange={setDailyField}
            />
          </div>
        </div>
      </SectionCard>

      {/* 유저 / 리텐션 (토스 콘솔 reported) */}
      <SectionCard title="유저 / 리텐션 (토스 콘솔)" colorClass="text-gray-700">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NumField
            label="신규유저"
            unit="명"
            value={daily.newUsersReported}
            onChange={(v) => setDailyField('newUsersReported', v)}
          />
          <NumField
            label="전체유저"
            unit="명"
            value={daily.totalUsersReported}
            onChange={(v) => setDailyField('totalUsersReported', v)}
          />
          <NumField
            label="D1 리텐션 신규"
            unit="%"
            step="0.01"
            value={daily.retentionD1New}
            onChange={(v) => setDailyField('retentionD1New', v)}
          />
          <NumField
            label="D1 리텐션 전체"
            unit="%"
            step="0.01"
            value={daily.retentionD1Total}
            onChange={(v) => setDailyField('retentionD1Total', v)}
          />
        </div>
      </SectionCard>

      {/* 안내 — CSV 업로드 P2 (체류·혜택탭만 P2) */}
      <Card className="border-dashed border-muted-foreground/30">
        <CardContent className="py-4 text-xs text-muted-foreground space-y-1">
          <p>
            🔒 체류시간 / 혜택탭 유입은 본 폼에서 입력하지 않습니다. 토스 콘솔
            CSV 다운로드 파일을 ads_agent에 보관 → P2에서 어드민 CSV 업로드
            폼으로 자동 적재.
          </p>
          <p>
            🔒 활성유저·체중기록·출석·환전·신규가입(DB 기준)은 분석 탭에서 BE
            자동 집계.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? '저장 중…' : bundle?.daily ? '수정 저장' : '신규 저장'}
        </Button>
      </div>

      {/* D+7 이후 사유 모달 */}
      <Dialog
        open={reasonModal.open}
        onOpenChange={(open) => setReasonModal({ ...reasonModal, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>D+7 이후 수정 — 사유 입력</DialogTitle>
            <DialogDescription>
              {date} 데이터는 metric_date 기준 D+7이 지난 일자입니다. 변경
              이력이 적재되며 사유는 필수입니다.
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

// ───────────────── helpers ─────────────────

const SectionCard = ({
  title,
  colorClass,
  children,
}: {
  title: string;
  colorClass: string;
  children: React.ReactNode;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className={`text-sm font-semibold ${colorClass}`}>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const FourAxisGrid = ({
  impressionKey,
  ctrKey,
  ecpmKey,
  revenueKey,
  daily,
  onChange,
}: {
  impressionKey: DailyKey;
  ctrKey: DailyKey;
  ecpmKey: DailyKey;
  revenueKey: DailyKey;
  daily: DailyForm;
  onChange: (key: DailyKey, raw: string) => void;
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <NumField
      label="노출"
      unit="건"
      value={daily[impressionKey]}
      onChange={(v) => onChange(impressionKey, v)}
    />
    <NumField
      label="시청률"
      unit="%"
      step="0.01"
      value={daily[ctrKey]}
      onChange={(v) => onChange(ctrKey, v)}
    />
    <NumField
      label="eCPM"
      unit="원"
      value={daily[ecpmKey]}
      onChange={(v) => onChange(ecpmKey, v)}
    />
    <NumField
      label="수익"
      unit="원"
      value={daily[revenueKey]}
      onChange={(v) => onChange(revenueKey, v)}
    />
  </div>
);

const PositionRow = ({
  label,
  colorClass,
  adId,
  editableAdId,
  getAdId,
  onAdIdChange,
  getValue,
  onChange,
}: {
  label: string;
  colorClass: string;
  /** 광고관리에서 매핑된 광고ID (자동 표시, readonly). OTHER 행은 미사용. */
  adId?: string;
  /** 미분리(OTHER) 행에서 운영자가 직접 광고ID 입력 */
  editableAdId?: boolean;
  getAdId?: () => string;
  onAdIdChange?: (raw: string) => void;
  getValue: (
    field: 'impression' | 'ctrReported' | 'ecpmReported' | 'revenue'
  ) => string;
  onChange: (
    field: 'impression' | 'ctrReported' | 'ecpmReported' | 'revenue',
    raw: string
  ) => void;
}) => (
  <div className={`border-l-2 pl-3 ${colorClass}`}>
    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
      <p className="text-xs font-medium">{label}</p>
      {editableAdId ? (
        <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
          <span className="text-[10px] text-muted-foreground">광고ID:</span>
          <Input
            value={getAdId?.() ?? ''}
            onChange={(e) => onAdIdChange?.(e.target.value)}
            placeholder="ait.v2.live.xxxxx (토스 콘솔 합산 광고ID)"
            className="h-6 text-[11px] font-mono"
          />
        </div>
      ) : adId ? (
        <span className="text-[10px] text-muted-foreground font-mono bg-gray-50 px-1.5 py-0.5 rounded">
          {adId}
        </span>
      ) : (
        <span className="text-[10px] text-amber-600">
          광고ID 미설정 (어드민 → 광고관리에서 지정 필요)
        </span>
      )}
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <NumFieldStr
        label="노출"
        unit="건"
        value={getValue('impression')}
        onChange={(v) => onChange('impression', v)}
      />
      <NumFieldStr
        label="시청률"
        unit="%"
        step="0.01"
        value={getValue('ctrReported')}
        onChange={(v) => onChange('ctrReported', v)}
      />
      <NumFieldStr
        label="eCPM"
        unit="원"
        value={getValue('ecpmReported')}
        onChange={(v) => onChange('ecpmReported', v)}
      />
      <NumFieldStr
        label="수익"
        unit="원"
        value={getValue('revenue')}
        onChange={(v) => onChange('revenue', v)}
      />
    </div>
  </div>
);

const NumField = ({
  label,
  unit,
  step,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  step?: string;
  value: number | null | undefined;
  onChange: (raw: string) => void;
}) => (
  <div className="space-y-1">
    <Label className="text-xs">
      {label} <span className="text-muted-foreground">({unit})</span>
    </Label>
    <Input
      type="number"
      inputMode="decimal"
      step={step}
      value={value === null || value === undefined ? '' : String(value)}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const NumFieldStr = ({
  label,
  unit,
  step,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  step?: string;
  value: string;
  onChange: (raw: string) => void;
}) => (
  <div className="space-y-1">
    <Label className="text-xs">
      {label} <span className="text-muted-foreground">({unit})</span>
    </Label>
    <Input
      type="number"
      inputMode="decimal"
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default AdMetricInputSubTab;
