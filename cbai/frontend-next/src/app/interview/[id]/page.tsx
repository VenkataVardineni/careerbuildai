'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Brain, Clock, User, MessageSquare, PlusCircle } from 'lucide-react';
import { interviewsAPI, profilesAPI } from '@/lib/api';

export default function InterviewPage() {
  const [interview, setInterview] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const params = useParams();
  const router = useRouter();

  // Helper to fetch interview and profile
  const fetchInterviewAndProfile = async () => {
    setIsLoading(true);
    setError('');
    
    // Validate interview ID - handle both string and array cases from Next.js params
    let interviewId: string;
    if (Array.isArray(params.id)) {
      interviewId = params.id[0];
    } else {
      interviewId = params.id as string;
    }
    
    if (!interviewId) {
      setError('Interview ID is missing');
      setIsLoading(false);
      return;
    }
    
    try {
      const interviewRes = await interviewsAPI.getById(interviewId);
      setInterview(interviewRes);
      // Fetch profile for resume content
      const profileRes = await profilesAPI.getById(interviewRes.profile_id);
      setProfile(profileRes);
    } catch (err: any) {
      setError('Failed to load interview');
      console.error('Interview load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a question (initial or follow-up)
  const generateQuestion = async () => {
    if (!interview || !profile) return;
    setIsGenerating(true);
    setError('');
    try {
      const conversation_history = (interview.questions && interview.questions.length > 0)
        ? interview.questions.map((q: any) => ({
            question: q.question_text,
            answer: q.user_response || '',
          }))
        : [];
      const res = await interviewsAPI.generateQuestion(interview.id, {
        conversation_history,
        resume_content: profile.resume_content || '',
        job_role: interview.job_role,
        job_description: interview.job_description || '',
      });
      if (res.prompt) {
        console.log('Prompt sent to Groq:', res.prompt);
      }
      // Refresh interview data to get the new question
      await fetchInterviewAndProfile();
    } catch (err: any) {
      setError('Failed to generate question.');
      console.error('Question generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // On mount, fetch interview and profile, and auto-generate first question if needed
  useEffect(() => {
    const init = async () => {
      await fetchInterviewAndProfile();
    };
    init();
  }, [params.id]);

  // Auto-generate first question if none exist
  useEffect(() => {
    if (interview && profile && (!interview.questions || interview.questions.length === 0) && !isGenerating) {
      generateQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interview, profile]);

  // Find the latest unanswered question
  const latestQuestion = interview?.questions?.find((q: any) => !q.user_response);

  // Start/stop voice recognition
  const handleRecord = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setAnswer(prev => prev + finalTranscript);
      }
      setLiveTranscript(interimTranscript);
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  // Submit answer to backend
  const handleSubmitAnswer = async () => {
    if (!latestQuestion || !answer.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await interviewsAPI.respondToQuestion(interview.id, latestQuestion.id, answer);
      setAnswer('');
      setLiveTranscript('');
      // Refresh interview data to get the new answer
      await fetchInterviewAndProfile();
      // Do NOT call generateQuestion here!
    } catch (err: any) {
      setError('Failed to submit answer.');
      console.error('Answer submit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to generate the next question only after the latest answer is present in state
  useEffect(() => {
    if (
      interview &&
      !interview.is_completed &&
      interview.questions &&
      interview.questions.length > 0
    ) {
      const lastQuestion = interview.questions[interview.questions.length - 1];
      // If the last question is answered and there is no unanswered question, generate the next one
      const anyUnanswered = interview.questions.some((q: any) => !q.user_response);
      if (!anyUnanswered && lastQuestion.user_response) {
        generateQuestion();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interview]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Interview not found'}</p>
          <button
            onClick={() => router.push('/start-interview')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Mock Interview</h1>
                <p className="text-sm text-gray-600">{interview.job_role}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {interview.duration_minutes} min
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MessageSquare className="h-4 w-4 mr-1" />
                {interview.questions?.length || 0} questions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interview Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Your Interview!
            </h2>
            <p className="text-gray-600">
              This is a {interview.interview_mode} interview for {interview.job_role}
            </p>
          </div>

          <div className="space-y-6">
            {/* Interview Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Interview Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Job Role:</span>
                  <span className="ml-2 font-medium">{interview.job_role}</span>
                </div>
                <div>
                  <span className="text-gray-600">Mode:</span>
                  <span className="ml-2 font-medium capitalize">{interview.interview_mode}</span>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="ml-2 font-medium">{interview.duration_minutes} minutes</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-medium">
                    {interview.is_completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Questions</h3>
              {interview.questions && interview.questions.length > 0 && latestQuestion ? (
                <div className="space-y-4">
                  <div key={latestQuestion.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        Question {interview.questions.length}
                      </h4>
                      <span className="text-xs text-gray-500 capitalize">
                        {latestQuestion.question_type}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{latestQuestion.question_text}</p>
                    {/* Answer input for latest unanswered question (voice only) */}
                    {!latestQuestion.user_response && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Answer (voice only):</label>
                        <div className="flex items-center mt-2 space-x-2">
                          <button
                            type="button"
                            onClick={handleRecord}
                            className={`px-3 py-1 rounded-lg text-white ${isRecording ? 'bg-red-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            disabled={isLoading}
                          >
                            {isRecording ? 'Stop Recording' : 'Record'}
                          </button>
                          <button
                            type="button"
                            onClick={handleSubmitAnswer}
                            className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white"
                            disabled={isLoading || !answer.trim()}
                          >
                            Submit Answer
                          </button>
                        </div>
                        {/* Live transcript display */}
                        {liveTranscript && (
                          <div className="mt-2 text-xs text-gray-500 bg-gray-100 rounded p-2">
                            <span className="font-semibold">Live Transcript:</span> {liveTranscript}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Show answer if already answered */}
                    {latestQuestion.user_response && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                        <p className="text-sm font-medium text-blue-900 mb-1">Your Response:</p>
                        <p className="text-sm text-blue-800">{latestQuestion.user_response}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No questions generated yet.</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Questions will be generated as the interview progresses.
                  </p>
                </div>
              )}
              {/* Next Question Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={generateQuestion}
                  disabled={isGenerating || isLoading}
                  className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  {isGenerating ? 'Generating...' : 'Next Question'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center pt-6">
              <button
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={async () => {
                  try {
                    // Mark the interview as completed in the backend
                    await interviewsAPI.complete(interview.id);
                    // Navigate to summary page
                    router.push(`/interview/${interview.id}/summary`);
                  } catch (err: any) {
                    console.error('Failed to complete interview:', err);
                    // Still navigate to summary even if completion fails
                    router.push(`/interview/${interview.id}/summary`);
                  }
                }}
                disabled={isLoading}
              >
                Finish Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 