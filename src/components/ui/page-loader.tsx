import { cn } from './utils';

interface PageLoaderProps {
  message?: string;
  className?: string;
}

/**
 * 페이지 로딩용 스피너 컴포넌트
 *
 * @description 전체 화면 로딩이나 페이지 전환 시 사용하는 로딩 스피너
 * @param message - 로딩 메시지 (기본값: "로딩 중...")
 * @param className - 추가 CSS 클래스
 */
const PageLoader = ({ message = '로딩 중...', className }: PageLoaderProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center min-h-screen bg-background -mt-32',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        {/* 스피너 */}
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent absolute top-0 left-0"></div>
        </div>

        {/* 로딩 메시지 */}
        <p className="text-muted-foreground text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default PageLoader;
