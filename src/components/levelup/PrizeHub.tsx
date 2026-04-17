import { useState, useEffect, type ReactNode } from 'react';
import {
  Award,
  Calendar,
  Crown,
  Gift,
  Sparkles,
  Star,
  Target,
  Ticket,
  Trophy,
} from 'lucide-react';
import {
  getMascotEmoji,
  getTeamConfig,
  subscribeTeamConfig,
  TeamConfig,
} from '../../services/teamConfigService';

const DAILY_GOALS = [
  { metric: '40% Conversion', reward: 'Lotto Ticket', note: 'Best fast daily win for strong live-call reps.' },
  { metric: '15% HSI Conversion', reward: 'Lotto Ticket', note: 'Turn address checks into a repeatable extra ticket lane.' },
  { metric: '3 HSI Sales', reward: '15 Min Break', note: 'The biggest daily unlock when HINT is really landing.' },
];

const WEEKLY_GOALS = [
  { metric: '40% Conversion', reward: '1 Monthly Ticket', note: 'Consistency matters more than one hot streak.' },
  { metric: '15% HSI Conversion', reward: '1 Monthly Ticket', note: 'A full week of HINT discipline keeps you in the draw.' },
  { metric: '12 HSI Sales', reward: '1 Monthly Ticket', note: 'This is the strongest volume flex for the month-end pool.' },
];

const MONTHLY_PRIZES = [
  'WFH Week',
  '$25 Amazon GC',
  '$25 DoorDash',
  '$25 in Lotto',
];

export default function PrizeHub() {
  const [teamConfig, setTeamConfig] = useState<TeamConfig>(() => getTeamConfig());
  useEffect(() => subscribeTeamConfig(setTeamConfig), []);
  const hasTeam = teamConfig.teamName.trim().length > 0;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-t-dark-gray via-t-berry to-t-magenta p-5 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/90">
              <Award className="h-3.5 w-3.5 text-white" />
              Prize Hub
            </div>
            <h3 className="mt-3 text-3xl font-black uppercase tracking-tight">Make the fun feel earned</h3>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-white/80">
              The goal is simple: use games to sharpen the live call, use the live call to earn tickets, and keep the monthly draw feeling close enough to chase every shift.
            </p>
            {hasTeam ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                <span className="text-base leading-none">{getMascotEmoji(teamConfig.mascotId)}</span>
                <span>{teamConfig.teamName}</span>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[28rem]">
            <HeroStat label="Today" value="2 ticket lanes" helper="Conversion + HSI can both pay off in one shift." icon={<Ticket className="h-4 w-4" />} />
            <HeroStat label="This Week" value="3 monthly tickets" helper="Daily habits compound into the draw pool." icon={<Calendar className="h-4 w-4" />} />
            <HeroStat label="Grand Draw" value="3 winners" helper="Enough to feel real, limited enough to chase." icon={<Trophy className="h-4 w-4" />} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div className="space-y-4">
          <GoalSection
            title="Daily Targets"
            subtitle="Use this to frame the shift right now."
            icon={<Star className="h-4 w-4 text-t-magenta" />}
            tone="magenta"
            goals={DAILY_GOALS}
          />
          <GoalSection
            title="Weekly Targets"
            subtitle="This is the consistency board, not the one-call highlight reel."
            icon={<Calendar className="h-4 w-4 text-t-dark-gray" />}
            tone="neutral"
            goals={WEEKLY_GOALS}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-t-magenta/20 bg-surface-elevated p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-t-magenta/10">
                <Target className="h-5 w-5 text-t-magenta" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">Momentum Loop</p>
                <p className="mt-1 text-sm font-black text-foreground">Games should feed the floor, not sit beside it.</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <LoopStep label="Sharpen" copy="Run Bingo or a quick game between calls so the pitch and objection muscle stays warm." />
              <LoopStep label="Apply" copy="Take the cleanest skill into Live and aim for conversion, HSI checks, and full-stack quoting." />
              <LoopStep label="Earn" copy="Turn daily wins into tickets, then let the month-end draw feel close enough to keep opening the app." />
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-t-magenta to-t-berry p-5 text-white shadow-lg">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-white" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/85">Monthly Draw</p>
                <p className="text-sm font-black">What the tickets are building toward</p>
              </div>
            </div>
            <p className="mt-3 text-xs font-medium leading-relaxed text-white/85">
              Draw from all weekly ticket winners. Keep the pool visible so the reward loop feels immediate instead of abstract.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {MONTHLY_PRIZES.map((title) => (
                <GrandPrizeCard key={title} title={title} />
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/80">Manager framing</p>
              <p className="mt-1 text-[11px] font-medium leading-relaxed text-white">
                The point is not random swag. The point is creating a reason to practice, a reason to compete, and a reason to come back tomorrow.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroStat({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-white/85">
        {icon}
        <p className="text-[9px] font-black uppercase tracking-[0.18em]">{label}</p>
      </div>
      <p className="mt-2 text-base font-black text-white">{value}</p>
      <p className="mt-1 text-[10px] font-medium leading-relaxed text-white/70">{helper}</p>
    </div>
  );
}

function GoalSection({
  title,
  subtitle,
  icon,
  tone,
  goals,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  tone: 'magenta' | 'neutral';
  goals: Array<{ metric: string; reward: string; note: string }>;
}) {
  const shellClass = tone === 'magenta'
    ? 'border-t-magenta/20 bg-t-magenta/5'
    : 'border-t-light-gray bg-surface';

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${shellClass}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/75">
          {icon}
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${tone === 'magenta' ? 'text-t-magenta' : 'text-t-dark-gray'}`}>
            {title}
          </p>
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">{subtitle}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {goals.map((goal) => (
          <GoalCard key={`${title}-${goal.metric}`} {...goal} />
        ))}
      </div>
    </div>
  );
}

function GoalCard({
  metric,
  reward,
  note,
}: {
  metric: string;
  reward: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-t-light-gray/60 bg-surface px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-foreground">{metric}</p>
          <p className="mt-1 text-[10px] font-medium leading-relaxed text-t-dark-gray">{note}</p>
        </div>
        <div className="shrink-0 rounded-xl bg-t-light-gray/30 px-3 py-1.5 text-right">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">Reward</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-t-magenta">{reward}</p>
        </div>
      </div>
    </div>
  );
}

function LoopStep({ label, copy }: { label: string; copy: string }) {
  return (
    <div className="rounded-2xl border border-t-light-gray/60 bg-surface px-4 py-3">
      <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">
        <Sparkles className="h-3 w-3" />
        {label}
      </p>
      <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">{copy}</p>
    </div>
  );
}

function GrandPrizeCard({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-3 backdrop-blur-sm">
      <Gift className="h-4 w-4 text-white/80" />
      <span className="text-[11px] font-bold text-white">{title}</span>
    </div>
  );
}
