'use client';

import { useEffect, useState } from 'react';
import { Brain, MessageSquare, Trash2, ArrowLeft } from 'lucide-react';
import { interviewsAPI } from '@/lib/api';

export default function HistoryPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('email');
      if (!email) {
        window.location.href = '/login';
        return;
      }
    }
    async function fetchInterviews() {
      setLoading(true);
      setError('');
      try {
        const res = await interviewsAPI.getAll();
        setInterviews(res || []);
      } catch (err) {
        setError('Failed to load interview history.');
      } finally {
        setLoading(false);
      }
    }
    fetchInterviews();
  }, []);

  const handleDeleteInterview = async (interviewId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to summary page
    
    if (!confirm('Are you sure you want to delete this interview? This action cannot be undone.')) {
      return;
    }

    setDeletingId(interviewId);
    try {
      await interviewsAPI.delete(String(interviewId));
      // Remove the interview from the local state
      setInterviews(interviews.filter(iv => iv.id !== interviewId));
    } catch (err) {
      alert('Failed to delete interview. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-indigo-200 flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="w-full max-w-4xl mx-auto mt-16 mb-12">
          <div className="bg-white/95 rounded-3xl shadow-2xl p-12 border border-white/40 backdrop-blur-lg">
            <div className="flex items-center gap-3 mb-8">
              <a href="/dashboard" className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </a>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-indigo-600" />
                <h1 className="text-4xl font-bold text-gray-900">Interview History</h1>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center text-indigo-600 py-12">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                Loading your interview history...
              </div>
            ) : error ? (
              <div className="text-center text-red-600 py-12">
                <div className="text-xl font-semibold mb-2">Error</div>
                {error}
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <div className="text-xl font-semibold mb-2">No interviews found</div>
                <p className="text-gray-400">Start your first interview to see your history here.</p>
                <a href="/start-interview" className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                  Start Your First Interview
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  {interviews.length} interview{interviews.length !== 1 ? 's' : ''} found
                </div>
                <div className="grid gap-4">
                  {interviews.map((iv) => (
                    <div key={iv.id} className="bg-gray-50 rounded-xl p-6 hover:bg-indigo-50 transition-all duration-200 border border-gray-100 group">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 cursor-pointer" onClick={() => {
                          if (iv.is_completed) {
                            window.location.href = `/interview/${iv.id}/summary`;
                          } else {
                            window.location.href = `/interview/${iv.id}`;
                          }
                        }}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="font-bold text-xl text-gray-900">{iv.job_role}</div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${iv.is_completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {iv.is_completed ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Started: {new Date(iv.started_at).toLocaleString()}</div>
                            {iv.completed_at && (
                              <div>Completed: {new Date(iv.completed_at).toLocaleString()}</div>
                            )}
                            <div>Duration: {iv.duration_minutes} minutes</div>
                            <div>Mode: {iv.interview_mode}</div>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center gap-3">
                          <button
                            onClick={(e) => handleDeleteInterview(iv.id, e)}
                            disabled={deletingId === iv.id}
                            className="p-3 text-red-500 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            title="Delete interview"
                          >
                            {deletingId === iv.id ? (
                              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <footer className="mt-12 text-gray-400 text-sm">&copy; {new Date().getFullYear()} CareerBuildAI</footer>
      </div>
    </div>
  );
} 