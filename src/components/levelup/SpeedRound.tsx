import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Clock, RotateCcw, Sparkles, X, Zap } from 'lucide-react';
import { QuizQuestion, getRandomQuestions, CATEGORY_META, QuizCategory } from '../../constants/quizQuestions';
import { recordQuizScore } from '../../services/prizeService';

const ROUND_SIZE = 10;
const ROUND_TIME = 90; // seconds

type GameState = 'ready' | 'playing' | 'review';

interface AnswerRecord {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  timeSpent: number;
}

export default function SpeedRound() {
  const [state, setState] = useState<GameState>('ready');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<QuizCategory[]>([]);
  const questionStartRef = useRef(Date.now());
  const timerRef = useRef<number | null>(null);
  const advanceTimerRef = useRef<number | null>(null);

  const currentQuestion = questions[currentIndex] ?? null;

  const score = useMemo(() => {
    if (answers.length === 0) return 0;
    return Math.round((answers.filter((a) => a.correct).length / answers.length) * 100);
  }, [answers]);

  const startRound = useCallback(() => {
    const q = getRandomQuestions(ROUND_SIZE, selectedCategories.length > 0 ? selectedCategories : undefined);
    setQuestions(q);
    setCurrentIndex(0);
    setAnswers([]);
    setTimeLeft(ROUND_TIME);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setState('playing');
    questionStartRef.current = Date.now();
  }, [selectedCategories]);

  // Clean up advance timer on unmount
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  // Timer — compute score inline to avoid stale closure
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    if (state !== 'playing') return undefined;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setState('review');
          const currentAnswers = answersRef.current;
          const finalScore = currentAnswers.length > 0
            ? Math.round((currentAnswers.filter((a) => a.correct).length / currentAnswers.length) * 100)
            : 0;
          recordQuizScore(finalScore);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  const handleAnswer = useCallback((optionIndex: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;

    const timeSpent = (Date.now() - questionStartRef.current) / 1000;
    const correct = optionIndex === currentQuestion.correctIndex;

    setSelectedAnswer(optionIndex);
    setShowExplanation(true);

    setAnswers((prev) => [
      ...prev,
      { questionId: currentQuestion.id, selectedIndex: optionIndex, correct, timeSpent },
    ]);

    // Auto-advance after showing explanation — 3s for learning retention
    advanceTimerRef.current = window.setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setState('review');
        const finalAnswers = [...answers, { questionId: currentQuestion.id, selectedIndex: optionIndex, correct, timeSpent }];
        const finalScore = Math.round((finalAnswers.filter((a) => a.correct).length / finalAnswers.length) * 100);
        recordQuizScore(finalScore);
      } else {
        setCurrentIndex((i) => i + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
        questionStartRef.current = Date.now();
      }
    }, 3000);
  }, [selectedAnswer, currentQuestion, currentIndex, questions.length, answers]);

  const toggleCategory = (cat: QuizCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // READY STATE
  if (state === 'ready') {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-t-magenta/10">
            <Zap className="h-7 w-7 text-t-magenta" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Speed Round</h3>
          <p className="mt-1 text-sm font-medium text-t-dark-gray">
            {ROUND_SIZE} questions. 90 seconds. How sharp are you?
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">Focus categories (optional)</p>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(CATEGORY_META) as [QuizCategory, typeof CATEGORY_META.sales][]).map(([key, meta]) => {
              const active = selectedCategories.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleCategory(key)}
                  aria-pressed={active}
                  className={`focus-ring min-h-[44px] rounded-lg border px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    active
                      ? 'border-t-magenta bg-t-magenta text-white'
                      : 'glass-button text-t-dark-gray hover:border-t-magenta/30'
                  }`}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-muted">How it works</p>
          <ul className="mt-2 space-y-1.5 text-xs font-medium text-t-dark-gray">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-t-magenta" />
              Answer {ROUND_SIZE} questions before time runs out
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-t-magenta" />
              70%+ earns your daily Momentum Badge
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-t-magenta" />
              Every question makes your next call sharper
            </li>
          </ul>
        </div>

        <button
          type="button"
          onClick={startRound}
          className="focus-ring w-full rounded-xl bg-t-magenta py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-[0_8px_20px_rgba(226,0,116,0.25)] transition-transform hover:scale-[1.01] active:scale-[0.98]"
        >
          Start Round
        </button>
      </div>
    );
  }

  // PLAYING STATE
  if (state === 'playing' && currentQuestion) {
    const progressPct = ((currentIndex + 1) / questions.length) * 100;
    const timeWarning = timeLeft <= 15;
    const timeCritical = timeLeft <= 5;

    return (
      <div className="space-y-4">
        {/* Timer + progress bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${timeCritical ? 'text-error-accent' : timeWarning ? 'text-warning-accent' : 'text-t-dark-gray'}`} />
            <span className={`text-lg font-black tabular-nums ${timeCritical ? 'text-error-accent' : timeWarning ? 'text-warning-accent' : 'text-foreground'}`}>
              {timeLeft}s
            </span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-t-dark-gray">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 overflow-hidden rounded-full bg-t-light-gray/50">
          <motion.div
            className="h-full rounded-full bg-t-magenta"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="glass-elevated rounded-2xl p-5"
          >
            <div className="mb-1 flex items-center gap-2">
              <span
                className="rounded-md px-2 py-0.5 text-[8px] font-black uppercase tracking-wider"
                style={{ backgroundColor: `${CATEGORY_META[currentQuestion.category].color}15`, color: CATEGORY_META[currentQuestion.category].color }}
              >
                {CATEGORY_META[currentQuestion.category].label}
              </span>
              <span className="text-[8px] font-bold text-t-muted">
                {'*'.repeat(currentQuestion.difficulty)}
              </span>
            </div>

            <p className="text-sm font-bold text-foreground leading-relaxed">
              {currentQuestion.question}
            </p>

            <div className="mt-4 space-y-2">
              {currentQuestion.options.map((option, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrect = i === currentQuestion.correctIndex;
                const showResult = selectedAnswer !== null;

                let optionStyle = 'glass-button text-foreground hover:border-t-magenta/40';
                if (showResult && isCorrect) {
                  optionStyle = 'border-success-accent bg-success-surface text-success-foreground';
                } else if (showResult && isSelected && !isCorrect) {
                  optionStyle = 'border-error-accent bg-error-surface text-error-foreground';
                }

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAnswer(i)}
                    disabled={selectedAnswer !== null}
                    className={`focus-ring flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-xs font-medium transition-all disabled:cursor-default ${optionStyle}`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-black">
                      {showResult && isCorrect ? (
                        <Check className="h-3.5 w-3.5 text-success-accent" />
                      ) : showResult && isSelected ? (
                        <X className="h-3.5 w-3.5 text-error-accent" />
                      ) : (
                        String.fromCharCode(65 + i)
                      )}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden rounded-xl border border-info-border bg-info-surface p-3"
                >
                  <p className="text-xs font-medium text-info-foreground leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // REVIEW STATE
  const correctCount = answers.filter((a) => a.correct).length;
  const finalScore = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
  const avgTime = answers.length > 0 ? (answers.reduce((sum, a) => sum + a.timeSpent, 0) / answers.length).toFixed(1) : '0';
  const earnedMomentum = finalScore >= 70;

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
          style={{ background: earnedMomentum ? '#E20074' : 'var(--border-surface)' }}
        >
          {earnedMomentum ? <Sparkles className="h-8 w-8" /> : <RotateCcw className="h-8 w-8" />}
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">
          {earnedMomentum ? 'Momentum Earned!' : 'Round Over'}
        </h3>
        <p className="mt-1 text-sm font-medium text-t-dark-gray">
          {earnedMomentum
            ? 'You hit 70%+ — your Momentum Badge is locked in.'
            : `${finalScore}% — you need 70% for the badge. Try again!`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="glass-stat rounded-xl p-3 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray">Score</p>
          <p className="mt-1 text-lg font-black text-foreground">{finalScore}%</p>
        </div>
        <div className="glass-stat rounded-xl p-3 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray">Correct</p>
          <p className="mt-1 text-lg font-black text-foreground">{correctCount}/{answers.length}</p>
        </div>
        <div className="glass-stat rounded-xl p-3 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray">Avg Time</p>
          <p className="mt-1 text-lg font-black text-foreground">{avgTime}s</p>
        </div>
      </div>

      {/* Missed questions review */}
      {answers.some((a) => !a.correct) && (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">Review missed</p>
          {answers.filter((a) => !a.correct).map((a) => {
            const q = questions.find((qq) => qq.id === a.questionId);
            if (!q) return null;
            return (
              <div key={a.questionId} className="glass-card rounded-xl p-3">
                <p className="text-xs font-bold text-foreground">{q.question}</p>
                <p className="mt-1 text-[11px] text-error-foreground">
                  You said: {q.options[a.selectedIndex]}
                </p>
                <p className="mt-0.5 text-[11px] text-success-foreground font-medium">
                  Correct: {q.options[q.correctIndex]}
                </p>
                <p className="mt-1 text-[10px] text-t-dark-gray italic">{q.explanation}</p>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => { setState('ready'); }}
        className="focus-ring w-full rounded-xl bg-t-magenta py-3 text-sm font-black uppercase tracking-wider text-white shadow-md transition-transform hover:scale-[1.01] active:scale-[0.98]"
      >
        Play Again
      </button>
    </div>
  );
}
