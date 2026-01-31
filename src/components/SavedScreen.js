import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { unsaveQuestion, vibes, relationships } from '../utils/storage';
import Background from './Background';

function SavedQuestionCard({ sq, onRemove, onShare, getVibeColor, getVibeLabel, getRelLabel }) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, -50, 0], [0.5, 0.9, 1]);
  const deleteOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);

  const handleDragEnd = useCallback((_, info) => {
    if (info.offset.x < -80 || info.velocity.x < -300) {
      // Swipe left - delete
      animate(x, -400, { duration: 0.25 });
      setTimeout(() => onRemove(sq), 250);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 });
    }
  }, [sq, onRemove, x]);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete background */}
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-0 bg-red-50 rounded-2xl flex items-center justify-end pr-6"
      >
        <span className="text-red-400 text-sm font-medium">Remove</span>
      </motion.div>

      {/* Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        className="bg-white rounded-2xl p-4 relative"
        style={{ x, opacity, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', touchAction: 'pan-y' }}
      >
        <p className="text-sm font-medium text-gray-800 mb-2.5 leading-relaxed">
          {sq.question}
        </p>
        <div className="flex gap-2.5 flex-wrap">
          <span
            className="text-sm px-3 py-1 rounded-full font-medium"
            style={{
              backgroundColor: `${getVibeColor(sq.vibe)}12`,
              color: getVibeColor(sq.vibe),
            }}
          >
            {getVibeLabel(sq.vibe)}
          </span>
          <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
            {getRelLabel(sq.relationship)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function SavedScreen({ state, setState, onBack }) {
  const [filterRelationship, setFilterRelationship] = useState('all');
  const [filterVibe, setFilterVibe] = useState('all');
  const [search, setSearch] = useState('');

  const savedQuestions = useMemo(() => state.savedQuestions || [], [state.savedQuestions]);

  const filtered = useMemo(() => {
    return savedQuestions.filter((sq) => {
      if (filterRelationship !== 'all' && sq.relationship !== filterRelationship) return false;
      if (filterVibe !== 'all' && sq.vibe !== filterVibe) return false;
      if (search && !sq.question.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [savedQuestions, filterRelationship, filterVibe, search]);

  const handleRemove = useCallback((sq) => {
    const newState = unsaveQuestion(state, sq.question, sq.relationship, sq.vibe);
    setState(newState);
  }, [state, setState]);

  const handleShare = useCallback(async (question) => {
    if (navigator.share) {
      try {
        await navigator.share({ text: question, title: 'Go There' });
      } catch (err) {
        if (err.name !== 'AbortError' && navigator.clipboard) {
          navigator.clipboard.writeText(question);
        }
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(question);
    }
  }, []);

  const getVibeColor = useCallback((vibeId) => {
    const v = vibes.find((vb) => vb.id === vibeId);
    return v?.color || '#6B7280';
  }, []);

  const getRelLabel = useCallback((relId) => {
    const r = relationships.find((rel) => rel.id === relId);
    return r ? `${r.emoji} ${r.label}` : relId;
  }, []);

  const getVibeLabel = useCallback((vibeId) => {
    const v = vibes.find((vb) => vb.id === vibeId);
    return v ? `${v.emoji} ${v.label}` : vibeId;
  }, []);

  return (
    <Background preset="saved">
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
        <h2 className="text-2xl font-bold text-gray-900 flex-1">Saved Questions</h2>
        <span className="text-sm text-gray-400">{savedQuestions.length}</span>
      </div>

      {/* Search - font-size 16px prevents iOS zoom */}
      <input
        type="text"
        placeholder="Search saved questions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3.5 rounded-xl bg-white text-gray-800 mb-4 outline-none"
        style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #E5E7EB',
          fontSize: 16,
          minHeight: 48,
        }}
      />

      {/* Filters - more visual separation */}
      <div className="flex gap-3 mb-4 overflow-x-auto pb-2 -mx-1 px-1">
        <select
          value={filterRelationship}
          onChange={(e) => setFilterRelationship(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 cursor-pointer flex-shrink-0 font-medium"
          style={{ fontSize: 16, minHeight: 44, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <option value="all">All People</option>
          {relationships.map((r) => (
            <option key={r.id} value={r.id}>
              {r.emoji} {r.label}
            </option>
          ))}
        </select>
        <select
          value={filterVibe}
          onChange={(e) => setFilterVibe(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 cursor-pointer flex-shrink-0 font-medium"
          style={{ fontSize: 16, minHeight: 44, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <option value="all">All Vibes</option>
          {vibes.map((v) => (
            <option key={v.id} value={v.id}>
              {v.emoji} {v.label}
            </option>
          ))}
        </select>
      </div>

      {/* Swipe hint for first time */}
      {filtered.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="text-xs text-gray-400 text-center mb-2"
        >
          Swipe left to remove
        </motion.p>
      )}

      {/* List - scrollable area */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-gray-400 text-base"
            >
              {savedQuestions.length === 0
                ? 'No saved questions yet. Start exploring!'
                : 'No questions match your filters'}
            </motion.div>
          ) : (
            filtered.map((sq, i) => (
              <motion.div
                key={`${sq.question}-${sq.relationship}-${sq.vibe}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -200, transition: { duration: 0.2 } }}
                transition={{ delay: i * 0.03 }}
              >
                <SavedQuestionCard
                  sq={sq}
                  onRemove={handleRemove}
                  onShare={handleShare}
                  getVibeColor={getVibeColor}
                  getVibeLabel={getVibeLabel}
                  getRelLabel={getRelLabel}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
    </Background>
  );
}

export default SavedScreen;
