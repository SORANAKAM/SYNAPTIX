import React, { useState, useMemo } from 'react';
import { StudyPlan, UserProfile, CheckInData, Task } from '../types';
import TaskCard from './TaskCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

interface DashboardProps {
  plan: StudyPlan;
  profile: UserProfile;
  onCheckIn: (data: CheckInData) => void;
  isUpdating: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ plan, profile, onCheckIn, isUpdating }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInStress, setCheckInStress] = useState<'low' | 'medium' | 'high'>('medium');
  const [checkInNotes, setCheckInNotes] = useState('');

  // Derived state
  const currentDay = plan.schedule[selectedDayIndex];
  const isToday = selectedDayIndex === 0; // Assuming 0 is always the start of the valid plan
  
  const toggleTask = (taskId: string) => {
    const newSet = new Set(completedTasks);
    if (newSet.has(taskId)) {
      newSet.delete(taskId);
    } else {
      newSet.add(taskId);
    }
    setCompletedTasks(newSet);
  };

  const handleCheckInSubmit = () => {
    const data: CheckInData = {
      completedTaskIds: Array.from(completedTasks),
      currentStress: checkInStress,
      notes: checkInNotes
    };
    onCheckIn(data);
    setShowCheckInModal(false);
    setCompletedTasks(new Set()); // Reset local state as new plan will arrive
    setCheckInNotes('');
  };

  // Chart Data preparation
  const chartData = useMemo(() => {
    return plan.schedule.slice(0, 7).map(day => ({
      name: `Day ${day.dayNumber}`,
      effort: day.tasks.filter(t => t.type !== 'break').length, // Simple proxy for effort
      isToday: day.dayNumber === currentDay?.dayNumber
    }));
  }, [plan, currentDay]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 p-4 flex justify-between items-center backdrop-blur-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{profile.examName} Rescue Plan</h1>
          <p className="text-sm text-slate-400">Strategy: {plan.strategy.pacingPhilosophy}</p>
        </div>
        <div className="flex items-center gap-4">
           {profile.stressLevel === 'high' && (
             <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-xs font-medium">
               <ShieldAlert className="w-3 h-3" /> High Stress Mode Active
             </div>
           )}
           <div className="text-right">
             <div className="text-xs text-slate-500">Exam Date</div>
             <div className="font-mono font-medium">{profile.examDate}</div>
           </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / Strategic Overview */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900 p-6 overflow-y-auto hidden md:block">
          <h2 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4">Strategic Focus</h2>
          
          <div className="mb-6">
            <h3 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Must Master
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {plan.strategy.master.map((item, i) => (
                <li key={i} className="bg-slate-800/50 p-2 rounded border-l-2 border-emerald-500/50">
                  <div className="font-medium">{item.topic}</div>
                  <div className="text-xs text-slate-500 mt-1">{item.reason}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-rose-400 font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Skip / Skim
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {plan.strategy.skip.map((item, i) => (
                <li key={i} className="bg-slate-800/50 p-2 rounded border-l-2 border-rose-500/50">
                  <div className="font-medium">{item.topic}</div>
                  <div className="text-xs text-slate-500 mt-1">{item.reason}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
             <h2 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4">7-Day Load</h2>
             <div className="h-32">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                   <XAxis dataKey="name" hide />
                   <Tooltip 
                    cursor={{fill: '#334155', opacity: 0.4}}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }} 
                   />
                   <Bar dataKey="effort" radius={[4, 4, 0, 0]}>
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.isToday ? '#6366f1' : '#475569'} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {/* Day Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
            {plan.schedule.map((day, idx) => (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex-shrink-0 min-w-[100px] p-3 rounded-xl border transition-all ${
                  idx === selectedDayIndex
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <div className="text-xs opacity-70 mb-1">Day {day.dayNumber}</div>
                <div className="font-bold text-sm">{day.date}</div>
              </button>
            ))}
          </div>

          {currentDay && (
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Daily Context */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700">
                 <div className="flex items-start justify-between mb-4">
                   <div>
                     <h2 className="text-2xl font-bold text-white mb-1">
                       {selectedDayIndex === 0 ? "Today's Mission" : `Plan for ${currentDay.date}`}
                     </h2>
                     <p className="text-slate-400">{currentDay.checkpoint}</p>
                   </div>
                   <div className="bg-indigo-500/10 px-3 py-1 rounded-full text-indigo-300 text-xs font-medium border border-indigo-500/20">
                     {currentDay.tasks.filter(t => t.type !== 'break').length} Core Tasks
                   </div>
                 </div>
                 
                 <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
                   <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                   <div>
                     <span className="text-amber-400 text-sm font-bold block mb-0.5">Safety Tip</span>
                     <p className="text-sm text-slate-300">{currentDay.stressTip}</p>
                   </div>
                 </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {currentDay.tasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={{...task, completed: completedTasks.has(task.id) || task.completed}}
                    onToggle={toggleTask}
                    disabled={selectedDayIndex !== 0} // Can only modify today
                  />
                ))}
              </div>

              {/* Action Area (Only for today) */}
              {selectedDayIndex === 0 && (
                <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 z-20">
                  <button
                    onClick={() => setShowCheckInModal(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-900/50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                  >
                    Finish Day & Adapt <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">End of Day Check-In</h2>
            <p className="text-slate-400 text-sm mb-6">Be honest. The plan will adapt to you, not the other way around.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">How is your stress right now?</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['low', 'medium', 'high'] as const).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setCheckInStress(lvl)}
                      className={`py-2 rounded-lg text-sm font-medium capitalize border transition-all ${
                        checkInStress === lvl 
                          ? lvl === 'high' ? 'bg-rose-500 text-white border-rose-500' : 
                            lvl === 'medium' ? 'bg-amber-500 text-black border-amber-500' :
                            'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Any notes for the AI?</label>
                <textarea
                  value={checkInNotes}
                  onChange={e => setCheckInNotes(e.target.value)}
                  placeholder="I felt tired today, or I crushed the math section..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowCheckInModal(false)}
                  className="flex-1 py-3 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCheckInSubmit}
                  disabled={isUpdating}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2"
                >
                  {isUpdating ? 'Recalculating...' : 'Update Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
