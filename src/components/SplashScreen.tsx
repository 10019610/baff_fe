import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useIsMobile } from '../components/ui/use-mobile';

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // 모바일이 아니면 스플래시 화면을 보여주지 않음
    if (!isMobile) return;

    // 이미 한번 보여줬다면 스플래시 화면을 보여주지 않음
    const hasShownSplash = sessionStorage.getItem('hasShownSplash');
    if (hasShownSplash) return;

    setShow(true);
    sessionStorage.setItem('hasShownSplash', 'true');

    // 1초 후에 스플래시 화면 숨김
    const timer = setTimeout(() => {
      setShow(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [isMobile]);

  if (!isMobile) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white flex flex-col items-center justify-between z-50 py-20"
        >
          <motion.img
            src="/landing_logo3.gif"
            alt="Welcome"
            className="w-80 h-80 object-contain"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.img
            src="/company_logo.png"
            alt="Company"
            className="w-24 object-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
