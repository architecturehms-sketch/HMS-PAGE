import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'motion/react';

export const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  
  // Spring configurations for smooth trailing effect
  const springConfig = { stiffness: 100, damping: 25, mass: 1.2 };
  const cursorXSpring = useSpring(-100, springConfig);
  const cursorYSpring = useSpring(-100, springConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      cursorXSpring.set(e.clientX);
      cursorYSpring.set(e.clientY);
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, [cursorXSpring, cursorYSpring]);

  return (
    <>
      {/* Primary Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: mousePosition.x - 3,
          y: mousePosition.y - 3,
        }}
        transition={{ type: 'tween', ease: 'linear', duration: 0 }}
      />
      
      {/* Trailing Circle */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-white rounded-full pointer-events-none z-[9998] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
    </>
  );
};
