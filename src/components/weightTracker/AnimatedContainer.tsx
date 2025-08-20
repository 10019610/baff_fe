import React from 'react';
import { motion } from 'motion/react';

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}

export default function AnimatedContainer({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  direction = 'up'
}: AnimatedContainerProps) {
  const getInitialState = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: 20 };
      case 'down':
        return { opacity: 0, y: -20 };
      case 'left':
        return { opacity: 0, x: 20 };
      case 'right':
        return { opacity: 0, x: -20 };
      case 'fade':
        return { opacity: 0 };
      default:
        return { opacity: 0, y: 20 };
    }
  };

  const getAnimateState = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { opacity: 1, y: 0 };
      case 'left':
      case 'right':
        return { opacity: 1, x: 0 };
      case 'fade':
        return { opacity: 1 };
      default:
        return { opacity: 1, y: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialState()}
      animate={getAnimateState()}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}