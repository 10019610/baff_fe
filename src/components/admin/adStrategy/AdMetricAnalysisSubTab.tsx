import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card.tsx';
import { Input } from '../../ui/input.tsx';
import { Badge } from '../../ui/badge.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table.tsx';
import {
  TrendingUp,
  Users,
  Activity,
  UserPlus,
  Coins,
  DollarSign,
} from 'lucide-react';
import { api } from '../../../services/api/Api.ts';
import type {
  AdMetricKpi,
  AdMetricDailyTableRow,
} from '../../../types/AdMetric.api.type.ts';
import { getSampleTag, getYesterday } from '../../../utils/AdMetricUtil.ts';

/**
 * 탭 ① 분석 — KPI 카드 6장 + 일별 KPI 표 D-7.
 *
 * spec v0.3 §3-2 / §3-3 정본.
 * P0 subset: 활성유저는 raw 명명, 추세 그래프/터치포인트별 표/리텐션은 P1~P2.
 */

const AdMetricAnalysisSubTab = () => {
  const [date, setDate] = useState<string>(getYesterday());

  const { data: kpi, isLoading } = useQuery<AdMetricKpi>({
    queryKey: ['adMetricKpi', date],
    queryFn: async () => {
      const res = await api.get<AdMetricKpi>('/api/admin/ad-metrics/kpi', {
        params: { date },
      });
      return res.data;
    },
  });

  const fromDate = (() => {
    const d = new Date(date);
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  })();

  const { data: tableRows } = useQuery<AdMetricDailyTableRow[]>({
    queryKey: ['adMetricDailyTable', fromDate, date],
    queryFn: async () => {
      const res = await api.get<AdMetricDailyTableRow[]>(
        '/api/admin/ad-metrics/daily-table',
        { params: { from: fromDate, to: date } }
      );
      return res.data;
    },
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            분석 일자
            <Badge variant="outline">[표본: {getSampleTag(date)}]</Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            비용 방법론: 발생주의 (그램 발행 + 토스포인트직접지급만 비용. 환전 ≠
            비용). 그램 단가 1g=1원 가정 🟡 (A-5 미정).
          </p>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-48"
          />
        </CardContent>
      </Card>

      {/* KPI 카드 6장 */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard
          icon={DollarSign}
          label="순손익"
          value={
            kpi?.netProfit !== null && kpi?.netProfit !== undefined
              ? `${kpi.netProfit.toLocaleString()}원`
              : isLoading
                ? '…'
                : '미입력'
          }
          hint="토스수익 - 그램발행 × 단가"
        />
        <KpiCard
          icon={TrendingUp}
          label="종합 eCPM (R+F+B+I)"
          value={
            kpi?.totalEcpm !== null && kpi?.totalEcpm !== undefined
              ? `${kpi.totalEcpm.toLocaleString()}원`
              : '미입력'
          }
          hint="콘솔 reported 합산"
        />
        <KpiCard
          icon={Users}
          label="활성유저(raw) 🟡"
          value={kpi ? `${kpi.activeUsersRaw.toLocaleString()}명` : '…'}
          hint="어뷰저 필터 미적용 (정책 결정 후 자연으로 rename)"
        />
        <KpiCard
          icon={Activity}
          label="핵심 액션"
          value={
            kpi
              ? `체중 ${kpi.coreActions.weightLog} / 출석 ${kpi.coreActions.attendance} / 환전 ${kpi.coreActions.exchange}`
              : '…'
          }
        />
        <KpiCard
          icon={UserPlus}
          label="실제 가입"
          value={kpi ? `${kpi.newSignups.toLocaleString()}명` : '…'}
        />
        <KpiCard
          icon={Coins}
          label="누적 그램 (S6-16 재활용)"
          value={
            kpi
              ? `발행 ${kpi.cumulativeGramBalance.totalIssued.toLocaleString()}g / 잔액 ${kpi.cumulativeGramBalance.circulating.toLocaleString()}g / 보유 ${kpi.cumulativeGramBalance.holders.toLocaleString()}명`
              : '…'
          }
        />
      </div>

      {/* 일별 KPI 표 D-7 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">일별 KPI 표 (D-7)</CardTitle>
          <p className="text-xs text-muted-foreground">
            R/F 노출은 DB observed = truth, B/I 노출은 콘솔 reported = truth.
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead className="text-right">토스수익(R/F/B/I)</TableHead>
                <TableHead className="text-right">eCPM(R/F/B/I)</TableHead>
                <TableHead className="text-right">시청률(R/F/B/I)</TableHead>
                <TableHead className="text-right">노출 R obs</TableHead>
                <TableHead className="text-right">노출 R rep</TableHead>
                <TableHead className="text-right">활성유저(raw)</TableHead>
                <TableHead className="text-right">체중/출석/환전</TableHead>
                <TableHead className="text-right">신규가입</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows?.map((row) => {
                const d = row.daily;
                const reportedR = d?.impressionRReported ?? null;
                const observedR = row.observedImpressionR;
                const mismatch =
                  reportedR !== null &&
                  Math.abs(observedR - reportedR) >
                    Math.max(1, observedR * 0.1);
                return (
                  <TableRow key={row.metricDate}>
                    <TableCell className="font-medium">
                      {row.metricDate.slice(5)}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {d ? (
                        <>
                          {d.tossRevenueR ?? '-'}/{d.tossRevenueF ?? '-'}/
                          {d.tossRevenueBTotal ?? '-'}/{d.tossRevenueI ?? '-'}
                        </>
                      ) : (
                        <span className="text-muted-foreground">미입력</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {d ? (
                        <>
                          {d.ecpmRReported ?? '-'}/{d.ecpmFReported ?? '-'}/
                          {d.ecpmBTotalReported ?? '-'}/{d.ecpmIReported ?? '-'}
                        </>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {d ? (
                        <>
                          {d.ctrRReported ?? '-'}/{d.ctrFReported ?? '-'}/
                          {d.ctrBTotalReported ?? '-'}/{d.ctrIReported ?? '-'}
                        </>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">{observedR}</TableCell>
                    <TableCell className="text-right">
                      {reportedR === null ? (
                        '-'
                      ) : mismatch ? (
                        <span className="text-amber-600">{reportedR} ⚠️</span>
                      ) : (
                        reportedR
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.activeUsersRaw}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {row.weightLog}/{row.attendance}/{row.exchange}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.newSignups}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* P0 미구현 안내 */}
      <Card className="border-dashed border-muted-foreground/30">
        <CardContent className="py-4 text-xs text-muted-foreground space-y-1">
          <p>
            🔒 P1 추가 예정: 운영 설정 스냅샷 / 배너 위치별 eCPM /
            reconciliation 경고 배지 / 광고ID 신선도 태그
          </p>
          <p>
            🔒 P2 추가 예정: 터치포인트별 시청 표 / 리텐션 4박스 / 추세 그래프
            4종
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const KpiCard = ({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground font-normal">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-base font-semibold">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </CardContent>
  </Card>
);

export default AdMetricAnalysisSubTab;
