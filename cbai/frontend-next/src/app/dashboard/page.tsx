'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Brain, Users, ArrowRight, Target, Clock, MessageSquare, UserCircle, Mic, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('email');
      if (!email) {
        window.location.href = '/login';
        return;
      }
      setToken(localStorage.getItem('token'));
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 flex flex-col items-center px-2 md:px-4 pt-24">
      {/* HERO SECTION */}
      <section className="w-full max-w-6xl mx-auto py-4 md:py-6 px-2 md:px-6 flex flex-col items-center mb-2 bg-transparent gap-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="w-12 h-12 text-indigo-600" />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">CareerBuildAI</h1>
        </div>
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-6">
          Ace your next interview with AI-powered mock interviews tailored to your career goals. Practice, get feedback, and build confidence—all in one place.
        </p>
      </section>
      {/* START INTERVIEW BUTTON */}
      <div className="w-full flex justify-center mt-0 mb-8">
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg text-lg transition-all duration-150"
          onClick={() => {
            if (typeof window !== 'undefined') {
              const email = localStorage.getItem('email');
              if (email) {
                router.push('/start-interview');
              } else {
                router.push('/login');
              }
            }
          }}
        >
          Start Interview
        </button>
      </div>

      {/* FEATURES SECTION */}
      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white/90 rounded-2xl shadow-md p-6 flex flex-col items-center">
          <Target className="w-8 h-8 text-indigo-500 mb-2" />
          <h3 className="font-bold text-lg mb-1">Personalized Questions</h3>
          <p className="text-gray-600 text-center">Get interview questions tailored to your role, experience, and uploaded resume.</p>
        </div>
        <div className="bg-white/90 rounded-2xl shadow-md p-6 flex flex-col items-center">
          <MessageSquare className="w-8 h-8 text-purple-500 mb-2" />
          <h3 className="font-bold text-lg mb-1">AI Feedback</h3>
          <p className="text-gray-600 text-center">Receive instant, actionable feedback on your answers to improve your performance.</p>
        </div>
        <div className="bg-white/90 rounded-2xl shadow-md p-6 flex flex-col items-center">
          <Mic className="w-8 h-8 text-pink-500 mb-2" />
          <h3 className="font-bold text-lg mb-1">Voice & Text</h3>
          <p className="text-gray-600 text-center">Answer questions by speaking or typing, just like a real interview.</p>
        </div>
        <div className="bg-white/90 rounded-2xl shadow-md p-6 flex flex-col items-center">
          <FileText className="w-8 h-8 text-indigo-400 mb-2" />
          <h3 className="font-bold text-lg mb-1">Resume Integration</h3>
          <p className="text-gray-600 text-center">Upload your resume to get questions and feedback tailored to your experience.</p>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="w-full max-w-3xl bg-white/80 rounded-2xl shadow-lg p-8 mb-12">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">How It Works</h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-2">
          <li>Sign up or continue as a guest.</li>
          <li>Create your profile and upload your resume (optional).</li>
          <li>Start a mock interview and answer AI-generated questions.</li>
          <li>Get instant feedback and review your performance.</li>
          <li>Track your progress and revisit past interviews.</li>
        </ol>
      </section>

      {/* VALUE PROPOSITION SECTION */}
      <section className="w-full max-w-3xl bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-2xl shadow-md p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">Why Choose CareerBuildAI?</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Practice anytime, anywhere—no scheduling needed.</li>
          <li>Realistic interview experience with voice and text options.</li>
          <li>Personalized to your goals and background.</li>
          <li>Completely private and secure.</li>
          <li>Free to get started—no credit card required.</li>
        </ul>
      </section>
    </div>
  );
} 