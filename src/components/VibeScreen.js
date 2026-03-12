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
    gradient: 'from-blue-400 to-teal-500',
    aura: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
  },
  funny: {
    icon: 'mood',
    iconColor: 'rgba(251, 191, 36, 0.8)',
    gradient: 'from-yellow-400 to-orange-500',
    aura: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
  },
  nostalgic: {
    icon: 'settings_backup_restore',
    iconColor: 'rgba(168, 85, 247, 0.8)',
    gradient: 'from-purple-400 to-pink-500',
    aura: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
  },
  daring: {
    icon: 'local_fire_department',
    iconColor: 'rgba(239, 68, 68, 0.8)',
    gradient: 'from-red-400 to-orange-600',
    aura: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.15) 0%, transparent 70%)',
  },
  flirty: {
    icon: 'favorite',
    iconColor: 'rgba(244, 114, 182, 1)',
    gradient: 'from-pink-400 to-rose-500',
    aura: 'radial-gradient(circle at center, rgba(244, 114, 182, 0.25) 0%, transparent 70%)',
  },
  real: {
    icon: 'eco',
    iconColor: 'rgba(52, 211, 153, 0.8)',
    gradient: 'from-emerald-400 to-teal-500',
    aura: 'radial-gradient(circle at center, rgba(52, 211, 153, 0.15) 0%, transparent 70%)',
  },
  mixed: {
    icon: 'casino',
    iconColor: 'rgba(139, 92, 246, 0.8)',
    gradient: 'from-violet-400 to-purple-500',
    aura: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
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
        className="relative flex flex-col h-full max-w-md mx-auto px-6 py-8 justify-between"
        style={{ height: '100dvh', overflow: 'hidden' }}
      >
        {/* Header */}
        <header className="w-full space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 cursor-pointer active:scale-95 transition-transform"
              style={{ minHeight: 44, minWidth: 44 }}
            >
              <span className="material-symbols-outlined text-slate-600">arrow_back</span>
            </button>
            <div className="w-10" />
          </div>

          <motion.div
            className="text-center space-y-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1
              className="text-4xl text-slate-900 leading-tight"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              What's the vibe?
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {relConfig ? `${relConfig.emoji} ${relConfig.label}` : 'Select the mood for your questions'}
            </p>
          </motion.div>
        </header>

        {/* Vibe Grid */}
        <motion.main
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-4 py-6 flex-1 content-center"
        >
          {filteredVibes.map((vibe) => {
            const style = vibeStyles[vibe.id] || vibeStyles.deep;
            return (
              <motion.button
                key={vibe.id}
                variants={item}
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelect(vibe.id)}
                className="relative group cursor-pointer bg-white rounded-2xl aspect-square flex flex-col items-center justify-center p-4"
                style={{
                  border: '1px solid rgba(0,0,0,0.05)',
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
                    style={{
                      background: `linear-gradient(to bottom right, ${style.iconColor}, ${style.iconColor})`,
                    }}
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
