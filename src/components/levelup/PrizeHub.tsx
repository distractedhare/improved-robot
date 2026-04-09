import { Award, Calendar, Gift, Star, Ticket, Trophy } from 'lucide-react';

export default function PrizeHub() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-t-magenta/10">
          <Award className="h-7 w-7 text-t-magenta" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Prize Hub</h3>
        <p className="mt-1 text-sm font-medium text-t-dark-gray">
          Current team incentives. Hit the metrics, get the tickets, win the draw.
        </p>
      </div>

      {/* Daily Incentives */}
      <div className="rounded-2xl border-2 border-t-magenta/20 bg-t-magenta/5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-t-magenta" />
          <h4 className="text-sm font-black uppercase tracking-widest text-t-magenta">Daily Goals</h4>
        </div>
        <div className="space-y-3">
          <IncentiveRow metric="40% Conversion" reward="Lotto Ticket" icon={Ticket} />
          <IncentiveRow metric="15% HSI Conversion" reward="Lotto Ticket" icon={Ticket} />
          <IncentiveRow metric="3 HSI Sales" reward="15 Min Break" icon={Award} />
        </div>
      </div>

      {/* Weekly Incentives */}
      <div className="rounded-2xl border border-t-light-gray bg-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-t-dark-gray" />
          <h4 className="text-sm font-black uppercase tracking-widest text-t-dark-gray">Weekly Goals</h4>
        </div>
        <div className="space-y-3">
          <IncentiveRow metric="40% Conversion" reward="1 Monthly Ticket" icon={Ticket} />
          <IncentiveRow metric="15% HSI Conversion" reward="1 Monthly Ticket" icon={Ticket} />
          <IncentiveRow metric="12 HSI Sales" reward="1 Monthly Ticket" icon={Ticket} />
        </div>
      </div>

      {/* Monthly Grand Prize */}
      <div className="rounded-2xl bg-gradient-to-br from-t-magenta to-t-berry p-5 text-white shadow-lg">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-white" />
          <h4 className="text-sm font-black uppercase tracking-widest text-white">End of Month Draw</h4>
        </div>
        <p className="mb-4 text-xs font-medium text-white/90 leading-relaxed">
          Draw from all weekly ticket winners (3 winners total). Winners choose one of the following:
        </p>
        <div className="grid grid-cols-2 gap-3">
          <GrandPrizeCard title="WFH Week" />
          <GrandPrizeCard title="$25 Amazon GC" />
          <GrandPrizeCard title="$25 DoorDash" />
          <GrandPrizeCard title="$25 in Lotto" />
        </div>
      </div>
    </div>
  );
}

function IncentiveRow({ metric, reward, icon: Icon }: { metric: string; reward: string; icon: any }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-t-light-gray/50 bg-surface px-4 py-3">
      <span className="text-xs font-bold text-foreground">{metric}</span>
      <div className="flex items-center gap-1.5 rounded-lg bg-t-light-gray/20 px-2.5 py-1">
        <Icon className="h-3.5 w-3.5 text-t-magenta" />
        <span className="text-[10px] font-black uppercase tracking-wider text-t-magenta">{reward}</span>
      </div>
    </div>
  );
}

function GrandPrizeCard({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-3 backdrop-blur-sm">
      <Gift className="h-4 w-4 text-white/80" />
      <span className="text-[11px] font-bold text-white">{title}</span>
    </div>
  );
}
