import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Settings } from 'lucide-react';

interface UserProfile {
  username: string;
  created_at: string;
  current_streak: number;
  total_tasks_completed: number;
}

interface OnboardingData {
  main_problem: string;
  daily_routine: string;
  available_time: string;
  personal_goals: string[];
  motivation_level: number;
}

export function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      setProfile(profileData);

      const { data: onboardingData } = await supabase
        .from('onboarding_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setOnboarding(onboardingData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
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
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <div className="w-24"></div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Account Information</h2>
            <Settings className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Username</label>
              <p className="text-lg text-gray-900">{profile?.username || 'Not set'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg text-gray-900">{user?.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Member Since</label>
              <p className="text-lg text-gray-900">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Stats</h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
              <p className="text-sm font-medium text-orange-800 mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-orange-900">
                {profile?.current_streak || 0} days
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-green-900">
                {profile?.total_tasks_completed || 0}
              </p>
            </div>
          </div>
        </div>

        {onboarding && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Preferences</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Main Challenge</label>
                <p className="text-lg text-gray-900">{onboarding.main_problem}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Daily Routine</label>
                <p className="text-lg text-gray-900">{onboarding.daily_routine}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Best Time</label>
                <p className="text-lg text-gray-900">{onboarding.available_time}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Goals</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {onboarding.personal_goals.map((goal) => (
                    <span
                      key={goal}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Motivation Level</label>
                <p className="text-lg text-gray-900">{onboarding.motivation_level}/10</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/settings')}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Update Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
