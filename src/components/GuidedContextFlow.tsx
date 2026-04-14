import { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Smartphone, 
  Wifi, 
  Watch, 
  Tablet, 
  Users, 
  User, 
  MapPin, 
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Search,
  ShoppingBag,
  ArrowUpCircle,
  Package,
  Wrench,
  UserCircle,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SalesContext } from '../types';

interface GuidedContextFlowProps {
  context: SalesContext;
  setContext: (value: React.SetStateAction<SalesContext>) => void;
  onComplete: () => void;
}

type Step = 'intent' | 'hintCheck' | 'product' | 'currentDevice' | 'carrier' | 'lines' | 'platform' | 'brand' | 'age';

export default function GuidedContextFlow({ context, setContext, onComplete }: GuidedContextFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>('intent');
  const [direction, setDirection] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const goToStep = (step: Step) => {
    const steps: Step[] = ['intent', 'hintCheck', 'product', 'currentDevice', 'carrier', 'lines', 'platform', 'brand', 'age'];
    const currentIndex = steps.indexOf(currentStep);
    const nextIndex = steps.indexOf(step);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setCurrentStep(step);
  };

  const handleOptionSelect = (id: string, update: Partial<SalesContext>, nextStep: Step | 'complete') => {
    setSelectedId(id);
    setContext(prev => ({ ...prev, ...update }));
    
    // Conditional logic
    let finalNextStep = nextStep;
    
    // If we just picked product, decide where to go next
    if (currentStep === 'product') {
      if (context.purchaseIntent === 'upgrade / add a line') {
        finalNextStep = 'currentDevice';
      } else {
        finalNextStep = 'carrier';
      }
    }
    
    // If we just picked currentDevice, go to lines
    if (currentStep === 'currentDevice') {
      finalNextStep = 'lines';
    }

    // Delay to allow the user to read the card's advice before transitioning
    setTimeout(() => {
      if (finalNextStep === 'complete') {
        onComplete();
      } else {
        goToStep(finalNextStep);
      }
      setSelectedId(null);
    }, 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, rotateX: -15, perspective: 1000 },
    show: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20
      }
    },
    selected: {
      scale: 1.02,
      transition: { 
        duration: 0.2,
        ease: "easeOut" as const
      }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  const renderIntent = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">What's the vibe?</h2>
        <p className="text-sm font-medium text-t-dark-gray">Select the customer's primary reason for the call.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { id: 'exploring', label: 'Exploring', icon: Search, desc: 'What is the customer wanting to get?' },
          { id: 'ready to buy', label: 'Ready to Buy', icon: ShoppingBag, desc: 'Knows what they want' },
          { id: 'upgrade / add a line', label: 'Upgrade', icon: ArrowUpCircle, desc: 'Existing customer' },
          { id: 'order support', label: 'Order Support', icon: Package, desc: 'Status, tracking, etc.' },
          { id: 'tech support', label: 'Tech Support', icon: Wrench, desc: 'Device or network issues' },
          { id: 'account support', label: 'Account', icon: UserCircle, desc: 'Billing, plans, etc.' },
        ].map((opt) => (
          <motion.button
            key={opt.id}
            variants={cardVariants}
            animate={selectedId === opt.id ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.02, y: -4, rotateX: 5 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => handleOptionSelect(opt.id, { purchaseIntent: opt.id as any }, 'hintCheck')}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center group shadow-sm hover:shadow-md relative overflow-hidden ${
              selectedId === opt.id 
                ? 'border-t-magenta bg-t-magenta/10' 
                : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="w-12 h-12 rounded-xl bg-t-magenta/10 flex items-center justify-center group-hover:bg-t-magenta group-hover:text-white transition-colors">
              <opt.icon className="w-6 h-6 text-t-magenta group-hover:text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-tight text-t-dark-gray leading-tight">{opt.label}</p>
              <p className="text-[8px] font-medium text-t-muted mt-1 leading-tight">{opt.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => goToStep('hintCheck')}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip / Not Sure
      </button>
    </motion.div>
  );

  const renderHintCheck = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="inline-block bg-t-magenta text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-2 animate-pulse shadow-lg shadow-t-magenta/20">
          Mandatory Check
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-dark-gray">Check HINT Address?</h2>
        <p className="text-sm font-medium text-t-muted">You know the metric. Enter their address in the tool now.</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {[
          { id: 'Yes', label: 'Yes, they qualify!', color: 'bg-success-surface border-success-border text-success-foreground hover:bg-success-surface/80' },
          { id: 'No', label: 'No, not available.', color: 'bg-error-surface border-error-border text-error-foreground hover:bg-error-surface/80' },
          { id: 'Wait', label: 'Checking it right now...', color: 'bg-surface border-t-light-gray text-t-dark-gray hover:border-t-magenta/50 hover:bg-t-magenta/5' },
        ].map((opt) => (
          <motion.button
            key={opt.id}
            variants={cardVariants}
            animate={selectedId === opt.id ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.02, y: -2 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => handleOptionSelect(opt.id, { hintQualified: opt.id as any }, 'product')}
            className={`p-4 rounded-2xl border-2 transition-all text-center font-black uppercase tracking-widest text-[11px] shadow-sm ${
              selectedId === opt.id ? 'ring-2 ring-offset-2 ring-t-magenta/50 scale-[1.02]' : ''
            } ${opt.color}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => goToStep('product')}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip
      </button>
    </motion.div>
  );

  const renderProduct = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">What's the target?</h2>
        <p className="text-sm font-medium text-t-dark-gray">What products are we discussing today?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { id: 'Phone', label: 'Phone', icon: Smartphone },
          { id: 'Home Internet', label: 'HINT', icon: Wifi },
          { id: 'BTS', label: 'Tablet/Watch', icon: Tablet },
          { id: 'IOT', label: 'SyncUp/IOT', icon: Watch },
        ].map((opt) => (
          <motion.button
            key={opt.id}
            variants={cardVariants}
            animate={selectedId === opt.id ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.02, y: -4, rotateX: 5 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => handleOptionSelect(opt.id, { product: [opt.id as any] }, 'carrier')}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all group shadow-sm hover:shadow-md ${
              selectedId === opt.id 
                ? 'border-t-magenta bg-t-magenta/10' 
                : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="w-14 h-14 rounded-full bg-t-magenta/10 flex items-center justify-center group-hover:bg-t-magenta group-hover:text-white transition-colors">
              <opt.icon className="w-7 h-7 text-t-magenta group-hover:text-white" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-t-dark-gray">{opt.label}</p>
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => {
          if (context.purchaseIntent === 'upgrade / add a line') {
            goToStep('currentDevice');
          } else {
            goToStep('carrier');
          }
        }}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip Product Selection
      </button>
    </motion.div>
  );

  const renderCurrentDevice = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">Current Device</h2>
        <p className="text-sm font-medium text-t-dark-gray">What are they using right now?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { id: 'iPhone', label: 'iPhone', icon: Smartphone },
          { id: 'Samsung', label: 'Samsung', icon: Smartphone },
          { id: 'Pixel', label: 'Pixel', icon: Smartphone },
          { id: 'Other', label: 'Other', icon: Smartphone },
        ].map((opt) => (
          <motion.button
            key={opt.id}
            variants={cardVariants}
            animate={selectedId === opt.id ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.02, y: -4, rotateX: 5 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => handleOptionSelect(opt.id, { currentDeviceBrand: opt.id, currentPlatform: (opt.id === 'iPhone' ? 'iOS' : 'Android') as any }, 'lines')}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all group shadow-sm hover:shadow-md ${
              selectedId === opt.id 
                ? 'border-t-magenta bg-t-magenta/10' 
                : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="w-14 h-14 rounded-full bg-t-magenta/10 flex items-center justify-center group-hover:bg-t-magenta group-hover:text-white transition-colors">
              <opt.icon className="w-7 h-7 text-t-magenta group-hover:text-white" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-t-dark-gray">{opt.label}</p>
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => goToStep('lines')}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip / Not Sure
      </button>
    </motion.div>
  );

  const renderCarrier = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">Who's the rival?</h2>
        <p className="text-sm font-medium text-t-dark-gray">Which carrier are they currently with?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {['AT&T', 'Verizon', 'Spectrum', 'Xfinity', 'US Cellular', 'Prepaid', 'Other', 'Not Specified'].map((c) => (
          <motion.button
            key={c}
            variants={cardVariants}
            animate={selectedId === c ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.02, y: -2, rotateX: 5 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => handleOptionSelect(c, { currentCarrier: (c === 'Prepaid' ? 'Prepaid (Mint, Boost, etc.)' : c) as any }, 'lines')}
            className={`p-4 rounded-xl border-2 transition-all text-xs font-black uppercase tracking-tight text-t-dark-gray shadow-sm hover:shadow-md ${
              selectedId === c 
                ? 'border-t-magenta bg-t-magenta/10' 
                : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {c}
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => goToStep('lines')}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip / Not Sure
      </button>
    </motion.div>
  );

  const renderLines = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">How big is the squad?</h2>
        <p className="text-sm font-medium text-t-dark-gray">How many lines are we looking at?</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, '6+'].map((n) => (
          <motion.button
            key={n}
            variants={cardVariants}
            animate={selectedId === String(n) ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.05, y: -4, rotateX: 5 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => handleOptionSelect(String(n), { totalLines: typeof n === 'number' ? n : 6 }, 'platform')}
            className={`aspect-square flex flex-col items-center justify-center rounded-2xl border-2 transition-all group shadow-sm hover:shadow-md ${
              selectedId === String(n) 
                ? 'border-t-magenta bg-t-magenta/10' 
                : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <span className="text-2xl font-black text-t-magenta group-hover:scale-110 transition-transform">{n}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-t-muted">Lines</span>
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => goToStep('platform')}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Not sure yet
      </button>
    </motion.div>
  );

  const renderPlatform = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">Ecosystem Choice</h2>
        <p className="text-sm font-medium text-t-dark-gray">What platform do they prefer?</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {[
          { id: 'iOS', label: 'Apple iOS', desc: 'iPhone, iMessage, iCloud', color: 'bg-zinc-900' },
          { id: 'Android', label: 'Android', desc: 'Samsung, Pixel, Moto, etc.', color: 'bg-green-600' },
          { id: 'Other', label: 'Mixed', desc: 'Using multiple platforms', color: 'bg-t-magenta' },
        ].map((p) => (
          <motion.button
            key={p.id}
            variants={cardVariants}
            animate={selectedId === p.id ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.02, y: -4, rotateX: 5 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => handleOptionSelect(p.id, { desiredPlatform: p.id as any }, p.id === 'iOS' ? 'age' : 'brand')}
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group shadow-sm hover:shadow-md ${
              selectedId === p.id 
                ? 'border-t-magenta bg-t-magenta/10' 
                : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className={`w-12 h-12 rounded-xl ${p.color} flex items-center justify-center text-white`}>
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black uppercase tracking-tight text-t-dark-gray">{p.label}</p>
              <p className="text-xs font-medium text-t-muted">{p.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => goToStep('age')}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip / Not Sure
      </button>
    </motion.div>
  );

  const renderBrand = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">Which Brand?</h2>
        <p className="text-sm font-medium text-t-dark-gray">Select the preferred Android brand.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { id: 'Samsung', label: 'Samsung', icon: Smartphone },
          { id: 'Pixel', label: 'Google Pixel', icon: Smartphone },
          { id: 'Motorola', label: 'Motorola', icon: Smartphone },
          { id: 'Other', label: 'Other', icon: Smartphone },
        ].map((b) => (
          <motion.button
            key={b.id}
            variants={cardVariants}
            animate={selectedId === b.id ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.02, y: -4, rotateX: 5 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => handleOptionSelect(b.id, {}, 'age')}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all group shadow-sm hover:shadow-md ${
              selectedId === b.id 
                ? 'border-t-magenta bg-t-magenta/10' 
                : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="w-14 h-14 rounded-full bg-t-magenta/10 flex items-center justify-center group-hover:bg-t-magenta group-hover:text-white transition-colors">
              <b.icon className="w-7 h-7 text-t-magenta group-hover:text-white" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-t-dark-gray">{b.label}</p>
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => goToStep('age')}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip / Not Sure
      </button>
    </motion.div>
  );

  const renderAge = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">Demographics</h2>
        <p className="text-sm font-medium text-t-dark-gray">Select the customer's age range for tailored talk tracks.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {['18-24', '25-34', '35-54', '55+', 'Not Specified'].map((a) => (
          <motion.button
            key={a}
            variants={cardVariants}
            animate={selectedId === a ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.02, y: -2, rotateX: 5 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => handleOptionSelect(a, { age: a as any }, 'complete')}
            className={`p-4 rounded-xl border-2 transition-all text-xs font-black uppercase tracking-tight text-t-dark-gray shadow-sm hover:shadow-md ${
              selectedId === a 
                ? 'border-t-magenta bg-t-magenta/10' 
                : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {a}
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => onComplete()}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip / Not Sure
      </button>
    </motion.div>
  );

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div className="max-w-md mx-auto min-h-[500px] flex flex-col">
      {/* Progress Bar */}
      <div className="flex gap-1.5 mb-8 px-2">
        {['intent', 'hintCheck', 'product', 'currentDevice', 'carrier', 'lines', 'platform', 'brand', 'age'].map((step, i) => {
          const steps: Step[] = ['intent', 'hintCheck', 'product', 'currentDevice', 'carrier', 'lines', 'platform', 'brand', 'age'];
          const currentIndex = steps.indexOf(currentStep);
          
          // Hide currentDevice if not upgrade
          if (step === 'currentDevice' && context.purchaseIntent !== 'upgrade / add a line') return null;
          // Hide carrier if upgrade
          if (step === 'carrier' && context.purchaseIntent === 'upgrade / add a line') return null;
          
          const isActive = i <= currentIndex;
          return (
            <div 
              key={step} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                isActive ? 'bg-t-magenta' : 'bg-t-light-gray'
              }`} 
            />
          );
        })}
      </div>

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="w-full"
          >
            {currentStep === 'intent' && renderIntent()}
            {currentStep === 'hintCheck' && renderHintCheck()}
            {currentStep === 'product' && renderProduct()}
            {currentStep === 'currentDevice' && renderCurrentDevice()}
            {currentStep === 'carrier' && renderCarrier()}
            {currentStep === 'lines' && renderLines()}
            {currentStep === 'platform' && renderPlatform()}
            {currentStep === 'brand' && renderBrand()}
            {currentStep === 'age' && renderAge()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back Button */}
      {currentStep !== 'intent' && (
        <button
          onClick={() => {
            const steps: Step[] = ['intent', 'hintCheck', 'product', 'currentDevice', 'carrier', 'lines', 'platform', 'brand', 'age'];
            const currentIndex = steps.indexOf(currentStep);
            let prevIndex = currentIndex - 1;
            
            // Skip currentDevice if not upgrade
            if (steps[prevIndex] === 'currentDevice' && context.purchaseIntent !== 'upgrade / add a line') {
              prevIndex--;
            }
            // Skip carrier if intent is upgrade
            if (steps[prevIndex] === 'carrier' && context.purchaseIntent === 'upgrade / add a line') {
              prevIndex--;
            }
            // Skip brand if iOS
            if (steps[prevIndex] === 'brand' && context.desiredPlatform === 'iOS') {
              prevIndex--;
            }

            goToStep(steps[prevIndex]);
          }}
          className="mt-8 flex items-center gap-2 text-t-muted hover:text-t-magenta transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>
      )}
    </div>
  );
}
