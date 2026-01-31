import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, animate } from 'framer-motion';
import questions from '../data/questions';
import ProgressRing from './ProgressRing';
import Confetti from './Confetti';
import {
  markQuestionSeen,
  saveQuestion,
  isQuestionSaved,
  getSeenCount,
  getNextUnseenIndex,
  incrementStreakIfQualified,
  saveState,
  vibes,
  relationships,
  vibeColors,
  vibeAvailability,
  dismissFirstUse,
  getTotalQuestionsViewed,
} from '../utils/storage';

// Rotating micro-copy prompts
const encouragingPrompts = [
  "This one's good...",
  "Ready for the next?",
  "Keep going!",
  "You're on a roll",
  "Good question, right?",
  "Let that one sit...",
  "Swipe when ready",
];

// Seed-based deterministic "rare" check (~1 in 15)
function isRareCard(relationship, vibe, index) {
  const hash = (relationship + vibe + index).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return hash % 15 === 0;
}

// Seeded shuffle for deterministic mixed order
function seededShuffle(arr, seed) {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function QuestionCard({ relationship, vibe, state, setState, onBack, onBadgeCheck }) {
  // Build question list — for mixed, combine all available vibes
  const mixedQuestionList = useMemo(() => {
    if (vibe !== 'mixed') return null;
    const available = vibeAvailability[relationship]?.filter(v => v !== 'mixed') || [];
    const combined = [];
    available.forEach(v => {
      const qs = questions[relationship]?.[v] || [];
      qs.forEach(q => combined.push({ text: q, sourceVibe: v }));
    });
    const seed = relationship.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return seededShuffle(combined, seed);
  }, [relationship, vibe]);

  const questionList = vibe === 'mixed'
    ? (mixedQuestionList || []).map(q => q.text)
    : (questions[relationship]?.[vibe] || []);
  const totalQuestions = questionList.length;
  const stateRef = useRef(state);
  stateRef.current = state;

  const [currentIndex, setCurrentIndex] = useState(() => getNextUnseenIndex(state, relationship, vibe, totalQuestions));
  const [showHint, setShowHint] = useState(state.firstUse);
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [exitDirection, setExitDirection] = useState(null); // 'left' | 'right' | null
  const [cardKey, setCardKey] = useState(0); // Forces AnimatePresence re-render
  const [swipeCount, setSwipeCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('go-there-swipe-count') || '0', 10);
    } catch { return 0; }
  });
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [sessionStats, setSessionStats] = useState({ viewed: 0, saved: 0 });
  const [heartParticles, setHeartParticles] = useState([]);
  const [heartPulse, setHeartPulse] = useState(false);
  const [milestoneToast, setMilestoneToast] = useState(null);

  const currentQuestion = questionList[currentIndex];
  const currentSourceVibe = (vibe === 'mixed' && mixedQuestionList?.[currentIndex])
    ? mixedQuestionList[currentIndex].sourceVibe
    : vibe;
  const vibeConfig = vibes.find((v) => v.id === currentSourceVibe);
  const relConfig = relationships.find((r) => r.id === relationship);
  const colors = vibeColors[currentSourceVibe] || vibeColors.deep;

  const seenCount = getSeenCount(state, relationship, vibe);
  const progress = (seenCount / totalQuestions) * 100;
  const rare = useMemo(() => isRareCard(relationship, vibe, currentIndex), [relationship, vibe, currentIndex]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  // Direction hint icons
  const rightHintOpacity = useTransform(x, [0, 60], [0, 1]);
  const leftHintOpacity = useTransform(x, [-60, 0], [1, 0]);
  const upHintOpacity = useTransform(y, [-60, 0], [1, 0]);
  const downHintOpacity = useTransform(y, [0, 60], [0, 1]);

  // Micro-copy: rotate after 3+ swipes
  const microCopy = useMemo(() => {
    if (swipeCount < 3) return null; // show nothing, the hint handles first-timers
    return encouragingPrompts[swipeCount % encouragingPrompts.length];
  }, [swipeCount]);

  useEffect(() => {
    setSaved(isQuestionSaved(state, currentQuestion, relationship, vibe));
  }, [currentQuestion, relationship, vibe, state]);

  const toast = useCallback((msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, []);

  // Milestone celebrations
  const checkMilestone = useCallback((newSeenCount) => {
    const milestones = [10, 25, 50];
    const totalSeen = getTotalQuestionsViewed(stateRef.current);
    for (const m of milestones) {
      if (totalSeen === m || newSeenCount === m) {
        const msgs = {
          10: "10 questions explored!",
          25: "Halfway there!",
          50: "50 questions deep!",
        };
        setMilestoneToast(msgs[m] || `${m} questions!`);
        setTimeout(() => setMilestoneToast(null), 3000);
        break;
      }
    }
  }, []);

  const goNext = useCallback((direction = 'right') => {
    // Mark current question as seen
    const currentState = stateRef.current;
    let newState = markQuestionSeen(currentState, relationship, vibe, currentIndex);
    newState = incrementStreakIfQualified(newState);
    saveState(newState);
    setState(newState);
    if (onBadgeCheck) onBadgeCheck(newState);

    // Track swipe count
    const newSwipeCount = swipeCount + 1;
    setSwipeCount(newSwipeCount);
    try { localStorage.setItem('go-there-swipe-count', String(newSwipeCount)); } catch {}

    // Session stats
    setSessionStats(prev => ({ ...prev, viewed: prev.viewed + 1 }));

    // Check completion using fresh state
    const newSeenCount = (newState.seen[relationship]?.[vibe]?.length) || 0;
    checkMilestone(newSeenCount);

    if (newSeenCount >= totalQuestions) {
      setShowCompletion(true);
      return;
    }

    // Find next unseen question
    const seen = newState.seen[relationship]?.[vibe] || [];
    let nextIdx = (currentIndex + 1) % totalQuestions;
    for (let i = 0; i < totalQuestions; i++) {
      const candidate = (currentIndex + 1 + i) % totalQuestions;
      if (!seen.includes(candidate)) {
        nextIdx = candidate;
        break;
      }
    }

    // Animate card flying off
    setExitDirection(direction);
    setTimeout(() => {
      x.set(0);
      y.set(0);
      setCurrentIndex(nextIdx);
      setCardKey(k => k + 1);
      setExitDirection(null);
    }, 250);
  }, [relationship, vibe, currentIndex, totalQuestions, setState, onBadgeCheck, x, y, swipeCount, checkMilestone]);

  const handleSave = useCallback(() => {
    if (!saved) {
      const newState = saveQuestion(stateRef.current, currentQuestion, relationship, vibe);
      setState(newState);
      setSaved(true);
      setSessionStats(prev => ({ ...prev, saved: prev.saved + 1 }));

      // Heart animation: pulse + particles
      setHeartPulse(true);
      setTimeout(() => setHeartPulse(false), 600);

      // Particle burst
      const particles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        angle: (i * 60) + Math.random() * 30,
      }));
      setHeartParticles(particles);
      setTimeout(() => setHeartParticles([]), 800);

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      toast('Saved');
    }
  }, [saved, currentQuestion, relationship, vibe, setState, toast]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: currentQuestion,
          title: 'Go There',
        });
        toast('Shared!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(currentQuestion);
            toast('Copied to clipboard!');
          }
        }
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(currentQuestion);
      toast('Copied to clipboard!');
    }
  }, [currentQuestion, toast]);

  const dismissHint = useCallback(() => {
    if (showHint) {
      setShowHint(false);
      const newState = dismissFirstUse(stateRef.current);
      setState(newState);
    }
  }, [showHint, setState]);

  const handleDragEnd = useCallback(
    (_, info) => {
      const { offset, velocity } = info;
      const swipeThresholdX = Math.min(window.innerWidth * 0.2, 100);
      const swipeThresholdY = Math.min(window.innerHeight * 0.15, 80);
      const velocityThreshold = 300;

      // Swipe right = next
      if (offset.x > swipeThresholdX || velocity.x > velocityThreshold) {
        dismissHint();
        goNext('right');
        return;
      }

      // Swipe left = save + next (Tinder-style)
      if (offset.x < -swipeThresholdX || velocity.x < -velocityThreshold) {
        dismissHint();
        handleSave();
        // After saving, animate left and go to next
        animate(x, -window.innerWidth, { duration: 0.25 });
        setTimeout(() => {
          goNext('left');
        }, 100);
        return;
      }

      // Swipe up = share
      if (offset.y < -swipeThresholdY || velocity.y < -velocityThreshold) {
        handleShare();
        x.set(0);
        y.set(0);
        return;
      }

      // Swipe down = back
      if (offset.y > swipeThresholdY || velocity.y > velocityThreshold) {
        // Show session summary if they've viewed questions
        if (sessionStats.viewed > 0) {
          setShowSessionSummary(true);
        } else {
          onBack();
        }
        return;
      }

      // Snap back
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 });
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 25 });
    },
    [goNext, handleSave, handleShare, onBack, dismissHint, x, y, sessionStats]
  );

  const handleBackClick = useCallback(() => {
    if (sessionStats.viewed > 0) {
      setShowSessionSummary(true);
    } else {
      onBack();
    }
  }, [sessionStats, onBack]);

  const bgStyle = {
    deep: 'linear-gradient(160deg, #DDD6FE 0%, #C4B5FD 40%, #DDD6FE 70%, #EDE9FE 100%)',
    funny: 'linear-gradient(160deg, #FEF3C7 0%, #FDE68A 40%, #FEF3C7 70%, #FFFBEB 100%)',
    nostalgic: 'linear-gradient(160deg, #FFEDD5 0%, #FDBA74 40%, #FFEDD5 70%, #FFF7ED 100%)',
    daring: 'linear-gradient(160deg, #FECDD3 0%, #FDA4AF 40%, #FECDD3 70%, #FFF1F2 100%)',
    flirty: 'linear-gradient(160deg, #FBCFE8 0%, #F9A8D4 40%, #FBCFE8 70%, #FDF2F8 100%)',
    real: 'linear-gradient(160deg, #A7F3D0 0%, #6EE7B7 40%, #A7F3D0 70%, #D1FAE5 100%)',
    mixed: 'linear-gradient(160deg, #EDE9FE 0%, #DDD6FE 40%, #EDE9FE 70%, #F5F3FF 100%)',
  };

  const bgBlobs = {
    deep: [
      { color: 'rgba(167, 139, 250, 0.15)', size: 240, x: '70%', y: '20%' },
      { color: 'rgba(196, 181, 253, 0.10)', size: 200, x: '10%', y: '70%' },
    ],
    funny: [
      { color: 'rgba(253, 224, 71, 0.12)', size: 260, x: '15%', y: '25%' },
      { color: 'rgba(251, 191, 36, 0.08)', size: 200, x: '75%', y: '65%' },
    ],
    nostalgic: [
      { color: 'rgba(251, 146, 60, 0.10)', size: 240, x: '65%', y: '15%' },
      { color: 'rgba(253, 186, 116, 0.08)', size: 220, x: '20%', y: '60%' },
    ],
    daring: [
      { color: 'rgba(251, 113, 133, 0.12)', size: 250, x: '75%', y: '30%' },
      { color: 'rgba(244, 63, 94, 0.06)', size: 200, x: '10%', y: '65%' },
    ],
    flirty: [
      { color: 'rgba(244, 114, 182, 0.12)', size: 260, x: '20%', y: '20%' },
      { color: 'rgba(236, 72, 153, 0.06)', size: 200, x: '70%', y: '70%' },
    ],
    real: [
      { color: 'rgba(52, 211, 153, 0.10)', size: 240, x: '65%', y: '25%' },
      { color: 'rgba(110, 231, 183, 0.08)', size: 220, x: '15%', y: '60%' },
    ],
    mixed: [
      { color: 'rgba(139, 92, 246, 0.12)', size: 250, x: '70%', y: '20%' },
      { color: 'rgba(167, 139, 250, 0.08)', size: 210, x: '15%', y: '65%' },
    ],
  };

  const blobs = bgBlobs[currentSourceVibe] || bgBlobs[vibe] || [];

  // Card exit animation variants
  const cardVariants = {
    enter: {
      scale: 0.9,
      opacity: 0,
      y: 30,
    },
    center: {
      scale: 1,
      opacity: 1,
      x: 0,
      y: 0,
    },
    exitRight: {
      x: window.innerWidth + 100,
      opacity: 0,
      rotate: 20,
      transition: { duration: 0.25, ease: 'easeIn' },
    },
    exitLeft: {
      x: -window.innerWidth - 100,
      opacity: 0,
      rotate: -20,
      transition: { duration: 0.25, ease: 'easeIn' },
    },
  };

  // Session summary modal
  if (showSessionSummary) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center px-6 relative"
        style={{ background: bgStyle[currentSourceVibe] || bgStyle[vibe], minHeight: '100dvh', overflow: 'hidden' }}
      >
        {blobs.map((blob, i) => (
          <div
            key={i}
            className="blob-float absolute rounded-full pointer-events-none"
            style={{
              width: blob.size,
              height: blob.size,
              left: blob.x,
              top: blob.y,
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
              filter: 'blur(40px)',
              animationDuration: `${18 + i * 4}s`,
            }}
          />
        ))}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}
        >
          <div className="text-4xl mb-4">
            {sessionStats.viewed >= 10 ? '🌟' : '💬'}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nice session!</h2>
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600 text-sm">Questions explored</span>
              <span className="font-bold text-gray-900">{sessionStats.viewed}</span>
            </div>
            {sessionStats.saved > 0 && (
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600 text-sm">Saved favorites</span>
                <span className="font-bold text-gray-900">{sessionStats.saved}</span>
              </div>
            )}
            {state.streak > 0 && (
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600 text-sm">Current streak</span>
                <span className="font-bold text-gray-900">{state.streak} days</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setShowSessionSummary(false); }}
              className="w-full px-6 py-4 rounded-full text-sm font-semibold text-white cursor-pointer"
              style={{ backgroundColor: colors.card, boxShadow: `0 4px 15px ${colors.card}40` }}
            >
              Keep Going
            </button>
            <button
              onClick={onBack}
              className="w-full px-6 py-3 rounded-full text-sm font-medium text-gray-500 cursor-pointer bg-gray-100 active:bg-gray-200"
            >
              Switch Vibe
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (showCompletion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center px-6 relative"
        style={{ background: bgStyle[currentSourceVibe] || bgStyle[vibe], minHeight: '100dvh', overflow: 'hidden' }}
      >
        {blobs.map((blob, i) => (
          <div
            key={i}
            className="blob-float absolute rounded-full pointer-events-none"
            style={{
              width: blob.size,
              height: blob.size,
              left: blob.x,
              top: blob.y,
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
              filter: 'blur(40px)',
              animationDuration: `${18 + i * 4}s`,
            }}
          />
        ))}
        <Confetti active={true} duration={4000} />
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">You went all the way!</h2>
          <p className="text-gray-600 mb-4">
            All {totalQuestions} {relConfig?.label} · {vibeConfig?.label} questions explored
          </p>
          {sessionStats.saved > 0 && (
            <p className="text-gray-500 mb-6 text-sm">
              You saved {sessionStats.saved} favorite{sessionStats.saved !== 1 ? 's' : ''}
            </p>
          )}
          <button
            onClick={onBack}
            className="px-8 py-4 bg-gray-900 text-white rounded-full font-semibold cursor-pointer"
            style={{ minHeight: 48 }}
          >
            Choose another vibe
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div
      className="flex flex-col relative"
      style={{ background: bgStyle[currentSourceVibe] || bgStyle[vibe], minHeight: '100dvh', overflow: 'hidden' }}
    >
      {/* Background blobs */}
      {blobs.map((blob, i) => (
        <div
          key={i}
          className="blob-float absolute rounded-full pointer-events-none"
          style={{
            width: blob.size,
            height: blob.size,
            left: blob.x,
            top: blob.y,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            filter: 'blur(40px)',
            animationDuration: `${18 + i * 4}s`,
            zIndex: 0,
          }}
        />
      ))}

      {/* Top bar */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1 z-10">
        <button
          onClick={handleBackClick}
          className="p-2.5 text-gray-500 cursor-pointer text-sm rounded-xl active:bg-black/5"
          style={{ minHeight: 44, minWidth: 44 }}
        >
          ← Back
        </button>
        <div
          className="px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${colors.card}15`,
            color: colors.text,
          }}
        >
          {relConfig?.label} · {vibeConfig?.label}
        </div>
        <div className="flex items-center gap-1.5">
          <ProgressRing progress={progress} size={36} strokeWidth={3} color={colors.card} />
          <span className="text-xs font-medium text-gray-500">
            {seenCount}/{totalQuestions}
          </span>
        </div>
      </div>

      {/* First-time hint OR micro-copy */}
      <AnimatePresence mode="wait">
        {showHint && swipeCount < 3 && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center px-6 py-2 text-sm text-gray-600 font-medium"
          >
            Swipe right for next, left to save
          </motion.div>
        )}
        {!showHint && microCopy && (
          <motion.div
            key={`micro-${swipeCount}`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center px-6 py-2 text-sm text-gray-500 italic"
          >
            {microCopy}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card stack area */}
      <div className="flex-1 flex items-center justify-center px-5 py-0 relative card-perspective">
        {/* Third card (deepest in stack) — peeks out bottom-left */}
        <div
          className="absolute stack-card"
          style={{
            '--card-accent': colors.card,
            width: 'calc(100% - 40px)',
            maxWidth: 412,
            height: 260,
            top: '50%',
            left: '50%',
            transform: 'translate(calc(-50% - 4px), calc(-50% + 18px)) rotate(-2deg)',
            opacity: 0.5,
            transition: 'all 0.3s ease',
            zIndex: 1,
          }}
        />
        {/* Second card — peeks out bottom-right */}
        <div
          className="absolute stack-card"
          style={{
            '--card-accent': colors.card,
            width: 'calc(100% - 40px)',
            maxWidth: 412,
            height: 260,
            top: '50%',
            left: '50%',
            transform: 'translate(calc(-50% + 3px), calc(-50% + 10px)) rotate(1.2deg)',
            opacity: 0.7,
            transition: 'all 0.3s ease',
            zIndex: 2,
          }}
        />

        {/* Swipe direction hints */}
        <motion.div
          style={{ opacity: rightHintOpacity }}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 pointer-events-none"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-medium"
            style={{ color: colors.card, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            Next →
          </div>
        </motion.div>
        <motion.div
          style={{ opacity: leftHintOpacity }}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 pointer-events-none"
        >
          <div className="bg-white/80 backdrop-blur-sm text-pink-600 rounded-full px-3 py-1.5 text-sm font-medium"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            ❤️ Save
          </div>
        </motion.div>
        <motion.div
          style={{ opacity: upHintOpacity }}
          className="absolute left-1/2 top-8 -translate-x-1/2 z-20 pointer-events-none"
        >
          <div className="bg-white/80 backdrop-blur-sm text-gray-600 rounded-full px-3 py-1.5 text-sm font-medium"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            📤 Share
          </div>
        </motion.div>
        <motion.div
          style={{ opacity: downHintOpacity }}
          className="absolute left-1/2 bottom-2 -translate-x-1/2 z-20 pointer-events-none"
        >
          <div className="bg-white/80 backdrop-blur-sm text-gray-500 rounded-full px-3 py-1.5 text-sm font-medium"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            ← Back
          </div>
        </motion.div>

        {/* Main card with AnimatePresence for enter/exit */}
        <AnimatePresence mode="popLayout" custom={exitDirection}>
          <motion.div
            key={`card-${cardKey}`}
            drag
            dragElastic={0.7}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit={exitDirection === 'left' ? 'exitLeft' : 'exitRight'}
            transition={{ type: 'spring', damping: 25, stiffness: 300, duration: 0.3 }}
            className={`question-card w-full max-w-[412px] relative z-10 cursor-grab active:cursor-grabbing select-none no-context-menu ${rare ? 'rare-card' : ''}`}
            style={{
              '--card-accent': colors.card,
              x,
              y,
              rotate,
              padding: '40px 32px 40px 36px',
              minHeight: 260,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              touchAction: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
            }}
          >
            {/* Rare card shimmer overlay */}
            {rare && (
              <div
                className="absolute inset-0 rounded-[16px] pointer-events-none overflow-hidden"
                style={{ zIndex: 1 }}
              >
                <div className="rare-shimmer" />
              </div>
            )}

            {/* Vibe icon */}
            <div
              className="absolute top-4 left-4 pointer-events-none"
              style={{ fontSize: '26px', zIndex: 2 }}
            >
              {vibeConfig?.emoji}
            </div>

            <p
              className="text-center font-semibold leading-relaxed relative"
              style={{
                fontSize: currentQuestion?.length > 100 ? '18px' : currentQuestion?.length > 70 ? '20px' : '22px',
                color: '#1A1A1A',
                lineHeight: 1.6,
                zIndex: 2,
                letterSpacing: '-0.01em',
              }}
            >
              {currentQuestion}
            </p>

            {/* Save heart indicator with animation */}
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: heartPulse ? [1, 1.4, 1] : 1 }}
                  exit={{ scale: 0 }}
                  transition={heartPulse ? { duration: 0.4, ease: 'easeOut' } : { type: 'spring', damping: 15 }}
                  className="absolute top-4 right-4 text-lg"
                  style={{ zIndex: 3 }}
                >
                  ❤️
                </motion.div>
              )}
            </AnimatePresence>

            {/* Heart particle burst */}
            {heartParticles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0.5],
                  x: Math.cos(particle.angle * Math.PI / 180) * 40,
                  y: Math.sin(particle.angle * Math.PI / 180) * 40,
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute top-4 right-4 text-xs pointer-events-none"
                style={{ zIndex: 3 }}
              >
                ❤️
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fallback buttons */}
      <div className="flex items-center justify-center gap-3 pb-6 pt-2 px-4 z-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-3.5 bg-white rounded-full text-sm font-medium cursor-pointer active:bg-gray-50 ${saved ? 'text-pink-500' : 'text-gray-700'}`}
          style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)', minHeight: 48 }}
        >
          <motion.span
            animate={heartPulse ? { scale: [1, 1.5, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {saved ? '❤️' : '🤍'}
          </motion.span>
          Save
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleShare}
          className="flex items-center gap-2 px-5 py-3.5 bg-white rounded-full text-sm font-medium text-gray-700 cursor-pointer active:bg-gray-50"
          style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)', minHeight: 48 }}
        >
          📤 Share
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { dismissHint(); goNext('right'); }}
          className="flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-white cursor-pointer"
          style={{
            backgroundColor: colors.card,
            boxShadow: `0 4px 15px ${colors.card}40`,
            minHeight: 48,
          }}
        >
          Next →
        </motion.button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-800 text-white rounded-full text-sm font-medium z-50"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)', bottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone toast */}
      <AnimatePresence>
        {milestoneToast && (
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold z-50"
            style={{ boxShadow: '0 4px 20px rgba(234, 179, 8, 0.3)' }}
          >
            🎉 {milestoneToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default QuestionCard;
