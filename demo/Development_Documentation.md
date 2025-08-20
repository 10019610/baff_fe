# 개발 문서

이 문서는 Figma AI를 통해 생성된 데모 프로젝트의 개발 환경, 구조 및 주요 기술 스택을 설명합니다.

## 1. 기술 스택

*   **프론트엔드 프레임워크:** React (함수형 컴포넌트 및 Hooks 사용)
*   **언어:** TypeScript
*   **스타일링:** Tailwind CSS (유틸리티 우선 CSS 프레임워크)
*   **UI 컴포넌트 라이브러리:** `shadcn/ui` (MIT 라이선스)
*   **아이콘 라이브러리:** `lucide-react`
*   **차트 라이브러리:** `recharts`
*   **데이터 영속성 (데모용):** `localStorage` (클라이언트 측)

## 2. 프로젝트 구조

프로젝트는 모듈화되고 기능별로 분리된 구조를 가지고 있습니다.

```
demo/
├── components/             # 재사용 가능한 UI 컴포넌트 및 비즈니스 로직 컴포넌트
│   ├── figma/              # Figma AI 관련 컴포넌트 (추정)
│   ├── ui/                 # shadcn/ui 기반의 재사용 가능한 UI 프리미티브 (버튼, 카드 등)
│   ├── AuthContext.tsx     # 인증 컨텍스트 및 로직
│   ├── LoginPage.tsx       # 로그인 페이지 UI 및 로직
│   ├── Header.tsx          # 상단 헤더 컴포넌트
│   ├── BottomNavigation.tsx# 하단 내비게이션 (모바일)
│   ├── DesktopNavigation.tsx# 데스크톱 내비게이션
│   ├── WeightTracker.tsx   # 체중 기록 기능의 핵심 로직 및 UI
│   ├── GoalSetting.tsx     # 목표 설정 기능의 핵심 로직 및 UI
│   ├── BattleMode.tsx      # 대결 모드 기능의 핵심 로직 및 UI
│   ├── RoomCreation.tsx    # 대결 방 생성
│   ├── RoomJoin.tsx        # 대결 방 참여
│   ├── RoomList.tsx        # 대결 방 목록
│   ├── RoomInvite.tsx      # 대결 방 초대
│   ├── ActiveBattles.tsx   # 진행 중인 대결
│   ├── BattleHistory.tsx   # 대결 기록
│   ├── Dashboard.tsx       # 대시보드 기능의 핵심 로직 및 UI
│   └── ...                 # 기타 컴포넌트
├── guidelines/             # 디자인 가이드라인 (현재는 템플릿)
│   └── Guidelines.md
├── pages/                  # 애플리케이션의 주요 페이지 컴포넌트
│   ├── BattlePage.tsx      # 대결 모드 페이지
│   ├── DashboardPage.tsx   # 대시보드 페이지
│   ├── GoalsPage.tsx       # 목표 설정 페이지
│   └── TrackerPage.tsx     # 체중 기록 페이지
├── styles/                 # 전역 스타일 및 테마 정의
│   └── globals.css
├── App.tsx                 # 애플리케이션의 메인 진입점 및 라우팅/인증 관리
└── Attributions.md         # 외부 라이브러리 및 자산 저작권 정보
```

## 3. 개발 워크플로우 및 모범 사례

*   **컴포넌트 기반 개발:** 모든 UI는 재사용 가능한 컴포넌트로 분리되어 개발 효율성을 높이고 유지보수를 용이하게 합니다.
*   **모바일 우선 반응형 디자인:** Tailwind CSS의 반응형 유틸리티 클래스를 적극 활용하여 모바일 환경을 우선적으로 고려한 디자인을 구현합니다.
*   **상태 관리:** React의 `useState` 및 `useEffect` Hooks를 사용하여 컴포넌트 로컬 상태 및 사이드 이펙트를 관리합니다. 전역 상태는 React Context API (`AuthContext`)를 통해 관리됩니다.
*   **데이터 영속성 (데모):** 개발 및 데모 목적으로 모든 애플리케이션 데이터는 브라우저의 `localStorage`에 저장됩니다. 실제 프로덕션 환경에서는 서버 측 데이터베이스 및 API 연동이 필요합니다.
*   **코드 컨벤션:**
    *   `globals.css`의 주석에서 제안된 바와 같이, 불필요한 절대 위치 지정 대신 Flexbox 및 Grid를 사용한 반응형 레이아웃을 선호합니다.
    *   코드의 가독성과 유지보수성을 위해 지속적인 리팩토링을 권장합니다.
    *   파일 크기를 작게 유지하고, 도우미 함수 및 컴포넌트는 별도의 파일로 분리합니다.

## 4. 외부 라이브러리 및 자산

*   **`shadcn/ui`:** UI 컴포넌트의 기반으로 사용되며, MIT 라이선스에 따라 사용됩니다. (`Attributions.md` 참조)
*   **Unsplash:** 데모에 사용된 사진은 Unsplash에서 제공되며, Unsplash 라이선스에 따라 사용됩니다. (`Attributions.md` 참조)

## 5. Figma AI의 역할

이 프로젝트는 Figma AI를 통해 생성된 데모 버전으로, Figma 디자인을 기반으로 코드 구조 및 컴포넌트 생성을 자동화하는 데 Figma AI가 활용되었을 것으로 추정됩니다. 이는 디자인 시스템의 규칙을 코드에 반영하고, 디자인과 개발 간의 효율적인 협업을 가능하게 합니다.
