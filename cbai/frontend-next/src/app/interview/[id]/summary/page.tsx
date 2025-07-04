"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { interviewsAPI } from "@/lib/api";
import { CheckCircle } from "lucide-react";

export default function InterviewSummaryPage() {
  const router = useRouter();
  const params = useParams();
  const interviewId = params?.id;
  const [questions, setQuestions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      setError("");
      try {
        if (interviewId) {
          const res = await interviewsAPI.getById(String(interviewId));
          setQuestions(res.questions || []);
          // Fetch feedback
          const feedbackRes = await interviewsAPI.getFeedback(String(interviewId));
          setFeedback(feedbackRes.feedback || []);
        }
      } catch (err: any) {
        setError("Failed to load interview summary.");
      } finally {
        setLoading(false);
      }
    }
    if (interviewId) fetchSummary();
  }, [interviewId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center px-2">
      <div className="w-full max-w-2xl mt-10 mb-8 p-6 rounded-2xl shadow-lg bg-white flex flex-col items-center">
        <CheckCircle className="text-green-500 w-14 h-14 mb-2" />
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-2 text-center">Interview Complete!</h1>
        <p className="text-lg text-gray-600 text-center mb-2">Here's a summary of your responses. Review your answers and reflect on your performance!</p>
      </div>
      <div className="w-full max-w-2xl space-y-6">
        {loading ? (
          <div className="text-center text-lg text-indigo-600 font-semibold py-10">Loading...</div>
        ) : error ? (
          <div className="text-red-600 text-center font-semibold py-10">{error}</div>
        ) : questions.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No questions found.</div>
        ) : (
          questions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-xl shadow-md p-6 border border-indigo-100">
              <div className="flex items-center mb-2">
                <span className="text-indigo-600 font-bold text-xl mr-2">Q{idx + 1}:</span>
                <span className="font-semibold text-lg text-gray-900">{q.question_text}</span>
              </div>
              <div className="mt-3">
                <span className="block text-gray-500 text-sm font-medium mb-1">Your Answer:</span>
                <div className={`rounded-lg px-4 py-2 text-base ${q.user_response ? 'bg-indigo-50 text-gray-800' : 'bg-gray-100 text-gray-400 italic'}`}>{q.user_response || "No answer given"}</div>
              </div>
              <div className="mt-4">
                <span className="block text-gray-500 text-sm font-medium mb-1">Feedback:</span>
                <div className="rounded-lg px-4 py-2 text-base bg-green-50 text-green-900 italic">
                  {feedback[idx] || "Feedback not available."}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <button
        className="mt-12 mb-8 w-full max-w-xs px-6 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-xl shadow hover:bg-indigo-700 transition"
        onClick={() => router.push("/dashboard")}
      >
        Back to Dashboard
      </button>
    </div>
  );
} 