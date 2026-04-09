import { useState, useEffect } from 'react';
import { 
  Settings, Users, MessageSquare, Rocket, Download, 
  Wifi, ShieldCheck, Loader2, CheckCircle2, AlertCircle,
  Bug, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TeamConfig from './levelup/TeamConfig';
import FeedbackForm from './levelup/FeedbackForm';
import Roadmap from './levelup/Roadmap';
import { localAiService } from '../services/localAiService';
import { InitProgressReport } from '@mlc-ai/web-llm';

type SettingsTab = 'team' | 'feedback' | 'roadmap' | 'offline-ai';

const VERSION = "1.2.4-stable";
const BUILD_ID = "CC-AI-2026-04-08";

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('team');
  const [isAiReady, setIsAiReady] = useState(localAiService.isReady());
  const [aiProgress, setAiProgress] = useState<InitProgressReport | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeProgress = localAiService.onProgress((p) => setAiProgress(p));
    const unsubscribeReady = localAiService.onReady((ready) => {
      setIsAiReady(ready);
      if (ready) setIsDownloading(false);
    });

    return () => {
      unsubscribeProgress();
      unsubscribeReady();
    };
  }, []);

  const handleDownloadAi = async () => {
    if (isAiReady || isDownloading) return;
    setIsDownloading(true);
    setAiError(null);
    try {
      await localAiService.initialize();
    } catch (err) {
      setAiError("Failed to initialize local AI. Your device might not support WebGPU.");
      setIsDownloading(false);
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
              {activeTab === 'team' && <TeamConfig />}
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
                      <p className="text-xs font-medium text-t-dark-gray">Gemma 2B running locally on your hardware.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-t-light-gray bg-t-light-gray/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className={`w-4 h-4 ${isAiReady ? 'text-success-accent' : 'text-t-muted'}`} />
                        <span className="text-xs font-bold">Model Status</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                        isAiReady ? 'bg-success-surface text-success-accent' : 'bg-t-light-gray text-t-muted'
                      }`}>
                        {isAiReady ? 'Ready' : 'Not Loaded'}
                      </span>
                    </div>

                    <p className="text-xs text-t-dark-gray leading-relaxed">
                      The offline coach requires a one-time download of the Gemma AI model (~1.5GB). 
                      Once downloaded, it works instantly without any internet connection.
                    </p>

                    {isDownloading && aiProgress && (
                      <div className="space-y-2">
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
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-error-surface text-error-foreground border border-error-border">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p className="text-[10px] font-bold">{aiError}</p>
                      </div>
                    )}

                    <button
                      onClick={handleDownloadAi}
                      disabled={isAiReady || isDownloading}
                      className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${
                        isAiReady 
                          ? 'bg-success-accent/10 text-success-accent border border-success-accent/20 cursor-default' 
                          : 'bg-t-magenta text-white shadow-lg shadow-t-magenta/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50'
                      }`}
                    >
                      {isAiReady ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-xs font-black uppercase tracking-widest">Model Installed</span>
                        </>
                      ) : isDownloading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-xs font-black uppercase tracking-widest">Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span className="text-xs font-black uppercase tracking-widest">Download Gemma Model</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-t-light-gray bg-surface text-center">
                      <p className="text-[9px] font-black uppercase tracking-widest text-t-muted">Privacy</p>
                      <p className="text-[10px] font-bold text-t-dark-gray mt-1">100% On-Device</p>
                    </div>
                    <div className="p-3 rounded-xl border border-t-light-gray bg-surface text-center">
                      <p className="text-[9px] font-black uppercase tracking-widest text-t-muted">Speed</p>
                      <p className="text-[10px] font-bold text-t-dark-gray mt-1">Instant Response</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
