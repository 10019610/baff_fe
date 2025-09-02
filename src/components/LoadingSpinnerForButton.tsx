import { motion } from 'motion/react';

const LoadingSpinnerForButton = ({ size = 20, color = '#000000' }) => {
  return (
    <motion.div style={{
      width: size,
      height: size,
      border: '3px solid rgba(0, 0, 128, 0.2)',
      borderTop: `3px solid ${color}`,
      borderRadius: '50%',
      display: 'inline-block',
      boxSizing: 'border-box',
    }} animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="mr-2">
    </motion.div>
  );
};

export default LoadingSpinnerForButton;
