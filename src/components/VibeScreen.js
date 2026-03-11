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

// Material icon, color, and aura config per vibe
const vibeStyles = {
  deep: {
    icon: 'water_drop',
    iconColor: '#3B82F6',
    bgColor: '#EFF6FF',
    aura: '0 0 20px rgba(37, 106, 244, 0.3)',
    borderTint: 'rgba(191, 219, 254, 0.5)',
  },
  funny: {
    icon: 'mood',
    iconColor: '#EAB308',
    bgColor: '#FEFCE8',
    aura: '0 0 20px rgba(251, 191, 36, 0.3)',
    borderTint: 'rgba(253, 230, 138, 0.5)',
  },
  nostalgic: {
    icon: 'cable',
    iconColor: '#A855F7',
    bgColor: '#FAF5FF',
    aura: '0 0 20px rgba(168, 85, 247, 0.3)',
    borderTint: 'rgba(221, 214, 254, 0.5)',
  },
  daring: {
    icon: 'local_fire_department',
    iconColor: '#EF4444',
    bgColor: '#FEF2F2',
    aura: '0 0 20px rgba(239, 68, 68, 0.3)',
    borderTint: 'rgba(254, 202, 202, 0.5)',
  },
  flirty: {
    icon: 'favorite',
    iconColor: '#EC4899',
    bgColor: '#FDF2F8',
    aura: '0 0 20px rgba(236, 72, 153, 0.3)',
    borderTint: 'rgba(251, 207, 232, 0.5)',
  },
  real: {
    icon: 'verified',
    iconColor: '#22C55E',
    bgColor: '#F0FDF4',
    aura: '0 0 20px rgba(34, 197, 94, 0.3)',
    borderTint: 'rgba(187, 247, 208, 0.5)',
  },
  mixed: {
    icon: 'casino',
    iconColor: '#8B5CF6',
    bgColor: '#F5F3FF',
    aura: '0 0 20px rgba(139, 92, 246, 0.3)',
    borderTint: 'rgba(221, 214, 254, 0.5)',
  },
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
        className="relative flex flex-col h-full max-w-md mx-auto px-6 py-8"
        style={{ minHeight: '100dvh' }}
      >
        {/* Header bar */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex size-10 items-center justify-center rounded-full bg-white/80 shadow-sm border border-slate-200 cursor-pointer active:scale-95 transition-transform"
            style={{ minHeight: 44, minWidth: 44 }}
          >
            <span className="material-symbols-outlined text-slate-600">arrow_back</span>
          </button>
          <h2 className="text-gray-900 text-lg font-semibold tracking-tight">
            What's the vibe?
          </h2>
          <div className="size-10" />
        </header>

        {/* Title section */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {relConfig ? `${relConfig.emoji} ${relConfig.label}` : ''} — choose a mood
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Select one to personalize your questions
          </p>
        </motion.div>

        {/* Grid of Vibe Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-4 flex-1 mb-8"
        >
          {filteredVibes.map((vibe) => {
            const style = vibeStyles[vibe.id] || vibeStyles.deep;
            return (
              <motion.button
                key={vibe.id}
                variants={item}
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelect(vibe.id)}
                className="relative flex flex-col items-center justify-center gap-3 rounded-xl p-5 transition-all cursor-pointer hover:scale-[1.02]"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: `1px solid ${style.borderTint}`,
                }}
              >
                <div
                  className="flex size-16 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: style.bgColor,
                    filter: `drop-shadow(${style.aura})`,
                  }}
                >
                  <span
                    className="material-symbols-outlined text-4xl"
                    style={{
                      color: style.iconColor,
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    {style.icon}
                  </span>
                </div>
                <span className="font-semibold text-slate-700">{vibe.label}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    </Background>
  );
}

export default VibeScreen;
