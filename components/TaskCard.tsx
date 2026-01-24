import React from 'react';
import { Task } from '../types';
import { CheckCircle, Circle, Clock, Zap } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggle: (taskId: string) => void;
  disabled?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, disabled }) => {
  const isCompleted = task.completed;
  
  const typeColors = {
    study: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    review: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    practice: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    break: 'bg-slate-700/30 text-slate-400 border-slate-700',
  };

  const effortColors = {
    Low: 'text-emerald-400',
    Medium: 'text-yellow-400',
    High: 'text-rose-400',
  };

  if (task.type === 'break') {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-slate-700 bg-slate-800/30 text-slate-500 text-sm">
        <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Recovery Break</span>
        <span>{task.duration}</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative group p-4 rounded-xl border transition-all duration-200 ${
        isCompleted 
          ? 'bg-slate-900 border-slate-800 opacity-60' 
          : 'bg-slate-800 border-slate-700 hover:border-slate-600 shadow-sm'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-1 flex-shrink-0 transition-colors ${
            isCompleted ? 'text-emerald-500' : 'text-slate-500 group-hover:text-slate-400'
          }`}
        >
          {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[task.type] || typeColors.study} capitalize`}>
              {task.type}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {task.duration}
            </span>
            <span className={`text-xs flex items-center gap-1 ${effortColors[task.effort]}`}>
              <Zap className="w-3 h-3" /> {task.effort} Effort
            </span>
          </div>
          
          <h3 className={`font-medium text-lg leading-tight mb-1 ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
            {task.title}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
