import { MessageCircle, Target, ArrowRightLeft, Users, PhoneForwarded, BookOpen } from 'lucide-react';
import {
  DISCOVERY_QUESTIONS,
  OBJECTION_TEMPLATES,
  CLOSING_TECHNIQUES,
  RAPPORT_BY_AGE,
  SERVICE_TO_SALES,
  TRANSITIONS,
} from '../../data/salesMethodology';

export default function PlaybookSection() {
  return (
    <div className="space-y-6">

      {/* Actionable Rules */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" /> Phone-Sales Logic
        </h3>
        <ul className="space-y-3">
          <li className="text-sm text-blue-800 font-medium">1. Start with what they will feel or save, not the spec sheet.</li>
          <li className="text-sm text-blue-800 font-medium">2. Tie the offer to a real fit driver (value, convenience, safety, productivity).</li>
          <li className="text-sm text-blue-800 font-medium">3. Use one proof point to back it up, then stop talking.</li>
          <li className="text-sm text-blue-800 font-medium">4. Match the language to the caller instead of pitching the same way to everyone.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Discovery Questions */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-t-magenta/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-t-magenta" />
            </div>
            <h3 className="text-xl font-bold">Discovery Questions</h3>
          </div>
          <div className="space-y-6">
            {Object.entries(DISCOVERY_QUESTIONS).map(([category, questions]) => (
              <div key={category}>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{category}</h4>
                <ul className="space-y-2">
                  {questions.map((q, i) => (
                    <li key={i} className="text-sm text-gray-800 font-medium flex gap-2">
                      <span className="text-t-magenta">•</span> {q}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Objection Frameworks */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-t-magenta/10 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-t-magenta" />
            </div>
            <h3 className="text-xl font-bold">Objection Comebacks</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(OBJECTION_TEMPLATES).map(([objection, data]) => (
              <div key={objection} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-sm font-bold text-red-600 mb-2">"{objection}"</p>
                <p className="text-sm font-semibold text-gray-900 mb-3">{data.rebuttal}</p>
                <ul className="space-y-1.5">
                  {data.talkingPoints.map((tp, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-t-magenta">•</span> {tp}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
