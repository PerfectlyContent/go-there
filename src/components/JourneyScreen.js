import { motion } from 'framer-motion';
import {
  relationships,
  vibes,
  vibeAvailability,
  vibeColors,
  getTotalQuestionsViewed,
} from '../utils/storage';
import badges from '../data/badges';
import Background from './Background';

function JourneyScreen({ state, onBack, onSelectCombo }) {
  const totalViewed = getTotalQuestionsViewed(state);
  const totalPossible = Object.values(vibeAvailability).reduce(
    (sum, vibeList) => sum + vibeList.length * 20,
    0
  );

  const unlockedBadges = state.unlockedBadges || [];

  return (
    <Background preset="journey">
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex flex-col px-4 py-5"
      style={{ minHeight: '100dvh' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="p-2.5 text-gray-500 cursor-pointer text-sm rounded-xl active:bg-gray-100"
          style={{ minHeight: 44, minWidth: 44 }}
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-gray-900 flex-1">My Journey</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-8" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Overall stats */}
        <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="text-sm text-gray-500 mb-1">Questions explored</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalViewed} <span className="text-base font-normal text-gray-400">of {totalPossible}</span>
          </p>
          <div className="w-full h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(totalViewed / totalPossible) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: '#6366F1' }}
            />
          </div>
        </div>

        {/* Progress grid - responsive sizing */}
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress Grid</h3>
          <div className="bg-white rounded-2xl p-3 overflow-x-auto" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', WebkitOverflowScrolling: 'touch' }}>
            {/* Header row */}
            <div className="flex gap-1 mb-1.5" style={{ marginLeft: 72 }}>
              {vibes.map((v) => (
                <div
                  key={v.id}
                  className="text-center text-xs text-gray-400 flex-shrink-0"
                  style={{ width: 40 }}
                  title={v.label}
                >
                  {v.emoji}
                </div>
              ))}
            </div>

            {/* Relationship rows */}
            {relationships.map((rel) => {
              const available = vibeAvailability[rel.id];
              return (
                <div key={rel.id} className="flex items-center gap-1 mb-1">
                  <div className="text-xs text-gray-600 flex-shrink-0 truncate" style={{ width: 72 }}>
                    {rel.emoji} {rel.label}
                  </div>
                  {vibes.map((v) => {
                    const isAvailable = available.includes(v.id);
                    if (!isAvailable) {
                      return (
                        <div
                          key={v.id}
                          className="flex-shrink-0 rounded-lg bg-gray-50"
                          style={{ width: 40, height: 40 }}
                        />
                      );
                    }

                    const seen = state.seen[rel.id]?.[v.id]?.length || 0;
                    const isComplete = state.completed[rel.id]?.[v.id] || false;
                    const fillPercent = (seen / 20) * 100;
                    const color = vibeColors[v.id].card;

                    return (
                      <motion.button
                        key={v.id}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onSelectCombo(rel.id, v.id)}
                        className="flex-shrink-0 rounded-lg relative overflow-hidden cursor-pointer border-0 active:opacity-75"
                        style={{
                          width: 40,
                          height: 40,
                          backgroundColor: `${color}10`,
                          minHeight: 40,
                        }}
                        title={`${rel.label} · ${v.label}: ${seen}/20`}
                      >
                        {/* Fill bar */}
                        <div
                          className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                          style={{
                            height: `${fillPercent}%`,
                            backgroundColor: `${color}${isComplete ? 'FF' : '40'}`,
                          }}
                        />
                        {isComplete && (
                          <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                            ✓
                          </div>
                        )}
                        {!isComplete && seen > 0 && (
                          <div
                            className="absolute inset-0 flex items-center justify-center text-xs font-medium"
                            style={{ color }}
                          >
                            {seen}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Badges</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {badges.map((badge) => {
              const unlocked = unlockedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className="bg-white rounded-2xl p-3.5 text-center"
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    opacity: unlocked ? 1 : 0.4,
                  }}
                >
                  <div className="text-2xl mb-1">{unlocked ? badge.icon : '🔒'}</div>
                  <p className="text-xs font-medium text-gray-800 leading-tight">{badge.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak info */}
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3">
            <span className="text-3xl streak-flame">🔥</span>
            <div>
              <p className="font-bold text-lg text-gray-900">{state.streak || 0}-day streak</p>
              <p className="text-xs text-gray-400">View 3+ questions a day to keep it going</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    </Background>
  );
}

export default JourneyScreen;
