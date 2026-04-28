import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { Badge } from '../ui/badge.tsx';
import { BarChart3, FileEdit, FileText, TrendingUp } from 'lucide-react';
import AdMetricAnalysisSubTab from './adStrategy/AdMetricAnalysisSubTab.tsx';
import AdMetricInputSubTab from './adStrategy/AdMetricInputSubTab.tsx';
import AdMetricAiReportSubTab from './adStrategy/AdMetricAiReportSubTab.tsx';

/**
 * P0 광고전략 — 어드민 화면.
 *
 * spec v0.3 §1-2 정본 (3 하위탭).
 *  ① 분석 (대표가 본다)
 *  ② 데이터 입력 (대표가 쓴다)
 *  ③ AI 보고용 (대표 → 클과장 복사)
 *
 * P0 시점에는 일부 섹션 미구현 — '🔒 P0 subset' 배지로 안내.
 */

type SubTab = 'analysis' | 'input' | 'aiReport';

const SUB_TABS: {
  key: SubTab;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    key: 'analysis',
    label: '분석',
    icon: BarChart3,
    description: 'KPI 카드 + 일별 표 (대표가 본다)',
  },
  {
    key: 'input',
    label: '데이터 입력',
    icon: FileEdit,
    description: '토스 콘솔 수기값 입력 (대표가 쓴다)',
  },
  {
    key: 'aiReport',
    label: 'AI 보고용',
    icon: FileText,
    description: '일별 분석 마크다운 자동 생성',
  },
];

const AdminAdStrategyManagement = () => {
  const [active, setActive] = useState<SubTab>('analysis');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              광고전략
            </CardTitle>
            <Badge
              variant="outline"
              className="border-amber-500 text-amber-700"
            >
              🔒 P0 subset
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            토스 콘솔 reported + DB observed 결합 분석 (spec v0.3). 일부 섹션은
            P1/P2에서 추가 가동.
          </p>
        </CardHeader>
        <CardContent>
          {/* 서브탭 */}
          <div className="flex gap-2 border-b mb-4">
            {SUB_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition-colors ${
                  active === key
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {active === 'analysis' && <AdMetricAnalysisSubTab />}
          {active === 'input' && <AdMetricInputSubTab />}
          {active === 'aiReport' && <AdMetricAiReportSubTab />}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAdStrategyManagement;
