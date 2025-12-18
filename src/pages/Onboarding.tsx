import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { generateActionPlan } from '../lib/aiEngine';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    mainProblem: '',
    dailyRoutine: '',
    availableTime: '',
    personalGoals: [] as string[],
    motivationLevel: 5,
  });

  const problems = ['Laziness', 'Procrastination', 'Lack of Discipline', 'Focus Issues'];
  const routines = ['Morning person', 'Night owl', 'Flexible schedule', 'Fixed work hours'];
  const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'];
  const goals = ['Study', 'Work', 'Health', 'Habits'];

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      personalGoals: prev.personalGoals.includes(goal)
        ? prev.personalGoals.filter((g) => g !== goal)
        : [...prev.personalGoals, goal],
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const onboardingData = {
        main_problem: formData.mainProblem,
        daily_routine: formData.dailyRoutine,
        available_time: formData.availableTime,
        personal_goals: formData.personalGoals,
        motivation_level: formData.motivationLevel,
      };

      const { error: onboardingError } = await supabase
        .from('onboarding_responses')
        .insert([
          {
            user_id: user.id,
            ...onboardingData,
          },
        ]);

      if (onboardingError) throw onboardingError;

      const actionPlan = generateActionPlan(onboardingData);

      const { error: planError } = await supabase
        .from('action_plans')
        .insert([
          {
            user_id: user.id,
            plan_data: { tasks: actionPlan.tasks },
            motivational_message: actionPlan.motivationalMessage,
            is_active: true,
          },
        ]);

      if (planError) throw planError;

      const today = new Date().toISOString().split('T')[0];
      const tasksToInsert = actionPlan.tasks.map((task) => ({
        user_id: user.id,
        title: task.title,
        description: task.description,
        task_date: today,
        completed: false,
      }));

      const { error: tasksError } = await supabase.from('tasks').insert(tasksToInsert);

      if (tasksError) throw tasksError;

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving onboarding:', error);
      alert('Failed to save onboarding data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Let's personalize your experience</h2>
            <span className="text-sm text-gray-500">Step {step} of 5</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              What's your main challenge?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {problems.map((problem) => (
                <button
                  key={problem}
                  onClick={() => setFormData({ ...formData, mainProblem: problem })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.mainProblem === problem
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {problem}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              What's your daily routine like?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {routines.map((routine) => (
                <button
                  key={routine}
                  onClick={() => setFormData({ ...formData, dailyRoutine: routine })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.dailyRoutine === routine
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {routine}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              When do you have the most time?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setFormData({ ...formData, availableTime: slot })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.availableTime === slot
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              What are your main goals? (Select all that apply)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {goals.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.personalGoals.includes(goal)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              How motivated are you right now?
            </h3>
            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.motivationLevel}
                onChange={(e) =>
                  setFormData({ ...formData, motivationLevel: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Low (1)</span>
                <span className="text-lg font-semibold text-blue-600">
                  {formData.motivationLevel}
                </span>
                <span>High (10)</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !formData.mainProblem) ||
                (step === 2 && !formData.dailyRoutine) ||
                (step === 3 && !formData.availableTime) ||
                (step === 4 && formData.personalGoals.length === 0)
              }
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Your Plan...' : 'Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
