import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTotalQuestionsViewed } from '../utils/storage';
import Background from './Background';

function HomeScreen({ state, onStart, onSaved, onJourney }) {
  const totalViewed = getTotalQuestionsViewed(state);
  const savedCount = state.savedQuestions?.length || 0;
  const streak = state.streak || 0;

  // First-time onboarding tooltip
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !localStorage.getItem('go-there-onboarded');
    } catch { return false; }
  });

  useEffect(() => {
    if (showOnboarding) {
      const timer = setTimeout(() => {
        setShowOnboarding(false);
        try { localStorage.setItem('go-there-onboarded', '1'); } catch {}
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showOnboarding]);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    try { localStorage.setItem('go-there-onboarded', '1'); } catch {}
  };

  return (
    <Background preset="home">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="flex flex-col items-center justify-center px-6 py-12"
      style={{ minHeight: '100dvh' }}
    >
      {/* Brand */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          className="mb-5"
        >
          <span className="text-5xl">💬</span>
        </motion.div>
        <motion.h1
          className="text-5xl font-bold mb-2 text-gray-900"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          Go There
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-base text-gray-400"
          style={{ letterSpacing: '0.02em' }}
        >
          questions that spark great conversations
        </motion.p>
      </motion.div>

      {/* Stats card */}
      {totalViewed > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-2xl px-6 py-4 mb-6 w-full max-w-xs"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalViewed}</p>
              <p className="text-xs text-gray-400 mt-0.5">questions explored</p>
            </div>
            <div className="flex gap-4">
              {streak > 0 && (
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                    <span className="streak-flame text-base">🔥</span>{streak}
                  </p>
                  <p className="text-xs text-gray-400">streak</p>
                </div>
              )}
              {savedCount > 0 && (
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                    <span className="text-base">❤️</span>{savedCount}
                  </p>
                  <p className="text-xs text-gray-400">saved</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="w-full max-w-xs mb-4"
      >
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => { dismissOnboarding(); onStart(); }}
            className="w-full py-4.5 rounded-2xl text-lg font-semibold text-white cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.35)',
              minHeight: 56,
              padding: '18px 0',
            }}
          >
            Let's Go
          </motion.button>

          {/* Onboarding tooltip */}
          <AnimatePresence>
            {showOnboarding && totalViewed === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ delay: 0.8, duration: 0.3 }}
                className="absolute -bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap"
                onClick={dismissOnboarding}
              >
                <div
                  className="px-4 py-2.5 bg-gray-800 text-white text-sm rounded-xl relative"
                  style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                >
                  <div
                    className="absolute -top-1.5 left-1/2 w-3 h-3 bg-gray-800"
                    style={{ transform: 'translateX(-50%) rotate(45deg)' }}
                  />
                  Pick who you're with, then a vibe!
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Secondary actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex gap-3 w-full max-w-xs mt-2"
      >
        {savedCount > 0 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onSaved}
            className="flex-1 px-4 py-3.5 rounded-2xl text-sm font-medium text-gray-600 bg-white cursor-pointer"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minHeight: 48 }}
          >
            ❤️ Saved
          </motion.button>
        )}
        {totalViewed > 0 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onJourney}
            className="flex-1 px-4 py-3.5 rounded-2xl text-sm font-medium text-gray-600 bg-white cursor-pointer"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minHeight: 48 }}
          >
            🗺️ Journey
          </motion.button>
        )}
      </motion.div>
    </motion.div>
    </Background>
  );
}

export default HomeScreen;
