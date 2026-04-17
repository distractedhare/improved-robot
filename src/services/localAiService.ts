import {
  CreateMLCEngine,
  InitProgressReport,
  MLCEngine,
  deleteModelAllInfoInCache,
  prebuiltAppConfig,
} from "@mlc-ai/web-llm";

type ProgressListener = (progress: InitProgressReport) => void;
type ReadyListener = (isReady: boolean) => void;
type ErrorListener = (error: string | null) => void;
export type LocalAiErrorCode = 'unsupported' | 'memory' | 'network' | 'quota' | 'cache' | 'webgpu' | 'generic' | null;
export interface LocalAiStorageEstimate {
  usageBytes: number;
  quotaBytes: number;
  availableBytes: number;
  persisted: boolean | null;
}

const GENERATION_TIMEOUT_MS = 2500;
const PRIMARY_MODEL_ID = "gemma-2-2b-it-q4f16_1-MLC";
const FALLBACK_MODEL_ID = "gemma-2b-it-q4f16_1-MLC";
const CACHE_API_APP_CONFIG = {
  ...prebuiltAppConfig,
  useIndexedDBCache: false,
};
const INDEXED_DB_APP_CONFIG = {
  ...prebuiltAppConfig,
  useIndexedDBCache: true,
};

class LocalAiService {
  private engine: MLCEngine | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  private progressListeners: ProgressListener[] = [];
  private readyListeners: ReadyListener[] = [];
  private errorListeners: ErrorListener[] = [];
  private lastProgress: InitProgressReport | null = null;
  private lastError: string | null = null;
  private lastErrorCode: LocalAiErrorCode = null;
  private activeModelId: string | null = null;

  private notifyProgress(progress: InitProgressReport) {
    this.progressListeners.forEach(fn => fn(progress));
  }

  private notifyReady(isReady: boolean) {
    this.readyListeners.forEach(fn => fn(isReady));
  }

  private notifyError(error: string | null) {
    this.errorListeners.forEach(fn => fn(error));
  }

  private setError(error: string | null, code: LocalAiErrorCode = null) {
    this.lastError = error;
    this.lastErrorCode = error ? code : null;
    this.notifyError(error);
  }

  private formatInitError(error: unknown): { message: string; code: LocalAiErrorCode } {
    const raw = error instanceof Error ? error.message : String(error || 'Unknown error');
    const message = raw.toLowerCase();

    if (!this.isSupported()) {
      return {
        code: 'unsupported',
        message: 'This browser does not expose WebGPU. Open the app in a current Chrome, Edge, or Safari build with WebGPU enabled.',
      };
    }

    if (message.includes('out of memory') || message.includes('insufficient memory')) {
      return {
        code: 'memory',
        message: 'The full Gemma model ran out of memory while loading. The app will try a lighter local model first, but closing heavy tabs or apps will help.',
      };
    }

    if (
      message.includes("failed to execute 'add' on 'cache'") ||
      message.includes('unexpected internal error') ||
      message.includes('artifactindexeddbcache failed to fetch')
    ) {
      return {
        code: 'cache',
        message: 'The local storage path rejected part of the Gemma download. The app will try another recovery path, but you can also clear the partial Gemma files and retry.',
      };
    }

    if (message.includes('quota') || message.includes('storage')) {
      return {
        code: 'quota',
        message: 'This browser ran out of local storage while downloading Gemma. Clear the partial Gemma files, keep roughly 2 GB free for this site, and try again.',
      };
    }

    if (message.includes('fetch') || message.includes('network') || message.includes('download')) {
      return {
        code: 'network',
        message: 'The Gemma download was interrupted. Keep this tab open, confirm the internet connection, and try again.',
      };
    }

    if (message.includes('webgpu') || message.includes('navigator.gpu')) {
      return {
        code: 'webgpu',
        message: 'WebGPU is not available for this browser session. Try Chrome, Edge, or Safari with hardware acceleration enabled.',
      };
    }

    return {
      code: 'generic',
      message: `Gemma could not finish loading: ${raw}`,
    };
  }

  private async requestPersistentStorage() {
    if (typeof navigator === 'undefined' || !navigator.storage?.persist) return;
    try {
      await navigator.storage.persist();
    } catch {
      // Best-effort only. Browsers may ignore this request.
    }
  }

  private async clearCachedModelArtifacts(modelId: string) {
    await Promise.allSettled([
      deleteModelAllInfoInCache(modelId, CACHE_API_APP_CONFIG),
      deleteModelAllInfoInCache(modelId, INDEXED_DB_APP_CONFIG),
    ]);
  }

  async getStorageEstimate(): Promise<LocalAiStorageEstimate | null> {
    if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
      return null;
    }

    try {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      let persisted: boolean | null = null;

      if (navigator.storage.persisted) {
        try {
          persisted = await navigator.storage.persisted();
        } catch {
          persisted = null;
        }
      }

      return {
        usageBytes: usage,
        quotaBytes: quota,
        availableBytes: Math.max(0, quota - usage),
        persisted,
      };
    } catch {
      return null;
    }
  }

  async resetDownload() {
    if (this.engine) {
      try {
        await this.engine.unload();
      } catch (error) {
        console.warn('Failed to unload local AI engine before reset.', error);
      }
    }

    this.engine = null;
    this.activeModelId = null;
    this.isInitializing = false;
    this.initPromise = null;
    this.lastProgress = null;
    this.setError(null);
    this.notifyReady(false);

    const cleanupTargets = [PRIMARY_MODEL_ID, FALLBACK_MODEL_ID];
    await Promise.allSettled(cleanupTargets.map((modelId) => this.clearCachedModelArtifacts(modelId)));
  }

  isSupported() {
    if (typeof window === 'undefined') return false;
    return typeof navigator !== 'undefined' && 'gpu' in navigator;
  }

  async initialize() {
    if (this.engine) return;
    if (this.initPromise) return this.initPromise;

    if (!this.isSupported()) {
      const unsupportedMessage = 'This browser does not expose WebGPU. Open the app in a current Chrome, Edge, or Safari build with WebGPU enabled.';
      this.setError(unsupportedMessage);
      this.notifyReady(false);
      throw new Error(unsupportedMessage);
    }

    this.isInitializing = true;
    this.lastProgress = null;
    this.setError(null);
    this.initPromise = (async () => {
      let lastFailure: { message: string; code: LocalAiErrorCode } | null = null;

      try {
        await this.requestPersistentStorage();

        const attempts = [
          {
            modelId: PRIMARY_MODEL_ID,
            appConfig: CACHE_API_APP_CONFIG,
            progressText: null,
          },
          {
            modelId: PRIMARY_MODEL_ID,
            appConfig: INDEXED_DB_APP_CONFIG,
            progressText: 'Switching Gemma to a more reliable storage path...',
          },
          {
            modelId: FALLBACK_MODEL_ID,
            appConfig: INDEXED_DB_APP_CONFIG,
            progressText: 'Switching to a lighter Gemma download for this device...',
          },
        ] as const;

        for (const attempt of attempts) {
          if (attempt.progressText) {
            const fallbackProgress: InitProgressReport = {
              progress: 0,
              timeElapsed: 0,
              text: attempt.progressText,
            };
            this.lastProgress = fallbackProgress;
            this.notifyProgress(fallbackProgress);
          }

          try {
            this.engine = await CreateMLCEngine(
              attempt.modelId,
              {
                appConfig: attempt.appConfig,
                initProgressCallback: (progress) => {
                  this.lastProgress = progress;
                  this.notifyProgress(progress);
                }
              }
            );
            this.activeModelId = attempt.modelId;
            this.setError(null);
            this.notifyReady(true);
            return;
          } catch (error) {
            this.engine = null;
            this.activeModelId = null;
            lastFailure = this.formatInitError(error);
            console.error("Failed to initialize local AI:", error);

            if (
              (lastFailure.code === 'quota' || lastFailure.code === 'cache' || lastFailure.code === 'memory') &&
              attempt.modelId === PRIMARY_MODEL_ID
            ) {
              try {
                await this.clearCachedModelArtifacts(attempt.modelId);
              } catch (cleanupError) {
                console.warn('Failed to clear the primary Gemma cache before retrying.', cleanupError);
              }
              continue;
            }

            break;
          }
        }

        const failure = lastFailure ?? {
          code: 'generic' as const,
          message: 'Gemma could not finish loading.',
        };
        this.setError(failure.message, failure.code);
        this.notifyReady(false);
        throw new Error(failure.message);
      } finally {
        this.isInitializing = false;
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  onProgress(fn: ProgressListener) {
    this.progressListeners.push(fn);
    if (this.lastProgress) fn(this.lastProgress);
    return () => {
      this.progressListeners = this.progressListeners.filter(l => l !== fn);
    };
  }

  onReady(fn: ReadyListener) {
    this.readyListeners.push(fn);
    if (this.engine) fn(true);
    return () => {
      this.readyListeners = this.readyListeners.filter(l => l !== fn);
    };
  }

  onError(fn: ErrorListener) {
    this.errorListeners.push(fn);
    if (this.lastError !== null) fn(this.lastError);
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== fn);
    };
  }

  /**
   * Generate a response from the local WebLLM engine with a strict 2.5s
   * timeout. If the engine isn't ready, times out, or throws (OOM / GPU
   * context lost / model load failure), returns the caller-provided
   * `baseline` so the UI never freezes during a live call.
   */
  async generateResponse(prompt: string, systemPrompt?: string, baseline = ""): Promise<string> {
    if (!this.engine) return baseline;

    const messages: { role: 'system' | 'user'; content: string }[] = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: prompt });

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('local-ai-timeout')), GENERATION_TIMEOUT_MS);
    });

    try {
      const reply = await Promise.race([
        this.engine.chat.completions.create({ messages }),
        timeoutPromise,
      ]);
      return reply.choices[0]?.message?.content || baseline;
    } catch {
      return baseline;
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }
  }

  isReady() {
    return this.engine !== null;
  }

  getError() {
    return this.lastError;
  }

  getErrorCode() {
    return this.lastErrorCode;
  }

  getActiveModelLabel() {
    if (this.activeModelId === PRIMARY_MODEL_ID) {
      return 'Gemma 2';
    }

    if (this.activeModelId === FALLBACK_MODEL_ID) {
      return 'Gemma Lite';
    }

    return 'Gemma';
  }
}

export const localAiService = new LocalAiService();
