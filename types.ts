export interface Subject {
  id: string;
  name: string;
  syllabus: string;
  confidence: number; // 1-5
}

export interface UserProfile {
  name: string;
  examName: string;
  examDate: string;
  subjects: Subject[];
  dailyHours: number;
  stressLevel: 'low' | 'medium' | 'high';
}

export interface Task {
  id: string;
  title: string;
  type: 'study' | 'review' | 'break' | 'practice';
  effort: 'Low' | 'Medium' | 'High';
  duration: string;
  completed?: boolean;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  tasks: Task[];
  checkpoint: string;
  stressTip: string;
}

export interface StrategicOverview {
  priorities: string[];
  skip: { topic: string; reason: string }[];
  master: { topic: string; reason: string }[];
  pacingPhilosophy: string;
}

export interface StudyPlan {
  strategy: StrategicOverview;
  schedule: DayPlan[];
  adaptationNotes: string;
}

export interface CheckInData {
  completedTaskIds: string[];
  currentStress: 'low' | 'medium' | 'high';
  notes: string;
}