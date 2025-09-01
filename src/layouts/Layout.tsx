import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Header from '../components/header/Header';
import Navbar from './Navbar.tsx';
import Footer from '../components/footer/Footer.tsx';
import { useHeightModal } from '../context/HeightModalContext';

const Layout = () => {
  const location = useLocation();
  const { isHeightModalOpen } = useHeightModal();

  // 페이지 전환 애니메이션
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: -20,
    },
  };

  const pageTransition = {
    type: 'tween' as const,
    ease: 'anticipate' as const,
    duration: 0.4,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 pb-4 md:pb-6">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            {/* Page Content with Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
      {/* navbar - 키 입력 모달이 열려있을 때는 숨김 */}
      {!isHeightModalOpen && <Navbar />}
    </div>
  );
};

export default Layout;
