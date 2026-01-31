import { motion } from 'framer-motion';
import { vibes, vibeAvailability, vibeColors, relationships } from '../utils/storage';
import Background from './Background';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Light backgrounds and borders per vibe
const vibeTints = {
  deep: { bg: '#EEF2FF', border: '#C7D2FE' },
  funny: { bg: '#FFFBEB', border: '#FDE68A' },
  nostalgic: { bg: '#FFF7ED', border: '#FED7AA' },
  daring: { bg: '#FFF1F2', border: '#FECDD3' },
  flirty: { bg: '#FDF2F8', border: '#FBCFE8' },
  real: { bg: '#ECFDF5', border: '#A7F3D0' },
  mixed: { bg: '#F5F3FF', border: '#DDD6FE' },
};

function VibeScreen({ relationship, onSelect, onBack }) {
  const availableVibes = vibeAvailability[relationship] || [];
  const filteredVibes = vibes.filter((v) => availableVibes.includes(v.id));
  const relConfig = relationships.find((r) => r.id === relationship);

  return (
    <Background preset="vibe">
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex flex-col px-5 py-6"
      style={{ minHeight: '100dvh' }}
    >
      {/* Top bar */}
      <div className="flex items-center mb-3">
        <button
          onClick={onBack}
          className="text-gray-400 text-sm font-medium cursor-pointer flex items-center gap-1.5 p-2 -ml-2 rounded-xl active:bg-gray-100"
          style={{ minHeight: 44, minWidth: 44 }}
        >
          <span>←</span> Back
        </button>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-bold text-gray-900 mb-2 text-center"
      >
        What's the vibe?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-sm text-gray-400 text-center mb-6"
      >
        {relConfig ? `${relConfig.emoji} ${relConfig.label}` : ''} — choose a mood
      </motion.p>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full pb-6"
      >
        {filteredVibes.map((vibe) => {
          const tint = vibeTints[vibe.id] || { bg: '#FFFFFF', border: '#E5E7EB' };
          const colors = vibeColors[vibe.id];
          return (
            <motion.button
              key={vibe.id}
              variants={item}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(vibe.id)}
              className="flex flex-col items-center justify-center py-5 px-4 rounded-2xl cursor-pointer"
              style={{
                backgroundColor: tint.bg,
                border: `2px solid ${tint.border}`,
                minHeight: 110,
              }}
            >
              <span className="text-5xl mb-2.5">{vibe.emoji}</span>
              <span className="text-base font-semibold" style={{ color: colors?.card || '#374151' }}>
                {vibe.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
    </Background>
  );
}

export default VibeScreen;
