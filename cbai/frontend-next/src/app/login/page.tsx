'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Brain, Eye, EyeOff, AlertCircle, Users, Target, Award, Zap } from 'lucide-react';
import { authAPI } from '@/lib/authAPI';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    console.log('Submitting login', data);
    try {
      const response = await authAPI.login(data);
      console.log('Login response', response);
      localStorage.setItem('email', data.email);
      
      // Dispatch custom event to notify navbar of auth change
      window.dispatchEvent(new Event('auth-change'));
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error', err);
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Design Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center px-12 py-12 text-white">
          <div className="flex items-center mb-8">
            <Brain className="h-12 w-12 text-white mr-4" />
            <h1 className="text-3xl font-bold">CareerBuildAI</h1>
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Continue Your Success Journey
          </h2>
          <p className="text-purple-100 text-lg mb-10 max-w-md leading-relaxed">
            Welcome back to our community of professionals! Pick up where you left off and keep advancing towards interview success with AI-powered practice sessions.
          </p>
          
          {/* Feature List */}
          <div className="space-y-6 mb-10">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <Target className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Personalized Questions</h3>
                <p className="text-purple-100">Tailored to your career goals and experience</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <Zap className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Live Feedback</h3>
                <p className="text-purple-100">Real-time insights to improve your performance</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <Award className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Track Progress</h3>
                <p className="text-purple-100">Monitor your improvement over time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Brain className="h-12 w-12 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">
              Sign in to continue your interview preparation journey
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-black bg-white opacity-100"
                  style={{ color: '#000' }}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-12 text-gray-900 transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                  Sign up
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Or{' '}
                <Link href="/guest" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                  continue as guest
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 