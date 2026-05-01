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
  AdMetricDailyEntry,
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
 * 데이터 입력 — 광고 종류별 4축.
 *  · R(리워드) 미분리 + 꺼내기(EXCHANGE_RESULT)
 *  · F(전면) 미분리 + 체중기록(WEIGHT_RESULT) + 출석체크(ATTENDANCE_RESULT)
 *  · B(배너) 위치별 (AdPositionConfig 활성) + 미분리
 *  · I(이미지배너) 단일 4축
 *
 * 4축 = 노출 / 시청률(%) / eCPM(원) / 수익(원).
 * 신규/전체 유저 + D1 리텐션은 토스 콘솔에서 운영자가 직접 옮김. 체류·혜택탭만 CSV(P2).
 * 활성유저·체중·출석·환전·신규가입은 BE에서 자동 집계 (분석 탭).
 */

// R/F/B 위치별 분리 정책 — 변경 시 이 세 상수만 수정
const REWARD_POSITIONS: { code: string; label: string }[] = [
  { code: 'EXCHANGE_RESULT', label: '꺼내기 완료 페이지' },
];
const INTERSTITIAL_POSITIONS: { code: string; label: string }[] = [
  { code: 'WEIGHT_RESULT', label: '체중기록 완료 페이지' },
  { code: 'ATTENDANCE_RESULT', label: '출석체크 완료 페이지' },
];
const BANNER_POSITIONS: { code: string; label: string }[] = [
  { code: 'ATTENDANCE', label: '출석체크 하단' },
  { code: 'BENEFIT_TOP', label: '혜택 상단' },
];

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

type PositionField = 'impression' | 'ctrReported' | 'ecpmReported' | 'revenue';

const EMPTY: DailyForm = {};

/** PositionRow field → R 미분리 daily 컬럼 키 매핑 */
const REWARD_DAILY_KEY: Record<PositionField, DailyKey> = {
  impression: 'impressionRReported',
  ctrReported: 'ctrRReported',
  ecpmReported: 'ecpmRReported',
  revenue: 'tossRevenueR',
};

/** PositionRow field → F 미분리 daily 컬럼 키 매핑 */
const INTERSTITIAL_DAILY_KEY: Record<PositionField, DailyKey> = {
  impression: 'impressionFReported',
  ctrReported: 'ctrFReported',
  ecpmReported: 'ecpmFReported',
  revenue: 'tossRevenueF',
};

const rewardField = (_t: 'daily', f: PositionField): DailyKey =>
  REWARD_DAILY_KEY[f];
const interstitialField = (_t: 'daily', f: PositionField): DailyKey =>
  INTERSTITIAL_DAILY_KEY[f];

const dailyFieldToString = (daily: DailyForm, key: DailyKey): string => {
  const v = daily[key];
  return v === null || v === undefined ? '' : String(v);
};

const AdMetricInputSubTab = () => {
  const queryClient = useQueryClient();
  const [date, setDate] = useState<string>(getYesterday());
  const [daily, setDaily] = useState<DailyForm>(EMPTY);
  const [banners, setBanners] = useState<PositionEntry[]>([]);
  const [images, setImages] = useState<PositionEntry[]>([]);
  const [rewards, setRewards] = useState<PositionEntry[]>([]);
  const [interstitials, setInterstitials] = useState<PositionEntry[]>([]);
  const [reasonModal, setReasonModal] = useState<{
    open: boolean;
    reason: string;
  }>({
    open: false,
    reason: '',
  });

  // 입력된 토스 데이터 목록 (D-14 기본 필터)
  const defaultFrom = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  })();
  const defaultTo = new Date().toISOString().split('T')[0];
  const [filterFrom, setFilterFrom] = useState<string>(defaultFrom);
  const [filterTo, setFilterTo] = useState<string>(defaultTo);

  const { data: dailyList } = useQuery<AdMetricDailyEntry[]>({
    queryKey: ['adMetricDailyList', filterFrom, filterTo],
    queryFn: async () => {
      const res = await api.get<AdMetricDailyEntry[]>(
        '/admin/ad-metrics/daily',
        { params: { from: filterFrom, to: filterTo } }
      );
      return res.data ?? [];
    },
  });

  // 배포 마커
  type DeployMarker = {
    id: number;
    metricDate: string;
    deployVersion: string;
    deployNote?: string | null;
  };
  const [deployForm, setDeployForm] = useState<{
    metricDate: string;
    deployVersion: string;
    deployNote: string;
  }>({ metricDate: '', deployVersion: '', deployNote: '' });

  const { data: deploys } = useQuery<DeployMarker[]>({
    queryKey: ['adMetricDeploys'],
    queryFn: async () => {
      const res = await api.get<DeployMarker[]>('/admin/ad-metrics/deploys');
      return res.data ?? [];
    },
  });

  const { mutate: saveDeploy, isPending: isDeployPending } = useMutation({
    mutationFn: async () => {
      if (!deployForm.metricDate || !deployForm.deployVersion.trim()) {
        throw new Error('날짜와 버전 필수');
      }
      const res = await api.post('/admin/ad-metrics/deploys', {
        metricDate: deployForm.metricDate,
        deployVersion: deployForm.deployVersion.trim(),
        deployNote: deployForm.deployNote.trim() || null,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('배포 마커 등록 완료');
      queryClient.invalidateQueries({ queryKey: ['adMetricDeploys'] });
      setDeployForm({ metricDate: '', deployVersion: '', deployNote: '' });
    },
    onError: (err: unknown) => {
      const msg =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ??
        (err as { message?: string })?.message ??
        '저장 실패';
      toast.error(msg);
    },
  });

  // 일자 선택 → 자동 로드
  const { data: bundle, isLoading } = useQuery<AdMetricDailyBundle>({
    queryKey: ['adMetricBundle', date],
    queryFn: async () => {
      const res = await api.get<AdMetricDailyBundle>(
        '/admin/ad-metrics/daily',
        {
          params: { date },
        }
      );
      return (
        res.data ?? {
          daily: null,
          banners: [],
          images: [],
          rewards: [],
          interstitials: [],
        }
      );
    },
  });

  // 활성 위치 (AdPositionConfig)
  const { data: positionConfigs } = useQuery<TossAdPositionConfig[]>({
    queryKey: ['tossAdConfigs'],
    queryFn: async () => {
      const res = await api.get<TossAdPositionConfig[]>(
        '/admin/dashboard/toss-ad/configs'
      );
      return res.data;
    },
  });

  const bannerAdIdByPosition = useMemo(() => {
    const map: Record<string, string> = {};
    (positionConfigs ?? []).forEach((c) => {
      const id = c.tossBannerAdGroupId || c.tossAdGroupId;
      if (id) map[c.position] = id;
    });
    return map;
  }, [positionConfigs]);

  // F 위치별 광고ID — AdPositionConfig 인터스티셜 매핑
  const interstitialAdIdByPosition = useMemo(() => {
    const map: Record<string, string> = {};
    (positionConfigs ?? []).forEach((c) => {
      if (c.tossInterstitialAdGroupId)
        map[c.position] = c.tossInterstitialAdGroupId;
    });
    return map;
  }, [positionConfigs]);

  // R 위치별 광고ID — AdPositionConfig 리워드 매핑 (tossAdGroupId가 일반 토스광고이자 리워드/F에 모두 쓰일 수 있음)
  const rewardAdIdByPosition = useMemo(() => {
    const map: Record<string, string> = {};
    (positionConfigs ?? []).forEach((c) => {
      if (c.tossAdGroupId) map[c.position] = c.tossAdGroupId;
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
    setRewards(bundle?.rewards ?? []);
    setInterstitials(bundle?.interstitials ?? []);
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
        rewards: rewards.length > 0 ? rewards : undefined,
        interstitials: interstitials.length > 0 ? interstitials : undefined,
        reason: override?.reason,
      };
      const res = await api.post('/admin/ad-metrics/daily', payload);
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

      {/* R 리워드 — 미분리 + 위치별(꺼내기). 미분리는 daily, 위치별은 rewards[]. */}
      <SectionCard title="리워드 광고 R" colorClass="text-blue-600">
        <div className="space-y-3">
          <PositionRow
            label="미분리 (전체 합산)"
            colorClass="border-blue-200"
            getValue={(field) =>
              dailyFieldToString(daily, rewardField('daily', field))
            }
            onChange={(field, raw) =>
              setDailyField(rewardField('daily', field), raw)
            }
          />
          {REWARD_POSITIONS.map(({ code, label }) => (
            <PositionRow
              key={code}
              label={label}
              colorClass="border-blue-200"
              adId={rewardAdIdByPosition[code]}
              getValue={(field) => getPositionNumValue(rewards, code, field)}
              onChange={(field, raw) =>
                upsertPositionNum(rewards, setRewards, code, field, raw)
              }
            />
          ))}
        </div>
      </SectionCard>

      {/* F 전면 — 미분리 + 위치별(체중기록/출석체크). 미분리는 daily, 위치별은 interstitials[]. */}
      <SectionCard title="전면 광고 F" colorClass="text-rose-600">
        <div className="space-y-3">
          <PositionRow
            label="미분리 (전체 합산)"
            colorClass="border-rose-200"
            getValue={(field) =>
              dailyFieldToString(daily, interstitialField('daily', field))
            }
            onChange={(field, raw) =>
              setDailyField(interstitialField('daily', field), raw)
            }
          />
          {INTERSTITIAL_POSITIONS.map(({ code, label }) => (
            <PositionRow
              key={code}
              label={label}
              colorClass="border-rose-200"
              adId={interstitialAdIdByPosition[code]}
              getValue={(field) =>
                getPositionNumValue(interstitials, code, field)
              }
              onChange={(field, raw) =>
                upsertPositionNum(
                  interstitials,
                  setInterstitials,
                  code,
                  field,
                  raw
                )
              }
            />
          ))}
        </div>
      </SectionCard>

      {/* B 배너 — 미분리 + 노출 위치(출석 하단/혜택 상단)만. 일별 합산은 위치별 합으로 자동 산출. */}
      <SectionCard title="배너 광고 B (위치별)" colorClass="text-orange-600">
        <div className="space-y-3">
          <PositionRow
            label="미분리 (전체 합산)"
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
          {BANNER_POSITIONS.map(({ code, label }) => (
            <PositionRow
              key={code}
              label={label}
              colorClass="border-orange-200"
              adId={bannerAdIdByPosition[code]}
              getValue={(field) => getPositionNumValue(banners, code, field)}
              onChange={(field, raw) =>
                upsertPositionNum(banners, setBanners, code, field, raw)
              }
            />
          ))}
        </div>
      </SectionCard>

      {/* I 이미지배너 — 단일 4축 (위치별 분리 폐지) */}
      <SectionCard title="이미지배너 I" colorClass="text-emerald-600">
        <FourAxisGrid
          impressionKey="impressionI"
          ctrKey="ctrIReported"
          ecpmKey="ecpmIReported"
          revenueKey="tossRevenueI"
          daily={daily}
          onChange={setDailyField}
        />
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

      {/* 입력된 토스 데이터 목록 (D-14 기본, 행 클릭 → 폼 prefill) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm">
              입력된 토스 데이터 ({dailyList?.length ?? 0}건)
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="h-7 w-36 text-xs"
              />
              <span className="text-xs text-muted-foreground">~</span>
              <Input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="h-7 w-36 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-2 whitespace-nowrap">날짜</th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap text-blue-500">
                  R노출
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap text-blue-500">
                  R시청
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap text-blue-500">
                  R-eCPM
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap text-blue-500">
                  R수익
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap text-rose-500">
                  F노출
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap text-rose-500">
                  F시청
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap text-rose-500">
                  F-eCPM
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap text-rose-500">
                  F수익
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap text-orange-500">
                  B노출
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap text-orange-500">
                  B시청
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap text-orange-500">
                  B-eCPM
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap text-orange-500">
                  B수익
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap text-emerald-500">
                  I노출
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap text-emerald-500">
                  I시청
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap text-emerald-500">
                  I-eCPM
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap text-emerald-500">
                  I수익
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap">신규</th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap">전체</th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap">
                  D1신규
                </th>
                <th className="pb-2 pr-2 text-right whitespace-nowrap">
                  D1전체
                </th>
              </tr>
            </thead>
            <tbody>
              {(dailyList ?? []).length === 0 ? (
                <tr>
                  <td
                    colSpan={21}
                    className="py-4 text-center text-muted-foreground"
                  >
                    입력된 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                dailyList!.map((d) => (
                  <tr
                    key={d.metricDate}
                    onClick={() => setDate(d.metricDate)}
                    className="border-b last:border-0 hover:bg-blue-50 cursor-pointer"
                    title="행 클릭 → 위 폼에 자동 채움"
                  >
                    <td className="py-1.5 pr-2 font-mono whitespace-nowrap">
                      {d.metricDate.slice(5)}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.impressionRReported ?? '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.ctrRReported != null ? `${d.ctrRReported}%` : '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.ecpmRReported ?? '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.tossRevenueR ?? '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.impressionFReported ?? '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.ctrFReported != null ? `${d.ctrFReported}%` : '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.ecpmFReported ?? '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.tossRevenueF ?? '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.impressionBTotal ?? '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.ctrBTotalReported != null
                        ? `${d.ctrBTotalReported}%`
                        : '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.ecpmBTotalReported ?? '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.tossRevenueBTotal ?? '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.impressionI ?? '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.ctrIReported != null ? `${d.ctrIReported}%` : '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.ecpmIReported ?? '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.tossRevenueI ?? '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.newUsersReported ?? '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.totalUsersReported ?? '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.retentionD1New != null ? `${d.retentionD1New}%` : '-'}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">
                      {d.retentionD1Total != null
                        ? `${d.retentionD1Total}%`
                        : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 배포 마커 등록 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">배포 마커 등록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">배포 날짜 *</Label>
              <Input
                type="date"
                value={deployForm.metricDate}
                onChange={(e) =>
                  setDeployForm({ ...deployForm, metricDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">버전 *</Label>
              <Input
                placeholder="v1.5.0"
                value={deployForm.deployVersion}
                onChange={(e) =>
                  setDeployForm({
                    ...deployForm,
                    deployVersion: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">메모</Label>
              <Input
                placeholder="주요 변경사항"
                value={deployForm.deployNote}
                onChange={(e) =>
                  setDeployForm({ ...deployForm, deployNote: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Button
              size="sm"
              onClick={() => saveDeploy()}
              disabled={isDeployPending}
            >
              {isDeployPending ? '저장 중…' : '등록'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 등록된 배포 마커 목록 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">등록된 배포 마커</CardTitle>
        </CardHeader>
        <CardContent>
          {(deploys ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              등록된 배포 마커가 없습니다.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">날짜</th>
                  <th className="pb-2 pr-4">버전</th>
                  <th className="pb-2">메모</th>
                </tr>
              </thead>
              <tbody>
                {deploys!.map((d) => (
                  <tr key={d.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-muted-foreground">
                      {d.metricDate}
                    </td>
                    <td className="py-2 pr-4">
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                        {d.deployVersion}
                      </span>
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {d.deployNote || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

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
