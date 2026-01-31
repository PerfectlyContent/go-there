import { motion } from 'framer-motion';
import { relationships } from '../utils/storage';
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

// Soft background tints per relationship
const relTints = {
  partner: { bg: '#FDF2F8', border: '#FBCFE8' },
  friend: { bg: '#FFF7ED', border: '#FED7AA' },
  group: { bg: '#F5F3FF', border: '#DDD6FE' },
  parent: { bg: '#F0FDF4', border: '#BBF7D0' },
  sibling: { bg: '#FFFBEB', border: '#FDE68A' },
  kid: { bg: '#FEF3C7', border: '#FCD34D' },
  date: { bg: '#FDF4FF', border: '#F0ABFC' },
};

function RelationshipScreen({ onSelect, onBack }) {
  return (
    <Background preset="relationship">
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
        Who are you with?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-sm text-gray-400 text-center mb-6"
      >
        Pick the person you want to connect with
      </motion.p>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full pb-6"
      >
        {relationships.map((rel) => {
          const tint = relTints[rel.id] || { bg: '#FFFFFF', border: '#E5E7EB' };
          return (
            <motion.button
              key={rel.id}
              variants={item}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(rel.id)}
              className="flex flex-col items-center justify-center py-5 px-4 rounded-2xl cursor-pointer"
              style={{
                backgroundColor: tint.bg,
                border: `2px solid ${tint.border}`,
                minHeight: 110,
              }}
            >
              <span className="text-5xl mb-2.5">{rel.emoji}</span>
              <span className="text-base font-semibold text-gray-800">{rel.label}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
    </Background>
  );
}

export default RelationshipScreen;
