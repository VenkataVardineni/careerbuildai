'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Brain, Users, ArrowRight, Target, Clock, MessageSquare, UserCircle, Mic, FileText } from 'lucide-react';

export default function LandingPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-0">
          Ace your next interview with AI-powered mock interviews tailored to your career goals. Practice, get feedback, and build confidence—all in one place.
        </p>
        {/* START INTERVIEW BUTTON - moved here, no gap below text */}
        {token && (
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg text-lg transition-all duration-150 mt-0"
            onClick={() => window.location.href = '/start-interview'}
          >
            Start Interview
          </button>
        )}
      </section>

      {/* FEATURES SECTION */}
      <section className="w-full bg-white py-16 px-4 flex flex-col items-center border-b border-gray-100">
        <div className="max-w-5xl w-full">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">What CareerBuildAI Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-indigo-100">
              <Target className="h-10 w-10 text-indigo-500 mb-3" />
              <span className="font-semibold text-gray-800 text-lg">Personalized Interview Questions</span>
              <span className="text-gray-500 text-base mt-2">Get questions tailored to your resume, skills, and the job you want.</span>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-pink-100">
              <MessageSquare className="h-10 w-10 text-pink-500 mb-3" />
              <span className="font-semibold text-gray-800 text-lg">Real-Time AI Feedback</span>
              <span className="text-gray-500 text-base mt-2">Receive instant, actionable feedback on your answers to improve with every attempt.</span>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-green-100">
              <Mic className="h-10 w-10 text-green-500 mb-3" />
              <span className="font-semibold text-gray-800 text-lg">Voice & Text Responses</span>
              <span className="text-gray-500 text-base mt-2">Answer questions by typing or speaking, just like a real interview.</span>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-purple-100">
              <FileText className="h-10 w-10 text-purple-500 mb-3" />
              <span className="font-semibold text-gray-800 text-lg">Resume Integration</span>
              <span className="text-gray-500 text-base mt-2">Upload your resume for even more relevant and targeted questions.</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="w-full bg-gradient-to-br from-indigo-50 via-white to-pink-50 py-16 px-4 flex flex-col items-center border-b border-gray-100">
        <div className="max-w-4xl w-full">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <ol className="text-left max-w-2xl mx-auto space-y-6 text-gray-700 text-lg list-decimal list-inside bg-white/80 rounded-xl shadow p-8 border border-gray-100">
            <li><span className="font-semibold">Create a profile</span> with your career details and upload your resume (optional).</li>
            <li><span className="font-semibold">Start a mock interview</span> by choosing your target job role and interview type (technical, behavioral, or mixed).</li>
            <li><span className="font-semibold">Answer questions</span> via text or voice. Get instant AI feedback and tips for improvement.</li>
            <li><span className="font-semibold">Track your progress</span> and review your interview history and answers.</li>
            <li><span className="font-semibold">Practice as a guest</span>—no account required, just jump in and try!</li>
          </ol>
        </div>
      </section>

      {/* VALUE PROPOSITION SECTION */}
      <section className="w-full bg-white py-16 px-4 flex flex-col items-center">
        <div className="max-w-4xl w-full">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose CareerBuildAI?</h2>
          <ul className="text-gray-700 text-lg space-y-4 text-left list-disc list-inside bg-white/80 rounded-xl shadow p-8 border border-gray-100 max-w-2xl mx-auto">
            <li>Practice anytime, anywhere—on desktop or mobile</li>
            <li>Completely private: your data is never shared</li>
            <li>No credit card or signup required to try as a guest</li>
            <li>Designed by career experts and powered by advanced AI</li>
            <li>Continuously updated with the latest interview trends</li>
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full text-center text-white/80 text-base py-8 mt-8 drop-shadow-lg">
        &copy; {new Date().getFullYear()} CareerBuildAI. All rights reserved.
      </footer>
    </div>
  );
}
