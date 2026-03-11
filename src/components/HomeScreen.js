import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTotalQuestionsViewed } from '../utils/storage';

function HomeScreen({ state, onStart, onSaved, onJourney }) {
  const totalViewed = getTotalQuestionsViewed(state);
  const savedCount = state.savedQuestions?.length || 0;

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="relative flex w-full flex-col bg-background-light overflow-hidden"
      style={{ height: '100dvh', maxHeight: '100dvh' }}
    >
      {/* Top Navigation Bar */}
      <header className="flex items-center bg-transparent px-6 pt-5 pb-3 justify-between shrink-0">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="text-primary flex size-12 shrink-0 items-center justify-center bg-primary/10 rounded-xl"
        >
          <span className="material-symbols-outlined text-3xl">auto_awesome</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-900 text-xl font-extrabold leading-tight tracking-tight flex-1 text-center pr-12"
        >
          Go There
        </motion.h2>
      </header>

      {/* Main Content Container */}
      <main className="flex flex-col flex-1 items-center justify-center px-6 max-w-2xl mx-auto w-full min-h-0 py-2">
        {/* Hero Image */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="w-full mb-5 flex-1 min-h-0"
          style={{ maxHeight: '45vh' }}
        >
          <div className="w-full h-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-3xl shadow-2xl shadow-primary/20 bg-gradient-to-tr from-primary/30 to-primary/10 border-4 border-white"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCKDUXSMirBRuknO37tQZdLCO91pY5jmO18X-4QMYsCIlAG-wEkUP9gUITsQwGEz7zcmkgGlHMCeBhh4jwQiGlPE-UKln-9cxXAtx3Nyg9hxapHMfpT8exXp-xjNpxC2gEMIa6-yx2fX8400wvht5J4Phx0NPHSDyjGb9OKAf8-CGn8cPLD-BNtkDfk_pZifA0y1c1q8K6vCRGPCfNGrBWFwS2jcDex84LinCXjtUW6x-4a9pfE0QZANDX62KQTZWas5alACLiYv_I")',
            }}
          />
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center space-y-3 max-w-md shrink-0"
        >
          <h1 className="text-slate-900 tracking-tight text-3xl md:text-4xl font-extrabold leading-[1.1]">
            Skip the Small Talk
          </h1>
          <p className="text-slate-600 text-base font-medium leading-relaxed px-2">
            Ready to dive deep? Ask the questions that actually matter and spark meaningful connections.
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full mt-6 mb-4 flex flex-col items-center shrink-0"
        >
          <div className="relative w-full flex justify-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => { dismissOnboarding(); onStart(); }}
              className="group relative flex w-full max-w-sm cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-primary text-white text-lg font-bold shadow-xl shadow-primary/30 transition-all"
            >
              <span className="relative z-10 flex items-center gap-2">
                Let's Go
                <span className="material-symbols-outlined">arrow_forward</span>
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
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

          {/* Bottom Decorative Hint */}
          <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm font-semibold uppercase tracking-widest">
            <span className="h-px w-8 bg-slate-300" />
            <span>Experience Meaning</span>
            <span className="h-px w-8 bg-slate-300" />
          </div>
        </motion.div>

        {/* Secondary actions */}
        {(savedCount > 0 || totalViewed > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex gap-3 w-full max-w-xs mb-2 shrink-0"
          >
            {savedCount > 0 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onSaved}
                className="flex-1 px-4 py-3.5 rounded-2xl text-sm font-medium text-slate-600 bg-white cursor-pointer"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minHeight: 48 }}
              >
                ❤️ Saved
              </motion.button>
            )}
            {totalViewed > 0 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onJourney}
                className="flex-1 px-4 py-3.5 rounded-2xl text-sm font-medium text-slate-600 bg-white cursor-pointer"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minHeight: 48 }}
              >
                🗺️ Journey
              </motion.button>
            )}
          </motion.div>
        )}
      </main>

      {/* Aesthetic Footer Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
    </motion.div>
  );
}

export default HomeScreen;
