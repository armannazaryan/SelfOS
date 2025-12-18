import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { generateActionPlan } from '../lib/aiEngine';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface OnboardingData {
  main_problem: string;
  daily_routine: string;
  available_time: string;
  personal_goals: string[];
  motivation_level: number;
}

export function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<OnboardingData>({
    main_problem: '',
    daily_routine: '',
    available_time: '',
    personal_goals: [],
    motivation_level: 5,
  });

  const problems = ['Laziness', 'Procrastination', 'Lack of Discipline', 'Focus Issues'];
  const routines = ['Morning person', 'Night owl', 'Flexible schedule', 'Fixed work hours'];
  const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'];
  const goals = ['Study', 'Work', 'Health', 'Habits'];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadSettings();
  }, [user, navigate]);

  const loadSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from('onboarding_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setFormData({
          main_problem: data.main_problem,
          daily_routine: data.daily_routine,
          available_time: data.available_time,
          personal_goals: data.personal_goals,
          motivation_level: data.motivation_level,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      personal_goals: prev.personal_goals.includes(goal)
        ? prev.personal_goals.filter((g) => g !== goal)
        : [...prev.personal_goals, goal],
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const onboardingData = {
        user_id: user.id,
        main_problem: formData.main_problem,
        daily_routine: formData.daily_routine,
        available_time: formData.available_time,
        personal_goals: formData.personal_goals,
        motivation_level: formData.motivation_level,
      };

      await supabase.from('onboarding_responses').insert([onboardingData]);

      alert('Preferences updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRegeneratePlan = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await supabase
        .from('action_plans')
        .update({ is_active: false })
        .eq('user_id', user.id);

      const actionPlan = generateActionPlan(formData);

      await supabase.from('action_plans').insert([
        {
          user_id: user.id,
          plan_data: { tasks: actionPlan.tasks },
          motivational_message: actionPlan.motivationalMessage,
          is_active: true,
        },
      ]);

      const today = new Date().toISOString().split('T')[0];
      await supabase.from('tasks').delete().eq('user_id', user.id).eq('task_date', today);

      const tasksToInsert = actionPlan.tasks.map((task) => ({
        user_id: user.id,
        title: task.title,
        description: task.description,
        task_date: today,
        completed: false,
      }));

      await supabase.from('tasks').insert(tasksToInsert);

      alert('Action plan regenerated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error regenerating plan:', error);
      alert('Failed to regenerate plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <div className="w-24"></div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Challenge
            </label>
            <div className="grid grid-cols-2 gap-3">
              {problems.map((problem) => (
                <button
                  key={problem}
                  onClick={() => setFormData({ ...formData, main_problem: problem })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.main_problem === problem
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {problem}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Routine
            </label>
            <div className="grid grid-cols-2 gap-3">
              {routines.map((routine) => (
                <button
                  key={routine}
                  onClick={() => setFormData({ ...formData, daily_routine: routine })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.daily_routine === routine
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {routine}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Best Time Available
            </label>
            <div className="grid grid-cols-2 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setFormData({ ...formData, available_time: slot })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.available_time === slot
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Goals
            </label>
            <div className="grid grid-cols-2 gap-3">
              {goals.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.personal_goals.includes(goal)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Motivation Level
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.motivation_level}
              onChange={(e) =>
                setFormData({ ...formData, motivation_level: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Low (1)</span>
              <span className="text-lg font-semibold text-blue-600">
                {formData.motivation_level}
              </span>
              <span>High (10)</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              onClick={handleRegeneratePlan}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-5 h-5" />
              Regenerate Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
