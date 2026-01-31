import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import HomeScreen from './components/HomeScreen';
import RelationshipScreen from './components/RelationshipScreen';
import VibeScreen from './components/VibeScreen';
import QuestionCard from './components/QuestionCard';
import SavedScreen from './components/SavedScreen';
import JourneyScreen from './components/JourneyScreen';
import BadgeModal from './components/BadgeModal';
import {
  loadState,
  saveState,
  checkAndUpdateStreak,
  getTotalQuestionsViewed,
} from './utils/storage';
import badges from './data/badges';

function App() {
  const [state, setState] = useState(() => {
    const loaded = loadState();
    return checkAndUpdateStreak(loaded);
  });

  const [screen, setScreen] = useState('home');
  const [relationship, setRelationship] = useState(null);
  const [vibe, setVibe] = useState(null);
  const [pendingBadge, setPendingBadge] = useState(null);

  // Save state whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const checkBadges = useCallback(
    (newState) => {
      const stateForCheck = {
        ...newState,
        totalQuestionsViewed: getTotalQuestionsViewed(newState),
      };

      for (const badge of badges) {
        if (
          !newState.unlockedBadges.includes(badge.id) &&
          badge.check(stateForCheck)
        ) {
          const updated = {
            ...newState,
            unlockedBadges: [...newState.unlockedBadges, badge.id],
          };
          setState(updated);
          setPendingBadge(badge);
          return;
        }
      }
    },
    []
  );

  const handleStart = () => setScreen('relationship');

  const handleRelationshipSelect = (rel) => {
    setRelationship(rel);
    setScreen('vibe');
  };

  const handleVibeSelect = (v) => {
    setVibe(v);
    setScreen('question');
  };

  const handleBack = (target) => {
    if (target) {
      setScreen(target);
    } else {
      switch (screen) {
        case 'relationship':
          setScreen('home');
          break;
        case 'vibe':
          setScreen('relationship');
          break;
        case 'question':
          setScreen('vibe');
          break;
        case 'saved':
        case 'journey':
          setScreen('home');
          break;
        default:
          setScreen('home');
      }
    }
  };

  const handleSelectCombo = (rel, v) => {
    setRelationship(rel);
    setVibe(v);
    setScreen('question');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F5' }}>
      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <HomeScreen
            key="home"
            state={state}
            onStart={handleStart}
            onSaved={() => setScreen('saved')}
            onJourney={() => setScreen('journey')}
          />
        )}

        {screen === 'relationship' && (
          <RelationshipScreen
            key="relationship"
            onSelect={handleRelationshipSelect}
            onBack={() => handleBack()}
          />
        )}

        {screen === 'vibe' && (
          <VibeScreen
            key="vibe"
            relationship={relationship}
            onSelect={handleVibeSelect}
            onBack={() => handleBack()}
          />
        )}

        {screen === 'question' && relationship && vibe && (
          <QuestionCard
            key={`question-${relationship}-${vibe}`}
            relationship={relationship}
            vibe={vibe}
            state={state}
            setState={setState}
            onBack={() => handleBack('vibe')}
            onBadgeCheck={checkBadges}
          />
        )}

        {screen === 'saved' && (
          <SavedScreen
            key="saved"
            state={state}
            setState={setState}
            onBack={() => handleBack()}
          />
        )}

        {screen === 'journey' && (
          <JourneyScreen
            key="journey"
            state={state}
            onBack={() => handleBack()}
            onSelectCombo={handleSelectCombo}
          />
        )}
      </AnimatePresence>

      {/* Badge unlock modal */}
      <BadgeModal
        badge={pendingBadge}
        visible={!!pendingBadge}
        onClose={() => setPendingBadge(null)}
      />
    </div>
  );
}

export default App;
