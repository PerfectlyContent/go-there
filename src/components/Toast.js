import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Toast({ message, visible, onHide, duration = 2000 }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide, duration]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            position: 'fixed',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9998,
          }}
          className="px-6 py-3 rounded-full bg-gray-800 text-white text-sm font-medium shadow-lg"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;
