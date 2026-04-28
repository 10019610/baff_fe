import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card.tsx';
import { Input } from '../../ui/input.tsx';
import { Button } from '../../ui/button.tsx';
import { Badge } from '../../ui/badge.tsx';
import { Textarea } from '../../ui/textarea.tsx';
import { Copy, Download } from 'lucide-react';
import { api } from '../../../services/api/Api.ts';
import type { AdMetricKpi } from '../../../types/AdMetric.api.type.ts';
import {
  GRAM_UNIT_PRICE_KRW,
  LAUNCH_AT_KST,
  getSampleTag,
  getYesterday,
} from '../../../utils/AdMetricUtil.ts';

/**
 * 탭 ③ AI 보고용 — 일별 분석 마크다운 자동 생성 + 전체 복사.
 *
 * spec v0.3 §5-1 P0 subset 운영 룰:
 *  - P0 시점 자동 채움이 미연결된 섹션은 마크다운 출력에서 섹션 자체 생략
 *  - 헤더에 '🔒 P0 subset' 배지 표기
 *  - Facts Only 섹션의 P0 subset 항목만 자동 채움 + 가설/결정/관찰은 빈칸 유지
 */

const AdMetricAiReportSubTab = () => {
  const [date, setDate] = useState<string>(getYesterday());

  const { data: kpi } = useQuery<AdMetricKpi>({
    queryKey: ['adMetricKpi', date],
    queryFn: async () => {
      const res = await api.get<AdMetricKpi>('/api/admin/ad-metrics/kpi', {
        params: { date },
      });
      return res.data;
    },
  });

  const markdown = useMemo(() => buildMarkdown(date, kpi ?? null), [date, kpi]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      toast.success('마크다운 전체 복사 완료. 클과장 세션에 붙여넣으세요.');
    } catch {
      toast.error('복사 실패');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${date}_changeup_daily.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              AI 보고용 마크다운
              <Badge variant="outline">[표본: {getSampleTag(date)}]</Badge>
              <Badge className="bg-amber-500">🔒 P0 subset</Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleCopy} size="sm">
                <Copy className="h-4 w-4 mr-1" />
                전체 복사
              </Button>
              <Button onClick={handleDownload} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                다운로드
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            P0 단계라 운영설정 스냅샷·터치포인트별 시청·배너위치별
            eCPM·리텐션·예측vs실적 섹션은 자동 생략됨. 가설·결정·관찰 4박스는
            빈칸 유지(인과 추론 과잉 방지).
          </p>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-48 mb-3"
          />
          <Textarea
            value={markdown}
            readOnly
            rows={28}
            className="font-mono text-xs"
          />
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * spec §5-2 마크다운 포맷 — P0 subset.
 * 미연결 섹션은 통째 생략 (P0 운영 룰).
 */
function buildMarkdown(date: string, kpi: AdMetricKpi | null): string {
  const sample = getSampleTag(date);
  const daily = kpi?.daily ?? null;
  const lines: string[] = [];

  // 헤더
  lines.push(`# ${date} 광고 분석 — ${date} 데이터 (${sample})`);
  lines.push('');
  lines.push(
    '> 비용 방법론: 발생주의 (그램 발행 + 토스포인트직접지급만 비용. 환전 = 발행분 현금화, 비용 아님)'
  );
  lines.push(`> 표기 정합: 런칭 D-일 = ${LAUNCH_AT_KST}`);
  lines.push(`> 그램 단가: ${GRAM_UNIT_PRICE_KRW}원/g 가정 🟡 (A-5 미정)`);
  lines.push(
    '> 자동 채움 범위: 🟢 P0 subset — 운영설정 스냅샷·터치포인트별·배너위치별·리텐션·예측vs실적 섹션은 자동 생략'
  );
  lines.push(
    '> 📐 작성 규칙: ~/ads_agent/projects/onlyme/daily-template.md 준수. 표본 태그 [표본: N일] 병기.'
  );
  lines.push('');
  lines.push('---');
  lines.push('');

  // Facts Only — P0 subset
  lines.push('## 오늘의 사실 (Facts Only) — 자동 채움 (P0 subset)');
  lines.push('');

  if (!kpi) {
    lines.push('- (데이터 로드 중)');
    lines.push('');
  } else {
    if (kpi.netProfit !== null) {
      lines.push(
        `- 순손익: ${formatKrw(kpi.netProfit)} (Phase 1 누적 기준 표기 보류 — 운영 누적 service 미연결)`
      );
    } else {
      lines.push('- 순손익: 미입력 (탭 ② 토스수익 입력 필요)');
    }

    if (daily) {
      const totalRevenue = sumNullable([
        daily.tossRevenueR,
        daily.tossRevenueF,
        daily.tossRevenueBTotal,
        daily.tossRevenueI,
      ]);
      lines.push(
        `- 토스수익 ${totalRevenue}원 — R ${nullDash(daily.tossRevenueR)} / F ${nullDash(daily.tossRevenueF)} / B합산 ${nullDash(daily.tossRevenueBTotal)} / I ${nullDash(daily.tossRevenueI)}`
      );
      lines.push(
        `- R-eCPM ${nullDash(daily.ecpmRReported)} / 시청률 ${nullDashPct(daily.ctrRReported)} (콘솔)`
      );
      lines.push(
        `- F-eCPM ${nullDash(daily.ecpmFReported)} / 시청률 ${nullDashPct(daily.ctrFReported)} (콘솔)`
      );
      lines.push(
        `- B-eCPM 합산 ${nullDash(daily.ecpmBTotalReported)} / 시청률 ${nullDashPct(daily.ctrBTotalReported)} (콘솔). 위치별: AdMetricBannerEntry 분해 가동중`
      );
      lines.push(
        `- I-eCPM ${nullDash(daily.ecpmIReported)} / 시청률 ${nullDashPct(daily.ctrIReported)} (콘솔)`
      );
      lines.push(
        `- R 노출 ${kpi.observedImpressionR} (DB observed, truth) — 콘솔 reported ${nullDash(daily.impressionRReported)}${mismatchTag(
          kpi.observedImpressionR,
          daily.impressionRReported
        )}`
      );
      lines.push(
        `- F 노출 (DB observed) — 체인지업 빌드 분리 미수집. 콘솔 reported ${nullDash(daily.impressionFReported)}`
      );
      lines.push(
        `- B 노출 합산 ${nullDash(daily.impressionBTotal)} (콘솔, truth)`
      );
      lines.push(`- I 노출 ${nullDash(daily.impressionI)} (콘솔, truth)`);
    } else {
      lines.push(
        '- 토스 콘솔 reported 항목: 미입력 (탭 ②에서 13항목 입력 필요)'
      );
    }

    lines.push(`- 활성유저(raw) ${kpi.activeUsersRaw} 🟡 (어뷰저 정책 미적용)`);
    lines.push(`- 체중 기록 ${kpi.coreActions.weightLog}`);
    lines.push(`- 출석 ${kpi.coreActions.attendance}`);
    lines.push(`- 환전 ${kpi.coreActions.exchange}`);
    lines.push(`- 실제 가입 ${kpi.newSignups}`);

    lines.push(
      '- 신규 유입 / 체류시간 / 혜택탭 유입 / D1 리텐션: 🔒 P2 CSV 업로드 가동 후 자동 채움'
    );

    lines.push(
      `- 누적 그램 — 발행 ${kpi.cumulativeGramBalance.totalIssued} / 잔액 ${kpi.cumulativeGramBalance.circulating} / 보유유저 ${kpi.cumulativeGramBalance.holders}`
    );
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  // §10 4박스 빈 프레임 (Facts만 자동, 나머지 빈칸)
  lines.push('## 종합 평가 (Facts → Hypotheses → Decisions → Open)');
  lines.push('');
  lines.push('### 🔵 사실 (Facts) — 자동');
  lines.push('- (위 Facts Only에서 핵심 5~7개 발췌)');
  lines.push('');
  lines.push('### 🟡 가설 (Hypotheses) — 사람이 채움');
  lines.push(
    `- (표본 태그 [표본: ${sample}] 필수, 표본 3일 미만에서 "검증" 금지)`
  );
  lines.push('');
  lines.push('### 🟢 결정 (Decisions) — 사람이 채움');
  lines.push('- (근거 표본 명시)');
  lines.push('');
  lines.push('### ⚪ 추가 관찰 (Open) — 사람이 채움');
  lines.push('- (몇 일/몇 건 더 필요한지 명시)');
  lines.push('');
  lines.push('---');
  lines.push('');

  // §11 내일 예측 — 항목 리스트만 자동
  lines.push('## 내일 예측');
  lines.push('');
  lines.push('| 항목 | 예측 범위 | 근거 | 표본 |');
  lines.push('|------|---------|------|------|');
  lines.push('| 토스수익 |  |  |  |');
  lines.push('| R-eCPM |  |  |  |');
  lines.push('| 활성유저(raw) |  |  |  |');
  lines.push('| 신규 유입 |  |  |  |');
  lines.push('| 가입 전환율 |  |  |  |');
  lines.push('| 체중 기록 / 출석 / 환전 |  |  |  |');
  lines.push('');
  lines.push(
    '> 예측 근거에 표본 태그 필수. "하단 미달 시 가설 재검토" 자기 검증 기준 선언.'
  );
  lines.push('');
  lines.push('---');
  lines.push('');

  // 자동 첨부
  lines.push('## 자동 첨부 (대표 필독)');
  lines.push('');
  lines.push(`- ⚠️ 전역 표본 태그: [표본: ${sample}]`);
  lines.push('- ⚠️ 광고ID 신선도: 🔒 P1 (광고ID 매핑 시딩 후)');
  lines.push(
    '- ⚠️ 금지 표현 체크: "검증 / 효과 확인 / V자 / 구조적 변화" 단어 사용 시 표본 14일+ AND 반대 사례 없음 조건 만족 여부 확인'
  );
  lines.push('- ⚠️ 리텐션 혼용 금지: 🔒 P2 (CSV 파이프라인 가동 후)');
  lines.push('');

  return lines.join('\n');
}

function nullDash(v: number | null | undefined): string | number {
  return v === null || v === undefined ? '-' : v;
}

function nullDashPct(v: number | null | undefined): string {
  return v === null || v === undefined ? '-' : `${v}%`;
}

function sumNullable(vs: (number | null | undefined)[]): number {
  return vs.reduce((sum: number, v) => sum + (v ?? 0), 0);
}

function formatKrw(v: number): string {
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toLocaleString()}원`;
}

function mismatchTag(observed: number, reported: number | null): string {
  if (reported === null) return '';
  const threshold = Math.max(1, observed * 0.1);
  if (Math.abs(observed - reported) > threshold) return ' ⚠️ 불일치';
  return '';
}

export default AdMetricAiReportSubTab;
