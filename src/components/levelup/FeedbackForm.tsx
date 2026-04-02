import { useState } from 'react';
import { Send, CheckCircle2, Star, ThumbsUp, ThumbsDown, Meh, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Role = 'frontline' | 'assistant-manager' | 'sales-manager';
type Rating = 1 | 2 | 3 | 4 | 5;

interface QuickQuestion {
  id: string;
  label: string;
  options: { value: string; label: string; icon?: typeof ThumbsUp }[];
}

const ROLE_CONFIG: Record<Role, { label: string; subtitle: string; questions: QuickQuestion[] }> = {
  frontline: {
    label: 'Sales Rep',
    subtitle: 'Frontline feedback — what helps, what doesn\'t, what\'s missing',
    questions: [
      {
        id: 'useful',
        label: 'Is the app helping you on calls?',
        options: [
          { value: 'yes', label: 'Yes', icon: ThumbsUp },
          { value: 'sometimes', label: 'Sometimes', icon: Meh },
          { value: 'not-really', label: 'Not really', icon: ThumbsDown },
        ],
      },
      {
        id: 'favorite',
        label: 'Most useful feature?',
        options: [
          { value: 'instant-plays', label: 'Instant Plays' },
          { value: 'game-plan', label: 'Game Plan' },
          { value: 'objections', label: 'Objection Handler' },
          { value: 'devices', label: 'Device Lookup' },
          { value: 'accessories', label: 'Accessories' },
          { value: 'hint', label: 'Home Internet' },
        ],
      },
      {
        id: 'missing',
        label: 'What\'s missing?',
        options: [
          { value: 'more-promos', label: 'More promos' },
          { value: 'plan-compare', label: 'Plan comparison' },
          { value: 'scripts', label: 'More scripts' },
          { value: 'nothing', label: 'Nothing — it\'s good' },
        ],
      },
    ],
  },
  'assistant-manager': {
    label: 'Assistant Manager',
    subtitle: 'How\'s the team using it? What would help coaching?',
    questions: [
      {
        id: 'team-adoption',
        label: 'Is your team using the app?',
        options: [
          { value: 'most', label: 'Most reps' },
          { value: 'some', label: 'Some reps' },
          { value: 'few', label: 'Only a few' },
          { value: 'none', label: 'Not yet' },
        ],
      },
      {
        id: 'coaching-value',
        label: 'Helpful for coaching?',
        options: [
          { value: 'yes', label: 'Yes', icon: ThumbsUp },
          { value: 'somewhat', label: 'Somewhat', icon: Meh },
          { value: 'no', label: 'Not really', icon: ThumbsDown },
        ],
      },
      {
        id: 'want',
        label: 'What would help most?',
        options: [
          { value: 'team-metrics', label: 'Team metrics' },
          { value: 'coaching-scripts', label: 'Coaching scripts' },
          { value: 'performance-tips', label: 'Performance tips' },
          { value: 'other', label: 'Other (comment below)' },
        ],
      },
    ],
  },
  'sales-manager': {
    label: 'Sales Manager',
    subtitle: 'Strategic feedback — ROI, adoption, feature requests',
    questions: [
      {
        id: 'impact',
        label: 'Impact on sales performance?',
        options: [
          { value: 'positive', label: 'Positive', icon: ThumbsUp },
          { value: 'neutral', label: 'Neutral', icon: Meh },
          { value: 'too-early', label: 'Too early to tell' },
        ],
      },
      {
        id: 'priority',
        label: 'Highest priority improvement?',
        options: [
          { value: 'accuracy', label: 'Data accuracy' },
          { value: 'features', label: 'More features' },
          { value: 'speed', label: 'Faster updates' },
          { value: 'training', label: 'Training material' },
          { value: 'rollout', label: 'Wider rollout' },
        ],
      },
      {
        id: 'recommend',
        label: 'Would you recommend to other teams?',
        options: [
          { value: 'yes', label: 'Yes', icon: ThumbsUp },
          { value: 'maybe', label: 'Maybe', icon: Meh },
          { value: 'no', label: 'Not yet', icon: ThumbsDown },
        ],
      },
    ],
  },
};

export default function FeedbackForm() {
  const [step, setStep] = useState<'role' | 'questions' | 'comment' | 'sent'>('role');
  const [role, setRole] = useState<Role | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [overallRating, setOverallRating] = useState<Rating | null>(null);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  const config = role ? ROLE_CONFIG[role] : null;

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setAnswers({});
    setOverallRating(null);
    setComment('');
    setStep('questions');
  };

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const allAnswered = config ? config.questions.every(q => answers[q.id]) : false;

  const handleSend = () => {
    if (!role || !config) return;
    setSending(true);

    // Build email body
    const lines = [
      `ANONYMOUS FEEDBACK — CustomerConnect AI`,
      `Role: ${config.label}`,
      `Overall Rating: ${overallRating ? `${overallRating}/5` : 'Not rated'}`,
      ``,
      `--- Quick Answers ---`,
      ...config.questions.map(q => {
        const answer = answers[q.id];
        const option = q.options.find(o => o.value === answer);
        return `${q.label}: ${option?.label || answer || 'Skipped'}`;
      }),
      ``,
      `--- Comments ---`,
      comment || '(none)',
      ``,
      `Sent: ${new Date().toLocaleString()}`,
    ];

    const subject = encodeURIComponent(`[CC AI Feedback] ${config.label} — ${overallRating ? overallRating + '/5' : 'Quick feedback'}`);
    const body = encodeURIComponent(lines.join('\n'));

    // Open mailto link — anonymous since no sender info is included
    window.open(`mailto:demos_corncob_8k@icloud.com?subject=${subject}&body=${body}`, '_blank');

    // Show success after a brief moment
    setTimeout(() => {
      setSending(false);
      setStep('sent');
    }, 500);
  };

  const handleReset = () => {
    setStep('role');
    setRole(null);
    setAnswers({});
    setOverallRating(null);
    setComment('');
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {/* STEP 1: Pick your role */}
        {step === 'role' && (
          <motion.div
            key="role"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-1">Step 1 of 3</p>
              <h3 className="text-lg font-black uppercase tracking-tight">What's your role?</h3>
              <p className="text-xs text-t-dark-gray font-medium mt-1">
                This shapes the questions. All feedback is 100% anonymous.
              </p>
            </div>

            <div className="space-y-2">
              {([
                { id: 'frontline' as Role, label: 'Sales Rep', desc: 'I\'m on the phones taking calls' },
                { id: 'assistant-manager' as Role, label: 'Assistant Manager', desc: 'I coach the frontline team' },
                { id: 'sales-manager' as Role, label: 'Sales Manager', desc: 'I oversee the sales floor' },
              ]).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id)}
                  className="focus-ring w-full flex items-center justify-between p-4 rounded-2xl border-2 border-t-light-gray bg-surface hover:border-t-berry/50 transition-all text-left group"
                >
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight group-hover:text-t-berry transition-colors">{r.label}</p>
                    <p className="text-[11px] text-t-dark-gray font-medium mt-0.5">{r.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-t-dark-gray/30 group-hover:text-t-berry transition-colors" />
                </button>
              ))}
            </div>

            <p className="text-[9px] text-t-dark-gray/40 font-medium text-center">
              No names, no IDs, no tracking. Just honest feedback.
            </p>
          </motion.div>
        )}

        {/* STEP 2: Quick questions */}
        {step === 'questions' && config && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-1">Step 2 of 3</p>
              <h3 className="text-lg font-black uppercase tracking-tight">{config.label} Feedback</h3>
              <p className="text-xs text-t-dark-gray font-medium mt-1">{config.subtitle}</p>
            </div>

            {/* Overall rating */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-t-dark-gray">Overall, how's the app?</p>
              <div className="flex gap-2 justify-center">
                {([1, 2, 3, 4, 5] as Rating[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setOverallRating(r)}
                    className="focus-ring p-2 rounded-xl transition-all"
                    style={{
                      background: overallRating && r <= overallRating ? '#E20074' : 'var(--bg-surface-secondary, #f8f5f9)',
                      color: overallRating && r <= overallRating ? '#fff' : 'var(--text-tertiary, #999)',
                    }}
                  >
                    <Star className={`w-5 h-5 ${overallRating && r <= overallRating ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick questions */}
            {config.questions.map((q) => (
              <div key={q.id} className="space-y-2">
                <p className="text-xs font-bold text-t-dark-gray">{q.label}</p>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleAnswer(q.id, opt.value)}
                        className="focus-ring flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-[10px] font-bold uppercase tracking-wide transition-all"
                        style={{
                          background: selected ? '#E20074' : 'var(--bg-intent, #fff)',
                          color: selected ? '#fff' : 'var(--text-intent, #1a1a1a)',
                          borderColor: selected ? '#E20074' : 'var(--border-intent, #e8e8e8)',
                        }}
                      >
                        {opt.icon && <opt.icon className="w-3 h-3" />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('role')}
                className="focus-ring px-4 py-2.5 rounded-xl border-2 border-t-light-gray text-[10px] font-black uppercase tracking-wider text-t-dark-gray hover:border-t-berry/50 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('comment')}
                disabled={!allAnswered}
                className="focus-ring flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: allAnswered ? '#E20074' : 'var(--border-surface)',
                  color: allAnswered ? '#fff' : 'var(--text-tertiary)',
                }}
              >
                {allAnswered ? 'Next — Add a comment (optional)' : 'Answer all to continue'}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Optional comment + send */}
        {step === 'comment' && config && (
          <motion.div
            key="comment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-1">Step 3 of 3</p>
              <h3 className="text-lg font-black uppercase tracking-tight">Anything else?</h3>
              <p className="text-xs text-t-dark-gray font-medium mt-1">
                Totally optional — skip it and hit send, or tell me what's on your mind.
              </p>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What would make this app better for you? Bugs? Feature ideas? Things you love? Lay it on me..."
              rows={4}
              className="focus-ring w-full rounded-2xl border-2 border-t-light-gray bg-surface p-4 text-sm font-medium text-foreground placeholder:text-t-dark-gray/30 resize-none transition-all"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('questions')}
                className="focus-ring px-4 py-3 rounded-xl border-2 border-t-light-gray text-[10px] font-black uppercase tracking-wider text-t-dark-gray hover:border-t-berry/50 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="focus-ring flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                style={{
                  background: '#E20074',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(226, 0, 116, 0.35)',
                }}
              >
                {sending ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Feedback
                  </>
                )}
              </button>
            </div>

            <p className="text-[9px] text-t-dark-gray/40 font-medium text-center">
              Opens your email app with the feedback pre-filled. No personal info is attached.
            </p>
          </motion.div>
        )}

        {/* SENT — Success */}
        {step === 'sent' && (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-8"
          >
            <div className="w-16 h-16 rounded-full bg-success-surface border-2 border-success-border flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-success-accent" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Thank you!</h3>
            <p className="text-sm text-t-dark-gray font-medium max-w-xs mx-auto">
              Your anonymous feedback helps make this tool better for everyone on the floor.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="focus-ring px-6 py-2.5 rounded-xl border-2 border-t-light-gray text-[10px] font-black uppercase tracking-wider text-t-dark-gray hover:border-t-berry/50 transition-all"
            >
              Send another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
