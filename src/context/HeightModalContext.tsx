import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

// 키 입력 모달 컨텍스트의 상태를 정의합니다.
interface HeightModalContextType {
  isHeightModalOpen: boolean;
  setIsHeightModalOpen: (isOpen: boolean) => void;
}

// 기본 컨텍스트 값
const HeightModalContext = createContext<HeightModalContextType | undefined>(
  undefined
);

// HeightModalProvider 컴포넌트: 키 입력 모달 상태를 관리하고 자식 컴포넌트에 제공합니다.
export const HeightModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isHeightModalOpen, setIsHeightModalOpen] = useState<boolean>(false);

  const value = React.useMemo(
    () => ({ isHeightModalOpen, setIsHeightModalOpen }),
    [isHeightModalOpen]
  );

  return (
    <HeightModalContext.Provider value={value}>
      {children}
    </HeightModalContext.Provider>
  );
};

// HeightModalContext를 쉽게 사용할 수 있도록 커스텀 훅을 제공합니다.
export const useHeightModal = () => {
  const context = useContext(HeightModalContext);
  if (context === undefined) {
    throw new Error('useHeightModal must be used within a HeightModalProvider');
  }
  return context;
};
