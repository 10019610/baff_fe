import { Scale } from 'lucide-react';
import changeUpLogo from '/ChangeUp_logo.png';

interface ChangeUpLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'header';
  className?: string;
  animate?: boolean;
}

export default function ChangeUpLogo({
  size = 'md',
  className = '',
  animate = false,
}: ChangeUpLogoProps) {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32',
    header: 'h-16 w-16 sm:h-18 sm:w-18', // 헤더 크기를 더 크게 조정 (64px → 72px)
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={changeUpLogo}
        alt="ChangeUp"
        className={`
          ${sizeClasses[size]} 
          object-contain 
          ${animate ? 'animate-pulse' : ''}
        `}
        style={{
          filter: `
            brightness(1.05) 
            contrast(1.1) 
            saturate(1.15)
            drop-shadow(0 2px 4px rgba(152, 251, 152, 0.2))
          `,
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) {
            fallback.style.display = 'block';
            fallback.style.color = '#98FB98';
          }
        }}
      />
      <Scale
        className={`
          ${sizeClasses[size]} 
          absolute inset-0 
          ${animate ? 'animate-pulse' : ''}
          hidden
        `}
        style={{
          display: 'none',
          color: '#98FB98',
        }}
      />
    </div>
  );
}
