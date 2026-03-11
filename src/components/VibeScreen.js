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

// Gradient icon backgrounds per vibe
const vibeIconGradients = {
  deep: { from: '#C7D2FE', to: '#EEF2FF' },
  funny: { from: '#FDE68A', to: '#FFFBEB' },
  nostalgic: { from: '#FED7AA', to: '#FFF7ED' },
  daring: { from: '#FECDD3', to: '#FFF1F2' },
  flirty: { from: '#FBCFE8', to: '#FDF2F8' },
  real: { from: '#A7F3D0', to: '#ECFDF5' },
  mixed: { from: '#DDD6FE', to: '#F5F3FF' },
};

// Subtitles per vibe
const vibeSubtitles = {
  deep: 'Meaningful conversations',
  funny: 'Laughs and good times',
  nostalgic: 'Trip down memory lane',
  daring: 'Bold and adventurous',
  flirty: 'Playful and sweet',
  real: 'Honest and raw',
  mixed: 'A bit of everything',
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
        className="flex flex-col"
        style={{ minHeight: '100dvh' }}
      >
        {/* Top Nav */}
        <nav className="flex items-center justify-between px-6 pt-8 pb-4 sticky top-0 z-50">
          <button
            onClick={onBack}
            className="flex items-center justify-center size-10 rounded-full cursor-pointer active:scale-95 transition-transform"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              minHeight: 44,
              minWidth: 44,
            }}
          >
            <span className="material-symbols-outlined text-[22px] text-gray-900">arrow_back_ios_new</span>
          </button>
          <div
            className="px-4 py-1.5 rounded-full"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
            }}
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-500">Go There</span>
          </div>
          <div className="size-10" />
        </nav>

        {/* Header */}
        <header className="px-6 pt-2 pb-6">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[28px] font-bold leading-[1.15] tracking-tight text-gray-900 mb-1"
          >
            What's the <span style={{ color: '#256af4' }}>vibe?</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-gray-400 text-[15px] font-medium"
          >
            {relConfig ? `${relConfig.emoji} ${relConfig.label}` : ''} — choose a mood
          </motion.p>
        </header>

        {/* Selection List */}
        <motion.main
          variants={container}
          initial="hidden"
          animate="show"
          className="px-6 pb-40 space-y-4"
        >
          {filteredVibes.map((vibe) => {
            const gradient = vibeIconGradients[vibe.id] || { from: '#F3F4F6', to: '#F9FAFB' };
            const colors = vibeColors[vibe.id];
            const subtitle = vibeSubtitles[vibe.id] || '';
            return (
              <motion.button
                key={vibe.id}
                variants={item}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(vibe.id)}
                className="w-full rounded-2xl p-5 flex items-center justify-between transition-all duration-300 cursor-pointer text-left"
                style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
                }}
              >
                <div className="flex items-center gap-5">
                  <div
                    className="size-16 rounded-xl flex items-center justify-center text-3xl"
                    style={{
                      background: `linear-gradient(to bottom right, ${gradient.from}, ${gradient.to})`,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      border: '1px solid white',
                    }}
                  >
                    {vibe.emoji}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{vibe.label}</h3>
                    {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
                  </div>
                </div>
                <div
                  className="size-6 rounded-full"
                  style={{
                    border: '2px solid #E2E8F0',
                  }}
                />
              </motion.button>
            );
          })}
        </motion.main>
      </motion.div>
    </Background>
  );
}

export default VibeScreen;
