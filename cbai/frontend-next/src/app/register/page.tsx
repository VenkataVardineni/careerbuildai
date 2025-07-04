'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Brain, Eye, EyeOff, AlertCircle, Rocket, Shield, Star, TrendingUp } from 'lucide-react';
import { authAPI } from '@/lib/authAPI';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');
    console.log('Submitting register', data); // Debug log
    try {
      const registerResponse = await authAPI.register({
        email: data.email,
        username: data.username,
        password: data.password,
        full_name: data.full_name,
      });
      console.log('Register response', registerResponse); // Debug log
      // Auto-login after registration
      const loginResponse = await authAPI.login({
        email: data.email,
        password: data.password,
      });
      console.log('Login response', loginResponse); // Debug log
      localStorage.setItem('token', loginResponse.data.access_token);
      // Dispatch custom event to notify navbar of auth change
      window.dispatchEvent(new Event('auth-change'));
      router.push('/create-profile');
    } catch (err: any) {
      console.error('Register error', err); // Debug log
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Design Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center px-12 py-12 text-white">
          <div className="flex items-center mb-8">
            <Brain className="h-12 w-12 text-white mr-4" />
            <h1 className="text-3xl font-bold">CareerBuildAI</h1>
          </div>
          
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Start Your Success Journey
          </h2>
          
          <p className="text-emerald-100 text-lg mb-10 max-w-md leading-relaxed">
            Join our community of professionals and take the first step towards interview success with AI-powered practice sessions.
          </p>

          {/* Feature List */}
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <Rocket className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Get Started Fast</h3>
                <p className="text-emerald-100">Quick setup and immediate access to practice</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <Shield className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Secure & Private</h3>
                <p className="text-emerald-100">Your data is protected and confidential</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <Star className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Premium Features</h3>
                <p className="text-emerald-100">Access to advanced AI interview tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Brain className="h-12 w-12 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-gray-600">
              Join CareerBuildAI and start your interview preparation journey
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
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  {...register('full_name')}
                  type="text"
                  id="full_name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-black bg-white opacity-100"
                  style={{ color: '#000' }}
                  placeholder="Enter your full name"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-black bg-white opacity-100"
                  style={{ color: '#000' }}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  {...register('username')}
                  type="text"
                  id="username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-black bg-white opacity-100"
                  style={{ color: '#000' }}
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-black bg-white opacity-100"
                    style={{ color: '#000' }}
                    placeholder="Create a password"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-black bg-white opacity-100"
                    style={{ color: '#000' }}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                  Sign in
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