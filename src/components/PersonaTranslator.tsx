import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Sparkles, RefreshCw, Heart, Mountain, Gamepad2, Briefcase, Zap } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const PERSONAS = [
  { id: 'hiker', label: 'The Hiker', icon: Mountain, description: 'Durability, battery, GPS, outdoors' },
  { id: 'mom', label: 'Mom of 3', icon: Heart, description: 'Camera, storage, durability, screen time' },
  { id: 'gamer', label: 'The Gamer', icon: Gamepad2, description: 'Speed, display, cooling, latency' },
  { id: 'pro', label: 'Business Pro', icon: Briefcase, description: 'Security, multitasking, battery' },
];

interface PersonaTranslatorProps {
  baseText: string;
  deviceName?: string;
}

export default function PersonaTranslator({ baseText, deviceName }: PersonaTranslatorProps) {
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const translate = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `
        You are a T-Mobile sales expert who excels at connecting tech to real life.
        
        Device: ${deviceName || 'this device'}
        Technical Context: ${baseText}
        Target Persona: ${selectedPersona.label} (${selectedPersona.description})
        
        Translate the technical context into a "Why it matters to YOU" talk track for this specific persona.
        Make it conversational, relatable, and focus on a specific use case (e.g., taking photos at a soccer game, not losing signal on a trail).
        
        Max 2 sentences.
        Tone: Enthusiastic, helpful, T-Mobile Magenta energy.
        No preamble, just the translated track.
      `;

      const response = await ai.models.generateContent({
        model: "gemma-2-9b-it",
        contents: prompt,
      });

      setTranslatedText(response.text || "This is perfect for your lifestyle because it handles exactly what you need without the technical headache.");
    } catch (error) {
      console.error("Gemini Error:", error);
      setTranslatedText("This device is a great fit for your needs because it's built to handle your busy schedule and keep you connected when it matters most.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl glass-card p-6 space-y-6">
      <div>
        <h3 className="text-lg font-black tracking-tight text-t-dark-gray flex items-center gap-2">
          <Users className="w-5 h-5 text-t-magenta" />
          Persona Translator
        </h3>
        <p className="text-[10px] font-medium text-t-dark-gray/60 uppercase tracking-widest">
          Tech specs → Real life use cases
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PERSONAS.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPersona(p)}
            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 ${
              selectedPersona.id === p.id 
                ? 'border-t-magenta bg-t-magenta/5 shadow-md' 
                : 'border-t-light-gray hover:border-t-magenta/20'
            }`}
          >
            <p.icon className={`w-5 h-5 ${selectedPersona.id === p.id ? 'text-t-magenta' : 'text-t-muted'}`} />
            <span className={`text-[10px] font-black uppercase tracking-tight ${selectedPersona.id === p.id ? 'text-t-magenta' : 'text-t-dark-gray'}`}>
              {p.label}
            </span>
          </button>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-t-light-gray/20 border border-t-light-gray">
        <p className="text-[9px] font-black text-t-muted uppercase mb-2">Original Tech Point</p>
        <p className="text-xs font-medium text-t-dark-gray leading-relaxed">
          "{baseText}"
        </p>
      </div>

      <AnimatePresence mode="wait">
        {translatedText ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-t-dark-gray text-white shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Zap className="w-12 h-12" />
            </div>
            <p className="text-[10px] font-black text-t-magenta uppercase mb-3 tracking-widest">
              {selectedPersona.label} Pitch
            </p>
            <p className="text-sm font-medium leading-relaxed">
              "{translatedText}"
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        disabled={loading}
        onClick={translate}
        className="w-full btn-magenta-shimmer py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Translate for {selectedPersona.label}
      </button>
    </div>
  );
}
