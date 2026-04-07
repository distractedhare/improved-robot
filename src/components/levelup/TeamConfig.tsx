import { useCallback, useRef, useState } from 'react';
import { Check, Download, Settings, Upload, Users } from 'lucide-react';
import {
  getTeamConfig,
  saveTeamConfig,
  getMascotEmoji,
  MASCOT_OPTIONS,
  MascotId,
  TeamConfig as TeamConfigType,
  exportTeamConfigJSON,
  importTeamConfigJSON,
} from '../../services/teamConfigService';

const FOCUS_OPTIONS = [
  'Sales Fundamentals',
  'Product Knowledge',
  'Closing Techniques',
  'Objection Handling',
  'Home Internet',
  'Accessories & Bundles',
  'Customer Experience',
  'Switcher Conversions',
];

export default function TeamConfig() {
  const [config, setConfig] = useState<TeamConfigType>(getTeamConfig);
  const [saved, setSaved] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = useCallback(<K extends keyof TeamConfigType>(key: K, value: TeamConfigType[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const handleSave = () => {
    saveTeamConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const json = exportTeamConfigJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-config-${config.teamName || 'default'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== 'string') return;

      const imported = importTeamConfigJSON(text);
      if (imported) {
        setConfig(imported);
        setImportError(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setImportError('Invalid config file. Make sure it includes a team name.');
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be re-imported
    event.target.value = '';
  };

  const hasTeam = config.teamName.trim().length > 0;

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-t-magenta/10">
          <Users className="h-7 w-7 text-t-magenta" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Team Setup</h3>
        <p className="mt-1 text-sm font-medium text-t-dark-gray">
          Customize your squad. Import a config file or set it up here.
        </p>
      </div>

      {/* Team header preview */}
      {hasTeam && (
        <div className="glass-elevated rounded-2xl p-4 text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-t-magenta/10 text-3xl">
            {config.customLogoUrl ? (
              <img src={config.customLogoUrl} alt="Team logo" className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              getMascotEmoji(config.mascotId)
            )}
          </div>
          <p className="text-lg font-black uppercase tracking-tight text-foreground">{config.teamName}</p>
          {config.goalText && (
            <p className="mt-1 text-xs font-medium text-t-dark-gray italic">"{config.goalText}"</p>
          )}
          {config.managerName && (
            <p className="mt-1 text-[10px] text-t-muted">Led by {config.managerName}</p>
          )}
        </div>
      )}

      {/* Form */}
      <div className="space-y-4">
        {/* Team Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
            Team Name
          </label>
          <input
            type="text"
            value={config.teamName}
            onChange={(e) => updateField('teamName', e.target.value)}
            placeholder="e.g. The Closers, Squad Magenta, Team Phoenix"
            className="focus-ring w-full rounded-xl border border-t-light-gray bg-surface px-4 py-3 text-sm font-medium text-foreground placeholder:text-t-dark-gray/30"
          />
        </div>

        {/* Manager Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
            Manager / Lead Name
          </label>
          <input
            type="text"
            value={config.managerName}
            onChange={(e) => updateField('managerName', e.target.value)}
            placeholder="e.g. Sarah K."
            className="focus-ring w-full rounded-xl border border-t-light-gray bg-surface px-4 py-3 text-sm font-medium text-foreground placeholder:text-t-dark-gray/30"
          />
        </div>

        {/* Mascot */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
            Team Mascot
          </label>
          <div className="flex flex-wrap gap-2">
            {MASCOT_OPTIONS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => updateField('mascotId', m.id as MascotId)}
                className={`focus-ring flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition-all ${
                  config.mascotId === m.id
                    ? 'border-t-magenta bg-t-magenta/10 shadow-sm'
                    : 'border-t-light-gray hover:border-t-magenta/30'
                }`}
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Logo URL */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
            Custom Logo URL (optional — overrides mascot)
          </label>
          <input
            type="url"
            value={config.customLogoUrl ?? ''}
            onChange={(e) => updateField('customLogoUrl', e.target.value || null)}
            placeholder="https://example.com/logo.png"
            className="focus-ring w-full rounded-xl border border-t-light-gray bg-surface px-4 py-3 text-sm font-medium text-foreground placeholder:text-t-dark-gray/30"
          />
        </div>

        {/* Weekly Focus */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
            Weekly Focus
          </label>
          <div className="flex flex-wrap gap-2">
            {FOCUS_OPTIONS.map((focus) => (
              <button
                key={focus}
                type="button"
                onClick={() => updateField('weeklyFocus', focus)}
                className={`focus-ring rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  config.weeklyFocus === focus
                    ? 'border-t-magenta bg-t-magenta text-white'
                    : 'glass-button text-t-dark-gray hover:border-t-magenta/30'
                }`}
              >
                {focus}
              </button>
            ))}
          </div>
        </div>

        {/* Goal Text */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
            Team Goal / Motto
          </label>
          <input
            type="text"
            value={config.goalText}
            onChange={(e) => updateField('goalText', e.target.value)}
            placeholder="e.g. Every call counts. Close with confidence."
            className="focus-ring w-full rounded-xl border border-t-light-gray bg-surface px-4 py-3 text-sm font-medium text-foreground placeholder:text-t-dark-gray/30"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className={`focus-ring flex-1 rounded-xl py-3 text-sm font-black uppercase tracking-wider text-white transition-all ${
            saved ? 'bg-success-accent' : 'bg-t-magenta shadow-md'
          }`}
        >
          {saved ? (
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4" /> Saved
            </span>
          ) : (
            'Save Config'
          )}
        </button>
      </div>

      {/* Import / Export */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="h-3.5 w-3.5 text-t-muted" />
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-muted">
            Import / Export Config
          </p>
        </div>
        <p className="text-[11px] font-medium text-t-dark-gray mb-3">
          Share a single JSON file across the team. Upload once, everyone gets the same setup.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={!hasTeam}
            className="focus-ring flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-t-light-gray px-3 py-2 text-[10px] font-bold text-t-dark-gray transition-all hover:border-t-magenta/30 disabled:opacity-40"
          >
            <Download className="h-3 w-3" /> Export
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="focus-ring flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-t-light-gray px-3 py-2 text-[10px] font-bold text-t-dark-gray transition-all hover:border-t-magenta/30"
          >
            <Upload className="h-3 w-3" /> Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {importError && (
          <p className="mt-2 text-[10px] font-bold text-error-accent">{importError}</p>
        )}
      </div>
    </div>
  );
}
