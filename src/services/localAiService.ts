import { CreateMLCEngine, InitProgressReport, MLCEngine } from "@mlc-ai/web-llm";

type ProgressListener = (progress: InitProgressReport) => void;
type ReadyListener = (isReady: boolean) => void;

const GENERATION_TIMEOUT_MS = 2500;

class LocalAiService {
  private engine: MLCEngine | null = null;
  private isInitializing = false;
  private progressListeners: ProgressListener[] = [];
  private readyListeners: ReadyListener[] = [];
  private lastProgress: InitProgressReport | null = null;

  async initialize() {
    if (this.engine || this.isInitializing) return;
    this.isInitializing = true;
    try {
      // Using Gemma 2 2B Instruct quantized for WebGPU
      this.engine = await CreateMLCEngine(
        "gemma-2-2b-it-q4f16_1-MLC",
        {
          initProgressCallback: (progress) => {
            this.lastProgress = progress;
            this.progressListeners.forEach(fn => fn(progress));
          }
        }
      );
      this.readyListeners.forEach(fn => fn(true));
    } catch (error) {
      console.error("Failed to initialize local AI:", error);
    } finally {
      this.isInitializing = false;
    }
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
}

export const localAiService = new LocalAiService();
