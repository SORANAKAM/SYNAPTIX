import React, { useState } from 'react';
import { UserProfile, Subject } from '../types';
import { Plus, Trash2, ArrowRight, Brain, Calendar, Clock } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState(4);
  const [stressLevel, setStressLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: '', syllabus: '', confidence: 3 },
  ]);

  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now().toString(), name: '', syllabus: '', confidence: 3 }]);
  };

  const updateSubject = (id: string, field: keyof Subject, value: any) => {
    setSubjects(subjects.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const handleSubmit = () => {
    onComplete({
      name,
      examName,
      examDate,
      dailyHours,
      stressLevel,
      subjects: subjects.filter(s => s.name.trim() !== ''),
    });
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all";
  const labelClass = "block text-sm font-medium text-slate-400 mb-2";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-indigo-400 mb-2 flex items-center justify-center gap-2">
          <Brain className="w-8 h-8" />
          Academic Rescue Agent
        </h1>
        <p className="text-slate-400">Let's build a realistic plan to get you through this.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">The Basics</h2>
            <div>
              <label className={labelClass}>What should we call you?</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Student" />
            </div>
            <div>
              <label className={labelClass}>Exam Name</label>
              <input type="text" value={examName} onChange={e => setExamName(e.target.value)} className={inputClass} placeholder="e.g., Final Physics, Bar Exam" />
            </div>
            <div>
              <label className={labelClass}>Exam Date</label>
              <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className={inputClass} />
            </div>
             <button 
              onClick={() => setStep(2)} 
              disabled={!examName || !examDate}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">What are we studying?</h2>
            {subjects.map((subject, index) => (
              <div key={subject.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-400">Subject {index + 1}</span>
                  {subjects.length > 1 && (
                    <button onClick={() => removeSubject(subject.id)} className="text-rose-400 hover:text-rose-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Subject Name (e.g., Organic Chemistry)"
                    value={subject.name}
                    onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Paste key syllabus topics or notes here..."
                    value={subject.syllabus}
                    onChange={(e) => updateSubject(subject.id, 'syllabus', e.target.value)}
                    className={`${inputClass} h-24 resize-none`}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Confidence (1 = Panic, 5 = Mastered)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={subject.confidence}
                    onChange={(e) => updateSubject(subject.id, 'confidence', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addSubject} className="w-full py-2 border-2 border-dashed border-slate-700 text-slate-400 rounded-lg hover:border-indigo-500 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Another Subject
            </button>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-3 text-slate-400 hover:text-white transition-colors">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors">Next Step</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-white mb-6">Reality Check</h2>
            
            <div className="space-y-4">
              <label className={labelClass}>Ideally, how many hours can you study per day?</label>
              <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700">
                <Clock className="w-6 h-6 text-indigo-400" />
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseInt(e.target.value))}
                  className="bg-transparent text-white text-xl font-bold outline-none w-20"
                />
                <span className="text-slate-400">hours</span>
              </div>
              <p className="text-xs text-slate-500">We will likely schedule less than this to prevent burnout.</p>
            </div>

            <div className="space-y-4">
              <label className={labelClass}>How stressed do you feel right now?</label>
              <div className="grid grid-cols-3 gap-4">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setStressLevel(level)}
                    className={`p-4 rounded-xl border-2 transition-all capitalize font-medium ${
                      stressLevel === level
                        ? level === 'high' ? 'border-rose-500 bg-rose-500/20 text-rose-200' 
                          : level === 'medium' ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                          : 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex gap-4">
               <button onClick={() => setStep(2)} className="flex-1 py-3 text-slate-400 hover:text-white transition-colors">Back</button>
               <button 
                onClick={handleSubmit}
                className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-lg shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                Generate Rescue Plan <Brain className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
