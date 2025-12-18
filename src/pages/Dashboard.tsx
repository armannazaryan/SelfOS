import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getStreakMotivation } from '../lib/aiEngine';
import { CheckCircle2, Circle, Flame, TrendingUp, User, LogOut, RefreshCw } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface UserProfile {
  current_streak: number;
  total_tasks_completed: number;
  last_active_date: string | null;
}

interface ActionPlan {
  motivational_message: string;
}

export function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_date', today)
        .order('created_at', { ascending: true });

      setTasks(tasksData || []);

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        const lastActiveDate = profileData.last_active_date;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActiveDate === yesterdayStr) {
          setProfile(profileData);
        } else if (lastActiveDate !== today) {
          const updatedProfile = {
            ...profileData,
            current_streak: 0,
          };
          setProfile(updatedProfile);

          await supabase
            .from('user_profiles')
            .update({ current_streak: 0 })
            .eq('id', user.id);
        } else {
          setProfile(profileData);
        }
      }

      const { data: planData } = await supabase
        .from('action_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setActionPlan(planData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!user) return;

    const newStatus = !currentStatus;
    const completedAt = newStatus ? new Date().toISOString() : null;

    const { error } = await supabase
      .from('tasks')
      .update({ completed: newStatus, completed_at: completedAt })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: newStatus } : task
      )
    );

    const allTasksCompleted = tasks.every((task) =>
      task.id === taskId ? newStatus : task.completed
    );

    if (allTasksCompleted && newStatus) {
      const today = new Date().toISOString().split('T')[0];
      const lastActiveDate = profile?.last_active_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      if (lastActiveDate === yesterdayStr) {
        newStreak = (profile?.current_streak || 0) + 1;
      }

      await supabase
        .from('user_profiles')
        .update({
          current_streak: newStreak,
          last_active_date: today,
          total_tasks_completed: (profile?.total_tasks_completed || 0) + 1,
        })
        .eq('id', user.id);

      if (profile) {
        setProfile({
          ...profile,
          current_streak: newStreak,
          last_active_date: today,
          total_tasks_completed: (profile.total_tasks_completed || 0) + 1,
        });
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">SelfOS</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-100 p-3 rounded-full">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.current_streak || 0} days</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {getStreakMotivation(profile?.current_streak || 0)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Progress</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {completedCount} of {totalCount} tasks completed today
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Lifetime Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.total_tasks_completed || 0}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Tasks completed all-time</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Today's Action Plan</h2>
            <button
              onClick={() => navigate('/regenerate-plan')}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
          </div>

          {actionPlan && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-900 font-medium">{actionPlan.motivational_message}</p>
            </div>
          )}

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tasks for today. Complete onboarding to get your personalized plan.
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => toggleTask(task.id, task.completed)}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3
                      className={`font-semibold ${
                        task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}
                    >
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Progress Overview</h2>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-green-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            {progress === 100
              ? 'Amazing! All tasks completed!'
              : `Keep going! ${Math.round(100 - progress)}% to go.`}
          </p>
        </div>
      </div>
    </div>
  );
}
