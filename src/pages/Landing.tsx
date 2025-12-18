import { useNavigate } from 'react-router-dom';
import { Target, Zap, TrendingUp } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">SelfOS</h1>
          <p className="text-2xl text-gray-700 mb-12 max-w-2xl mx-auto">
            Turn intention into action with a personalized system.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('/signup')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Get Started for Free
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Log In
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Personalized Plans</h3>
            <p className="text-gray-600">
              Get a custom action plan tailored to your goals and challenges.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Break Tasks Down</h3>
            <p className="text-gray-600">
              Transform overwhelming goals into small, actionable steps.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Track Progress</h3>
            <p className="text-gray-600">
              Build momentum with streaks and visual progress indicators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
