import { useState, useEffect, useRef } from 'react';
import {
  Settings, Users, MessageSquare, Rocket, Download,
  Wifi, ShieldCheck, Loader2, CheckCircle2, AlertCircle,
  Bug, Info, Lock, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TeamJoin from './levelup/TeamJoin';
import FeedbackForm from './levelup/FeedbackForm';
import Roadmap from './levelup/Roadmap';
import { localAiService, type LocalAiStorageEstimate } from '../services/localAiService';
import { InitProgressReport } from '@mlc-ai/web-llm';

type SettingsTab = 'team' | 'feedback' | 'roadmap' | 'offline-ai';

const VERSION = "1.2.4-stable";
const BUILD_ID = "CC-AI-2026-04-08";
const ADMIN_PASSCODE = 'manager';

function formatStorageBytes(value: number) {
  if (value <= 0) return '0 GB';
  return `${(value / (1024 ** 3)).toFixed(value >= 1024 ** 3 ? 1 : 2)} GB`;
}

interface SettingsViewProps {
  onOpenLeaderboard?: () => void;
}

export default function SettingsView({ onOpenLeaderboard }: SettingsViewProps = {}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('team');
  const [isAiReady, setIsAiReady] = useState(localAiService.isReady());
  const [aiProgress, setAiProgress] = useState<InitProgressReport | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(localAiService.getError());
  const [aiErrorCode, setAiErrorCode] = useState(localAiService.getErrorCode());
  const [storageEstimate, setStorageEstimate] = useState<LocalAiStorageEstimate | null>(null);
  const [isResettingAi, setIsResettingAi] = useState(false);
  const [activeModelLabel, setActiveModelLabel] = useState(localAiService.getActiveModelLabel());
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminShake, setAdminShake] = useState(0);
  const adminInputRef = useRef<HTMLInputElement>(null);
  const isAiSupported = localAiService.isSupported();

  const refreshStorageEstimate = async () => {
    const nextEstimate = await localAiService.getStorageEstimate();
    setStorageEstimate(nextEstimate);
  };

  useEffect(() => {
    void refreshStorageEstimate();

    const unsubscribeProgress = localAiService.onProgress((p) => setAiProgress(p));
    const unsubscribeReady = localAiService.onReady((ready) => {
      setIsAiReady(ready);
      setActiveModelLabel(localAiService.getActiveModelLabel());
      if (ready) {
        setIsDownloading(false);
        void refreshStorageEstimate();
      }
    });
    const unsubscribeError = localAiService.onError((error) => {
      setAiError(error);
      setAiErrorCode(localAiService.getErrorCode());
      if (error) setIsDownloading(false);
      void refreshStorageEstimate();
    });

    return () => {
      unsubscribeProgress();
      unsubscribeReady();
      unsubscribeError();
    };
  }, []);

  useEffect(() => {
    if (adminOpen) {
      const id = requestAnimationFrame(() => adminInputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [adminOpen]);

  const closeAdmin = () => {
    setAdminOpen(false);
    setAdminInput('');
    setAdminError(null);
  };

  const submitAdmin = () => {
    if (adminInput.trim().toLowerCase() === ADMIN_PASSCODE) {
      closeAdmin();
      onOpenLeaderboard?.();
      return;
    }
    setAdminError('Access Denied');
    setAdminShake((n) => n + 1);
    setAdminInput('');
    adminInputRef.current?.focus();
  };

  const handleDownloadAi = async () => {
    if (isAiReady || isDownloading) return;
    setIsDownloading(true);
    setAiError(null);
    setAiErrorCode(null);
    try {
      await localAiService.initialize();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize local AI.';
      setAiError(message);
      setAiErrorCode(localAiService.getErrorCode());
      setIsDownloading(false);
    } finally {
      await refreshStorageEstimate();
    }
  };

  const handleResetAi = async () => {
    if (isResettingAi) return;
    setIsResettingAi(true);
    try {
      await localAiService.resetDownload();
      setAiProgress(null);
      setAiError(null);
      setAiErrorCode(null);
      setActiveModelLabel(localAiService.getActiveModelLabel());
    } finally {
      await refreshStorageEstimate();
      setIsResettingAi(false);
    }
  };

  const tabs = [
    { id: 'team' as const, icon: Users, label: 'Team Setup', description: 'Manage your squad' },
    { id: 'offline-ai' as const, icon: Wifi, label: 'Offline AI', description: 'Gemma model status' },
    { id: 'feedback' as const, icon: MessageSquare, label: 'Feedback', description: 'Send pilot notes' },
    { id: 'roadmap' as const, icon: Rocket, label: 'Roadmap', description: "What's coming next" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-t-magenta/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-t-magenta" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Settings</h1>
          <p className="text-xs font-medium text-t-dark-gray">Configure your experience and manage local assets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar Nav */}
        <div className="md:col-span-4 space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-3 border ${
                  isActive 
                    ? 'bg-t-magenta text-white border-t-magenta shadow-lg shadow-t-magenta/20' 
                    : 'bg-surface text-t-dark-gray border-t-light-gray hover:bg-t-light-gray/20'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-t-magenta'}`} />
                <div>
                  <p className="text-xs font-black uppercase tracking-wider">{tab.label}</p>
                  <p className={`text-[10px] font-medium ${isActive ? 'text-white/70' : 'text-t-muted'}`}>
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}

          {/* App Info Card */}
          <div className="mt-6 p-4 rounded-2xl border border-t-light-gray bg-surface-elevated space-y-3">
            <div className="flex items-center gap-2 text-t-magenta">
              <Info className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">System Info</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-t-muted">Version</span>
                <span className="text-t-dark-gray">{VERSION}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-t-muted">Build ID</span>
                <span className="text-t-dark-gray">{BUILD_ID}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-t-muted">Environment</span>
                <span className="text-success-accent">Production</span>
              </div>
            </div>
            <button className="w-full mt-2 py-2 rounded-lg border border-t-light-gray bg-surface text-[9px] font-black uppercase tracking-widest text-t-dark-gray hover:bg-t-light-gray/30 flex items-center justify-center gap-2">
              <Bug className="w-3 h-3" />
              Report a Bug
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-3xl p-6 min-h-[400px]"
            >
              {activeTab === 'team' && <TeamJoin />}
              {activeTab === 'feedback' && <FeedbackForm />}
              {activeTab === 'roadmap' && <Roadmap onSwitchToFeedback={() => setActiveTab('feedback')} />}
              
              {activeTab === 'offline-ai' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-t-magenta/10 flex items-center justify-center">
                      <Wifi className="w-6 h-6 text-t-magenta" />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold tracking-tight">Dead-Zone AI Coach</h2>
                      <p className="text-xs font-medium text-t-dark-gray">Gemma running locally on your hardware, with a lighter fallback if space gets tight.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-t-light-gray bg-t-light-gray/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className={`w-4 h-4 ${isAiReady ? 'text-success-accent' : isDownloading ? 'text-t-magenta' : 'text-t-muted'}`} />
                        <span className="text-xs font-bold">Model Status</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                        isAiReady
                          ? 'bg-success-surface text-success-accent'
                          : isDownloading
                            ? 'bg-t-magenta/10 text-t-magenta'
                            : aiError
                              ? 'bg-error-surface text-error-foreground'
                              : 'bg-t-light-gray text-t-muted'
                      }`}>
                        {isAiReady ? 'Ready' : isDownloading ? 'Downloading' : aiError ? 'Needs Attention' : 'Not Loaded'}
                      </span>
                    </div>

                    <p className="text-xs text-t-dark-gray leading-relaxed">
                      The offline coach requires a large one-time Gemma download. Plan for roughly 2 GB of free browser storage the first time, then it runs without an internet connection.
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-t-light-gray bg-surface px-3 py-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-t-muted">Browser support</p>
                        <p className="mt-1 text-[11px] font-medium text-t-dark-gray">
                          {isAiSupported ? 'WebGPU detected for this browser session.' : 'WebGPU not detected. Chrome, Edge, or Safari with WebGPU enabled is required.'}
                        </p>
                      </div>
                      <div className="rounded-xl border border-t-light-gray bg-surface px-3 py-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-t-muted">First download</p>
                        <p className="mt-1 text-[11px] font-medium text-t-dark-gray">
                          Keep this tab open. The first download can take several minutes before the coach is fully ready.
                        </p>
                      </div>
                      {storageEstimate && (
                        <div className="rounded-xl border border-t-light-gray bg-surface px-3 py-3 sm:col-span-2">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-t-muted">Browser storage</p>
                            {storageEstimate.persisted !== null && (
                              <span className={`text-[9px] font-black uppercase tracking-widest ${
                                storageEstimate.persisted ? 'text-success-accent' : 'text-t-muted'
                              }`}>
                                {storageEstimate.persisted ? 'Persistent' : 'Best effort'}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[11px] font-medium text-t-dark-gray">
                            About {formatStorageBytes(storageEstimate.availableBytes)} appears free for this site right now, with {formatStorageBytes(storageEstimate.usageBytes)} already in use.
                          </p>
                        </div>
                      )}
                    </div>

                    {isDownloading && aiProgress && (
                      <div className="space-y-2 rounded-xl border border-t-magenta/20 bg-t-magenta/5 p-3">
                        <div className="flex justify-between text-[10px] font-bold text-t-magenta">
                          <span>{aiProgress.text}</span>
                          <span>{Math.round((aiProgress.progress || 0) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-t-light-gray rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-t-magenta"
                            initial={{ width: 0 }}
                            animate={{ width: `${(aiProgress.progress || 0) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {aiError && (
                      <div className="space-y-2 rounded-xl border border-error-border bg-error-surface p-3 text-error-foreground">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Download issue</p>
                        </div>
                        <p className="text-[10px] font-bold leading-relaxed">{aiError}</p>
                        <p className="text-[10px] font-medium opacity-80">
                          {(aiErrorCode === 'quota' || aiErrorCode === 'cache')
                            ? 'The local browser storage path failed before Gemma finished downloading. Clear the partial files below, then retry after freeing some space.'
                            : 'If this is a support issue, open the app in Chrome, Edge, or Safari with hardware acceleration enabled, then try again.'}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={handleDownloadAi}
                        disabled={isAiReady || isDownloading || !isAiSupported || isResettingAi}
                        className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${
                          isAiReady 
                            ? 'bg-success-accent/10 text-success-accent border border-success-accent/20 cursor-default' 
                            : !isAiSupported
                              ? 'bg-t-light-gray text-t-muted border border-t-light-gray cursor-not-allowed'
                              : 'bg-t-magenta text-white shadow-lg shadow-t-magenta/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50'
                        }`}
                      >
                        {isAiReady ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">{activeModelLabel} Installed</span>
                          </>
                        ) : !isAiSupported ? (
                          <>
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">WebGPU Required</span>
                          </>
                        ) : isDownloading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-xs font-black uppercase tracking-widest">Downloading...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">{aiError ? 'Retry Gemma Download' : 'Download Gemma Model'}</span>
                          </>
                        )}
                      </button>

                      {(!isAiReady || aiError) && (
                        <button
                          onClick={handleResetAi}
                          disabled={isDownloading || isResettingAi}
                          className="py-4 px-5 rounded-2xl border border-t-light-gray bg-surface text-t-dark-gray flex items-center justify-center gap-3 transition-all hover:bg-t-light-gray/30 disabled:opacity-50 sm:min-w-[220px]"
                        >
                          {isResettingAi ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span className="text-xs font-black uppercase tracking-widest">Clearing Files...</span>
                            </>
                          ) : (
                            <>
                              <X className="w-5 h-5" />
                              <span className="text-xs font-black uppercase tracking-widest">Clear Gemma Files</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-t-light-gray bg-surface text-center">
                      <p className="text-[9px] font-black uppercase tracking-widest text-t-muted">Privacy</p>
                      <p className="text-[10px] font-bold text-t-dark-gray mt-1">100% On-Device</p>
                    </div>
                    <div className="p-3 rounded-xl border border-t-light-gray bg-surface text-center">
                      <p className="text-[9px] font-black uppercase tracking-widest text-t-muted">Active Model</p>
                      <p className="text-[10px] font-bold text-t-dark-gray mt-1">{isAiReady ? activeModelLabel : 'Waiting to install'}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="pt-6 text-center">
        <button
          type="button"
          onClick={() => setAdminOpen(true)}
          className="text-[10px] font-medium tracking-wide text-t-muted/70 underline-offset-4 hover:text-t-muted hover:underline"
        >
          Admin Access
        </button>
      </div>

      <AnimatePresence>
        {adminOpen && (
          <motion.div
            key="admin-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
            onClick={closeAdmin}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
          >
            <motion.div
              key="admin-card"
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl glass-card p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={closeAdmin}
                aria-label="Close admin dialog"
                className="focus-ring absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-t-muted hover:bg-t-light-gray/30 hover:text-t-dark-gray"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-t-magenta/10">
                  <Lock className="h-5 w-5 text-t-magenta" />
                </div>
                <h2 id="admin-modal-title" className="mt-3 text-lg font-black uppercase tracking-tight">
                  Admin Access
                </h2>
                <p className="mt-1 text-xs font-medium text-t-dark-gray">
                  Enter the manager passcode to view the leaderboard.
                </p>
              </div>

              <motion.input
                ref={adminInputRef}
                type="password"
                value={adminInput}
                onChange={(e) => {
                  setAdminInput(e.target.value);
                  if (adminError) setAdminError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitAdmin();
                  if (e.key === 'Escape') closeAdmin();
                }}
                placeholder="Passcode"
                aria-label="Admin passcode"
                aria-invalid={Boolean(adminError)}
                key={adminShake}
                animate={adminError ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className={`focus-ring mt-5 w-full rounded-xl border bg-surface px-4 py-3 text-center font-mono text-sm tracking-widest placeholder:text-t-muted focus:border-t-magenta ${
                  adminError ? 'border-error-border' : 'border-t-light-gray'
                }`}
              />

              <div className="mt-2 h-4 text-center">
                {adminError && (
                  <p className="text-[11px] font-black uppercase tracking-widest text-error-accent">
                    {adminError}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={submitAdmin}
                disabled={!adminInput.trim()}
                className="focus-ring mt-3 w-full rounded-2xl bg-t-magenta py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-t-magenta/25 transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                Unlock
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
