interface CustomSpaceProps {
  hSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  gray?: boolean;
}

const heightMap = {
  xs: 'h-2',
  sm: 'h-4',
  md: 'h-8',
  lg: 'h-12',
  xl: 'h-16',
};

const colorMap = {
  default: 'bg-white',
  gray: 'bg-gray-100',
};

/**
 * 중간 마진 관련 공통 컴포넌트
 *
 * @description
 * - 컴포넌트 사이사이 공간이 필요할 때 사용
 * - 높이, 색상(흰색/회색) 지정가능
 *
 *
 * @author hjkim
 * @param hSize 컴포넌트 높이
 * @param gray 컴포넌트 색상
 * @constructor
 */
const CustomSpace = ({ hSize, gray = false }: CustomSpaceProps) => {
  const heightClass = hSize ? heightMap[hSize] : '';
  const bgColorClass = gray ? colorMap.gray : colorMap.default;

  const combinedClasses = `${heightClass} w-full ${bgColorClass}`.trim();
  return <div className={combinedClasses} />;
};
export default CustomSpace;
