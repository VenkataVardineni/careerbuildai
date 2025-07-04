'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Brain, Upload, AlertCircle, X } from 'lucide-react';
import { profilesAPI } from '@/lib/profilesAPI';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  career_role: z.string().min(2, 'Career role must be at least 2 characters'),
  skills: z.string().min(10, 'Please provide at least 10 characters describing your skills'),
  resume_content: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function CreateProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeContent, setResumeContent] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setIsLoading(true);
    setError('');

    try {
      const response = await profilesAPI.uploadResume(file);
      const content = response.data.resume_content;
      setResumeContent(content);
      setValue('resume_content', content);
    } catch (err: any) {
      setError('Failed to upload resume. Please try again or enter your information manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    setError('');

    try {
      // Create profile for registered user
      await profilesAPI.create({
        full_name: data.full_name,
        career_role: data.career_role,
        skills: data.skills,
        resume_content: data.resume_content || '',
      });

      router.push('/start-interview');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Brain className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Complete Your Profile
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Tell us about yourself to get personalized interview questions
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                {...register('full_name')}
                type="text"
                id="full_name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-black bg-white opacity-100"
                style={{ color: '#000' }}
                placeholder="Enter your full name"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="career_role" className="block text-sm font-medium text-gray-700 mb-2">
                Target Career Role *
              </label>
              <input
                {...register('career_role')}
                type="text"
                id="career_role"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-black bg-white opacity-100"
                style={{ color: '#000' }}
                placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
              />
              {errors.career_role && (
                <p className="mt-1 text-sm text-red-600">{errors.career_role.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                Skills & Experience *
              </label>
              <textarea
                {...register('skills')}
                id="skills"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-black bg-white opacity-100"
                style={{ color: '#000' }}
                placeholder="List your key skills, experience, and technologies (comma separated)"
              />
              {errors.skills && (
                <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume Upload (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {resumeFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Upload className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">{resumeFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setResumeFile(null);
                        setResumeContent('');
                        setValue('resume_content', '');
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        <span className="text-indigo-600 hover:text-indigo-500 font-medium">
                          Upload a resume
                        </span>
                        <span className="text-gray-500"> or drag and drop</span>
                      </label>
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOCX, or DOC up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => router.push('/start-interview')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Skip for now
              </button>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-white text-indigo-600 border border-indigo-600 rounded-lg font-semibold hover:text-indigo-800 hover:border-indigo-800 transition-colors"
              >
                Create Profile
              </button>
            </div>
          </form>
        </div>
      </div>
      <style jsx global>{`
        #full_name::placeholder,
        #career_role::placeholder,
        #skills::placeholder {
          color: #000 !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
} 