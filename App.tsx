import React, { useState, useEffect } from 'react';
import { UserProfile, StudyPlan, CheckInData } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { generateInitialPlan, updatePlan } from './services/gemini';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from local storage on mount (simple persistence)
  useEffect(() => {
    const savedProfile = localStorage.getItem('ara_profile');
    const savedPlan = localStorage.getItem('ara_plan');
    if (savedProfile && savedPlan) {
      setProfile(JSON.parse(savedProfile));
      setPlan(JSON.parse(savedPlan));
    }
  }, []);

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    setLoading(true);
    setError(null);
    try {
      const generatedPlan = await generateInitialPlan(newProfile);
      setPlan(generatedPlan);
      // Persist
      localStorage.setItem('ara_profile', JSON.stringify(newProfile));
      localStorage.setItem('ara_plan', JSON.stringify(generatedPlan));
    } catch (err) {
      setError("Failed to generate plan. Please try again. Ensure your API key is valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (data: CheckInData) => {
    if (!profile || !plan) return;
    
    setLoading(true);
    try {
      // Optimistic update logic could go here, but since we rely on AI for the schedule, we wait.
      const updatedPlan = await updatePlan(plan, profile, data);
      setPlan(updatedPlan);
      localStorage.setItem('ara_plan', JSON.stringify(updatedPlan));
    } catch (err) {
      setError("Failed to update plan. Connectivity issue?");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !plan) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-200 p-4 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
        <h2 className="text-xl font-semibold">Analyzing Workload...</h2>
        <p className="text-slate-400 max-w-md mt-2">
          We are calculating the optimal path to your goal. Finding the balance between effort and recovery.
        </p>
      </div>
    );
  }

  if (!profile || !plan) {
    return (
      <div className="min-h-screen bg-slate-900">
        {error && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-300 p-4 text-center text-sm">
            {error}
          </div>
        )}
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
       {/* If we are loading an update, we show a subtle indicator overlay, but keep UI visible */}
      {loading && (
        <div className="fixed top-4 right-4 z-50 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium animate-pulse">
           <Loader2 className="w-4 h-4 animate-spin" /> Adapting Plan...
        </div>
      )}
      <Dashboard 
        plan={plan} 
        profile={profile} 
        onCheckIn={handleCheckIn}
        isUpdating={loading}
      />
    </div>
  );
};

export default App;
