'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Brain, Play, Clock, Users, Target } from 'lucide-react';
import { interviewsAPI, profilesAPI } from '@/lib/api';

const interviewSchema = z.object({
  job_role: z.string().min(2, 'Job role must be at least 2 characters'),
  job_description: z.string().optional(),
  interview_mode: z.enum(['technical', 'behavioral', 'mixed']),
  duration_minutes: z.number().min(5).max(120),
});

type InterviewForm = z.infer<typeof interviewSchema>;

export default function StartInterviewPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<InterviewForm>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      interview_mode: 'mixed',
      duration_minutes: 30,
    },
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('email');
      if (!email) {
        router.replace('/login');
        return;
      }
    }

    // Load user profiles
    const loadProfiles = async () => {
      try {
        const profiles = await profilesAPI.getAll();
        setProfiles(profiles);
        if (profiles && profiles.length > 0) {
          setSelectedProfile(profiles[0]);
        }
      } catch (err) {
        console.error('Failed to load profiles:', err);
      }
    };

    loadProfiles();
  }, [router]);

  const onSubmit = async (data: InterviewForm) => {
    if (!selectedProfile) {
      setError('Please select a profile first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Creating interview with:', {
        profile_id: selectedProfile.id,
        ...data,
      });
      const response = await interviewsAPI.create({
        profile_id: selectedProfile.id,
        job_role: data.job_role,
        job_description: data.job_description || '',
        interview_mode: data.interview_mode,
        duration_minutes: data.duration_minutes,
      });
      console.log('Interview created:', response);
      
      // Validate response structure - backend returns interview object directly
      if (!response || !response.id) {
        throw new Error('Invalid response from server: missing interview ID');
      }
      
      router.push(`/interview/${response.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start interview. Please try again.');
      console.error('Interview creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Brain className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Start Your Mock Interview
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Choose your profile and interview settings to begin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Select Your Profile
            </h2>
            
            {profiles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No profiles found. Please create a profile first.</p>
                <button
                  onClick={() => router.push('/guest')}
                  className="mt-4 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg font-semibold hover:text-indigo-800 hover:border-indigo-800 transition-colors"
                >
                  Create Profile
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedProfile?.id === profile.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <h3 className="font-medium text-gray-900">{profile.full_name}</h3>
                      <p className="text-sm text-gray-600">{profile.career_role}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Skills: {profile.skills.substring(0, 50)}...
                      </p>
                    </div>
                  ))}
                </div>
                {/* Always show Create Profile button below profiles */}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => router.push('/guest')}
                    className="px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg font-semibold hover:text-indigo-800 hover:border-indigo-800 transition-colors"
                  >
                    Create New Profile
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Interview Settings */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Interview Settings
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="job_role" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Job Role *
                </label>
                <input
                  {...register('job_role')}
                  type="text"
                  id="job_role"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-black bg-white opacity-100"
                  style={{ color: '#000' }}
                  placeholder="e.g., Senior Software Engineer, Data Scientist"
                />
                {errors.job_role && (
                  <p className="mt-1 text-sm text-red-600">{errors.job_role.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="job_description" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description (Optional)
                </label>
                <textarea
                  {...register('job_description')}
                  id="job_description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-black bg-white opacity-100"
                  style={{ color: '#000' }}
                  placeholder="Paste the job description here for more relevant questions..."
                />
              </div>

              <div>
                <label htmlFor="interview_mode" className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Mode *
                </label>
                <select
                  {...register('interview_mode')}
                  id="interview_mode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                >
                  <option value="mixed">Mixed (Technical + Behavioral)</option>
                  <option value="technical">Technical Only</option>
                  <option value="behavioral">Behavioral Only</option>
                </select>
              </div>

              <div>
                <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  {...register('duration_minutes')}
                  type="number"
                  id="duration_minutes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-black bg-white opacity-100"
                  style={{ color: '#000' }}
                  placeholder="Duration in minutes"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !selectedProfile}
                className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Starting Interview...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Play className="h-4 w-4 mr-2" />
                    Start Interview
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Quick Start Options */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Start Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setValue('job_role', 'Software Engineer');
                setValue('interview_mode', 'technical');
                setValue('duration_minutes', 30);
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">Software Engineer</h3>
              <p className="text-sm text-gray-600">Technical interview, 30 min</p>
            </button>
            
            <button
              onClick={() => {
                setValue('job_role', 'Product Manager');
                setValue('interview_mode', 'behavioral');
                setValue('duration_minutes', 45);
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">Product Manager</h3>
              <p className="text-sm text-gray-600">Behavioral interview, 45 min</p>
            </button>
            
            <button
              onClick={() => {
                setValue('job_role', 'Data Scientist');
                setValue('interview_mode', 'mixed');
                setValue('duration_minutes', 60);
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">Data Scientist</h3>
              <p className="text-sm text-gray-600">Mixed interview, 60 min</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 