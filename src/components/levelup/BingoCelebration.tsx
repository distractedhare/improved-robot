import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, Sparkles, Gift, Star, Crown, Copy, Check } from 'lucide-react';

interface BingoCelebrationProps {
  visible: boolean;
  bingoCode: string | null;
  winCount: number; // number of bingo lines hit
  onClose: () => void;
}

// T-Mobile confetti colors
const CONFETTI_COLORS = [
  '#E20074', // magenta
  '#FF4DA6', // hot pink
  '#861B54', // berry
  '#FFFFFF', // white
  '#FF85C8', // light pink
  '#C70066', // dark magenta
  '#FFD700', // gold
  '#FF1493', // deep pink
];

const CONFETTI_SHAPES = ['square', 'rect', 'circle'] as const;

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  shape: typeof CONFETTI_SHAPES[number];
  size: number;
  rotation: number;
  delay: number;
  duration: number;
  swayAmount: number;
}

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
    size: 4 + Math.random() * 8,
    rotation: Math.random() * 360,
    delay: Math.random() * 1.5,
    duration: 2.5 + Math.random() * 2,
    swayAmount: -40 + Math.random() * 80,
  }));
}

const PRIZE_TIERS = [
  {
    lines: 1,
    icon: Gift,
    title: 'BINGO!',
    subtitle: 'You hit a line!',
    prize: 'Free premium coffee on your next break',
    prizeDetail: 'Show your code to your coach — any drink, any size, on us.',
    color: '#E20074',
    bgGlow: 'rgba(226, 0, 116, 0.15)',
  },
  {
    lines: 2,
    icon: Star,
    title: 'DOUBLE BINGO!',
    subtitle: 'Two lines — you\'re on fire!',
    prize: 'DoorDash lunch on the team',
    prizeDetail: 'Your coach will send you a $20 DoorDash credit. Eat like a champion.',
    color: '#FFD700',
    bgGlow: 'rgba(255, 215, 0, 0.15)',
  },
  {
    lines: 3,
    icon: Crown,
    title: 'TRIPLE BINGO!',
    subtitle: 'Three lines?! Are you even real?!',
    prize: 'First pick on next week\'s schedule',
    prizeDetail: 'Plus a shoutout in the team chat. You earned it. Go celebrate.',
    color: '#FFD700',
    bgGlow: 'rgba(255, 215, 0, 0.2)',
  },
];

function getPrizeTier(winCount: number) {
  if (winCount >= 3) return PRIZE_TIERS[2];
  if (winCount >= 2) return PRIZE_TIERS[1];
  return PRIZE_TIERS[0];
}

export default function BingoCelebration({ visible, bingoCode, winCount, onClose }: BingoCelebrationProps) {
  const confetti = useMemo(() => generateConfetti(80), []);
  const tier = getPrizeTier(winCount);
  const TierIcon = tier.icon;
  const [copied, setCopied] = useState(false);

  // Reset copied state when dialog opens
  useEffect(() => {
    if (visible) setCopied(false);
  }, [visible]);

  const handleCopy = () => {
    if (bingoCode) {
      navigator.clipboard.writeText(bingoCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* CONFETTI — full screen */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confetti.map((piece) => (
              <motion.div
                key={piece.id}
                initial={{
                  x: `${piece.x}vw`,
                  y: -20,
                  rotate: piece.rotation,
                  opacity: 1,
                  scale: 0,
                }}
                animate={{
                  y: '110vh',
                  x: `calc(${piece.x}vw + ${piece.swayAmount}px)`,
                  rotate: piece.rotation + 720,
                  opacity: [0, 1, 1, 0.8, 0],
                  scale: [0, 1, 1, 0.8, 0.5],
                }}
                transition={{
                  duration: piece.duration,
                  delay: piece.delay,
                  ease: 'linear',
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
                style={{
                  position: 'absolute',
                  width: piece.shape === 'rect' ? piece.size * 0.4 : piece.size,
                  height: piece.shape === 'rect' ? piece.size * 1.5 : piece.size,
                  backgroundColor: piece.color,
                  borderRadius: piece.shape === 'circle' ? '50%' : piece.shape === 'rect' ? '1px' : '2px',
                  boxShadow: `0 0 6px ${piece.color}80`,
                }}
              />
            ))}
          </div>

          {/* Main celebration card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
            className="relative z-10 w-full max-w-sm rounded-3xl overflow-hidden glass-celebration glass-specular"
            style={{
              boxShadow: `0 32px 80px rgba(0,0,0,0.4), 0 0 120px ${tier.bgGlow}, 0 0 200px ${tier.bgGlow}, inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1)`,
            }}
          >
            {/* Top glow bar */}
            <div
              className="h-1.5 w-full"
              style={{ background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)` }}
            />

            <div className="p-6 space-y-5">
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-10"
                aria-label="Close celebration"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Trophy animation */}
              <div className="relative w-28 h-28 mx-auto">
                {/* Pulsing ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: `3px solid ${tier.color}` }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [0.8, 1.3, 0.8], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Second ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: `2px solid ${tier.color}` }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: [0.9, 1.5, 0.9], opacity: [0, 0.3, 0] }}
                  transition={{ duration: 2, delay: 0.3, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Sparkle bursts */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '50%',
                      color: i % 2 === 0 ? tier.color : '#FFD700',
                    }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    animate={{
                      x: Math.cos((i * 45 * Math.PI) / 180) * 55,
                      y: Math.sin((i * 45 * Math.PI) / 180) * 55,
                      opacity: [0, 1, 0],
                      scale: [0, 1.2, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.5 + i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                ))}

                {/* Main icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.4 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${tier.color}, ${tier.color}CC)`,
                      boxShadow: `0 8px 32px ${tier.color}80, 0 0 60px ${tier.color}40, inset 0 2px 0 rgba(255,255,255,0.3)`,
                    }}
                  >
                    <TierIcon className="w-10 h-10 text-white drop-shadow-lg" />
                  </div>
                </motion.div>
              </div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <h3
                  className="text-3xl font-black uppercase tracking-tight"
                  style={{
                    background: `linear-gradient(135deg, ${tier.color}, #FFD700, ${tier.color})`,
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'shimmer-sweep 3s ease-in-out infinite',
                  }}
                >
                  {tier.title}
                </h3>
                <p className="text-sm font-bold text-t-dark-gray mt-1">{tier.subtitle}</p>
              </motion.div>

              {/* Prize card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="rounded-2xl p-4 text-center space-y-2"
                style={{
                  background: tier.bgGlow,
                  border: `2px solid ${tier.color}40`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), 0 0 40px ${tier.bgGlow}`,
                }}
              >
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: tier.color }}>
                  Your prize
                </p>
                <p className="text-lg font-black uppercase tracking-tight text-foreground">
                  {tier.prize}
                </p>
                <p className="text-[11px] font-medium text-t-dark-gray leading-relaxed">
                  {tier.prizeDetail}
                </p>
              </motion.div>

              {/* Verification code */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="space-y-2"
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-center text-t-dark-gray/50">
                  Verification code
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 rounded-xl px-4 py-3 text-center glass-card"
                    style={{ borderColor: `${tier.color}30` }}
                  >
                    <p className="text-base font-black tracking-[0.2em] text-foreground select-all font-mono">
                      {bingoCode}
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={handleCopy}
                    whileTap={{ scale: 0.9 }}
                    className="focus-ring p-3 rounded-xl glass-card transition-all hover:border-t-magenta/30"
                    aria-label="Copy code"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-success-accent" />
                    ) : (
                      <Copy className="w-4 h-4 text-t-dark-gray" />
                    )}
                  </motion.button>
                </div>
                <p className="text-[10px] text-center font-bold text-t-dark-gray/50">
                  Screenshot this or copy the code — show your coach to claim your prize!
                </p>
              </motion.div>

              {/* Close CTA */}
              <motion.button
                type="button"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                whileTap={{ scale: 0.97 }}
                className="focus-ring w-full rounded-2xl py-3.5 text-[10px] font-black uppercase tracking-widest text-white transition-all"
                style={{
                  background: `linear-gradient(135deg, ${tier.color}, ${tier.color}CC)`,
                  boxShadow: `0 4px 20px ${tier.color}60, inset 0 1px 0 rgba(255,255,255,0.2)`,
                }}
              >
                Let's keep going
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
