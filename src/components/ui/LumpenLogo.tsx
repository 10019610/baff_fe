import { Building2 } from 'lucide-react';
import lumpenLogo from '/company_logo.png';

interface LumpenLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export default function LumpenLogo({
  size = 'sm',
  className = '',
}: LumpenLogoProps) {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32',
    header: 'h-16 w-16 sm:h-18 sm:w-18', // 헤더 크기를 더 크게 조정 (64px → 72px)
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative inline-block">
        <img
          src={lumpenLogo}
          alt="Lumpen"
          className={`
            ${sizeClasses[size]} 
            object-contain
          `}
          style={{
            filter: `
              brightness(1.05) 
              contrast(1.1)
              saturate(1.1)
            `,
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.style.display = 'block';
              fallback.style.color = 'hsl(var(--muted-foreground))';
            }
          }}
        />
        <Building2
          className={`
            ${sizeClasses[size]} 
            absolute inset-0 
            hidden
          `}
          style={{
            display: 'none',
            color: 'hsl(var(--muted-foreground))',
          }}
        />
      </div>
    </div>
  );
}
