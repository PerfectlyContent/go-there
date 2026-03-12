import { motion } from 'framer-motion';
import { vibes, vibeAvailability, relationships } from '../utils/storage';
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

// Material icon, colors, and aura config per vibe
const vibeStyles = {
  deep: {
    icon: 'waves',
    iconColor: 'rgba(56, 189, 248, 0.8)',
    aura: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
  },
  funny: {
    icon: 'mood',
    iconColor: 'rgba(251, 191, 36, 0.8)',
    aura: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
  },
  nostalgic: {
    icon: 'settings_backup_restore',
    iconColor: 'rgba(168, 85, 247, 0.8)',
    aura: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
  },
  daring: {
    icon: 'local_fire_department',
    iconColor: 'rgba(239, 68, 68, 0.8)',
    aura: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.15) 0%, transparent 70%)',
  },
  flirty: {
    icon: 'favorite',
    iconColor: 'rgba(244, 114, 182, 1)',
    aura: 'radial-gradient(circle at center, rgba(244, 114, 182, 0.25) 0%, transparent 70%)',
  },
  real: {
    icon: 'eco',
    iconColor: 'rgba(52, 211, 153, 0.8)',
    aura: 'radial-gradient(circle at center, rgba(52, 211, 153, 0.15) 0%, transparent 70%)',
  },
  mixed: {
    icon: 'casino',
    iconColor: 'rgba(139, 92, 246, 0.8)',
    aura: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
  },
};

function VibeScreen({ relationship, onSelect, onBack }) {
  const availableVibes = vibeAvailability[relationship] || [];
  const filteredVibes = vibes.filter((v) => availableVibes.includes(v.id));
  const relConfig = relationships.find((r) => r.id === relationship);

  return (
    <Background preset="relationship">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="flex flex-col"
        style={{ minHeight: '100dvh' }}
      >
        {/* Top Nav — matches RelationshipScreen */}
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

        {/* Header — matches RelationshipScreen style */}
        <header className="px-6 pt-2 pb-6">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[28px] font-bold leading-[1.15] tracking-tight text-gray-900 mb-1"
          >
            What's the <span style={{ color: '#8B5CF6' }}>vibe?</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-gray-400 text-[15px] font-medium"
          >
            {relConfig ? `${relConfig.emoji} ${relConfig.label} — pick the mood` : 'Select the mood for your questions'}
          </motion.p>
        </header>

        {/* Vibe Grid */}
        <motion.main
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-4 px-6 pb-40"
        >
          {filteredVibes.map((vibe) => {
            const style = vibeStyles[vibe.id] || vibeStyles.deep;
            return (
              <motion.button
                key={vibe.id}
                variants={item}
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelect(vibe.id)}
                className="relative cursor-pointer rounded-2xl aspect-square flex flex-col items-center justify-center p-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
                }}
              >
                {/* Aura background */}
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: style.aura }}
                />

                <div className="z-10 flex flex-col items-center gap-3">
                  {/* Blur glow behind icon */}
                  <div
                    className="w-16 h-16 rounded-full blur-2xl opacity-20 absolute"
                    style={{ background: style.iconColor }}
                  />
                  <span
                    className="material-symbols-outlined text-4xl mb-2"
                    style={{
                      color: style.iconColor,
                      transform: 'scale(1.25)',
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    {style.icon}
                  </span>
                  <span className="font-semibold text-slate-700">{vibe.label}</span>
                </div>
              </motion.button>
            );
          })}
        </motion.main>
      </motion.div>
    </Background>
  );
}

export default VibeScreen;
