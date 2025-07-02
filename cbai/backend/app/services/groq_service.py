import httpx
import json
from typing import List, Dict, Optional, Union, Tuple
from app.core.config import settings
import re

class GroqService:
    def __init__(self):
        self.api_key = settings.groq_api_key
        self.base_url = "https://api.groq.com/openai/v1"
        self.model = "llama3-70b-8192"
    
    async def generate_question(
        self,
        resume_content: str,
        job_role: str,
        job_description: Optional[str] = None,
        conversation_history: Optional[List[Dict]] = None
    ) -> str:
        """Generate an interview question based on resume and job context. Always call Groq API."""
        # Always build the system prompt using resume, job role, job description, and conversation history
        system_prompt = f"""
        You are a world-class interviewer conducting a technical and behavioral interview.

        CANDIDATE BACKGROUND:
        - Resume Content: {resume_content}
        - Target Job Role: {job_role}
        {f'- Job Description: {job_description}' if job_description else ''}

        INTERVIEW CONTEXT:
        - Here is the full conversation history so far (questions and answers):
        {json.dumps(conversation_history, indent=1) if conversation_history else '[]'}
        - For every question, you must generate a follow-up that references specific details from the candidate's resume and/or their previous answers.
        - Do not ask generic questions. Every question should be tailored to the candidate's unique background and the flow of the interview so far.
        - If clarification is needed, ask for it in a way that builds on what the candidate has already said.
        - Only output the next interview question, nothing else.
        """
        print("\n==================== SYSTEM PROMPT SENT TO GROQ ====================\n" + system_prompt + "\n====================================================================\n")
        messages = [{"role": "system", "content": system_prompt}]
        if conversation_history:
            messages.extend(conversation_history)
        # Defensive: Only allow supported keys in each message and ensure 'role' and 'content' exist
        allowed_keys = {'role', 'content', 'name'}
        for msg in messages:
            keys_to_remove = set(msg.keys()) - allowed_keys
            for key in keys_to_remove:
                del msg[key]
            if 'role' not in msg:
                msg['role'] = 'user'  # Default to 'user' if missing
            if 'content' not in msg:
                msg['content'] = ''  # Default to empty string if missing
        # Prepare the request payload
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 500
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()
                question = result["choices"][0]["message"]["content"].strip()
                return question
        except httpx.HTTPStatusError as e:
            raise Exception(f"Groq API error: {e.response.status_code} - {e.response.text}")
        except Exception as e:
            raise Exception(f"Error generating question: {str(e)}")
    
    async def generate_follow_up_question(
        self,
        resume_content: str,
        job_role: str,
        conversation_history: List[Dict],
        job_description: Optional[str] = None
    ) -> str:
        """Generate a follow-up question based on conversation history. Always call Groq API."""
        # Always build the system prompt using resume, job role, job description, and conversation history
        system_prompt = f"""
        You are a world-class interviewer conducting a technical and behavioral interview.

        CANDIDATE BACKGROUND:
        - Resume Content: {resume_content}
        - Target Job Role: {job_role}
        {f'- Job Description: {job_description}' if job_description else ''}

        INTERVIEW CONTEXT:
        - Here is the full conversation history so far (questions and answers):
        {conversation_history}
        - For every question, you must generate a follow-up that references specific details from the candidate's resume and/or their previous answers.
        - Do not ask generic questions. Every question should be tailored to the candidate's unique background and the flow of the interview so far.
        - If clarification is needed, ask for it in a way that builds on what the candidate has already said.
        - Only output the next interview question, nothing else.
        """
        print("\n==================== SYSTEM PROMPT SENT TO GROQ ====================\n" + system_prompt + "\n====================================================================\n")
        # Build messages array
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(conversation_history)
        # Defensive: Only allow supported keys in each message and ensure 'role' and 'content' exist
        allowed_keys = {'role', 'content', 'name'}
        for msg in messages:
            keys_to_remove = set(msg.keys()) - allowed_keys
            for key in keys_to_remove:
                del msg[key]
            if 'role' not in msg:
                msg['role'] = 'user'  # Default to 'user' if missing
            if 'content' not in msg:
                msg['content'] = ''  # Default to empty string if missing
        # Prepare the request payload
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 500
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()
                question = result["choices"][0]["message"]["content"].strip()
                return question
        except httpx.HTTPStatusError as e:
            raise Exception(f"Groq API error: {e.response.status_code} - {e.response.text}")
        except Exception as e:
            raise Exception(f"Error generating follow-up question: {str(e)}")
    
    async def evaluate_answers(
        self,
        qa_pairs: List[Dict],
        resume_content: Optional[str] = None,
        job_role: Optional[str] = None,
        job_description: Optional[str] = None,
        return_raw_response: bool = False
    ) -> Union[List[str], Tuple[List[str], dict]]:
        """Evaluate each answer for relevance and quality with respect to its question using Groq."""
        system_prompt = f"""
        You are an expert technical interviewer and evaluator.
        For each question and answer pair below, provide a brief, constructive feedback on the answer's relevance, completeness, and quality with respect to the question asked.
        If the answer is missing, say 'No answer given.'
        {f'Resume Content: {resume_content}' if resume_content else ''}
        {f'Target Job Role: {job_role}' if job_role else ''}
        {f'Job Description: {job_description}' if job_description else ''}
        Return a numbered list of feedback, one for each answer.
        """
        qa_text = "\n".join([
            f"{i+1}. Q: {qa['question']}\nA: {qa.get('answer', '')}" for i, qa in enumerate(qa_pairs)
        ])
        user_prompt = f"Here are the Q&A pairs:\n{qa_text}\n\nProvide feedback as described."
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 600
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=60.0
                )
                response.raise_for_status()
                result = response.json()
                print("[GroqService] Full Groq API response:\n", json.dumps(result, indent=2))
                feedback_text = result["choices"][0]["message"]["content"].strip()
                print("[GroqService] Raw feedback from Groq:\n", feedback_text)
                if not feedback_text:
                    print("[GroqService] WARNING: feedback_text is empty!")
                # Improved parsing: split by numbered feedback sections
                matches = re.split(r'\n\d+\.\s+Feedback:', feedback_text)
                feedback_lines = []
                for i, chunk in enumerate(matches[1:], 1):  # skip the first split (before 1.)
                    feedback_lines.append(chunk.strip())
                # If still empty, fallback to previous logic
                if not feedback_lines:
                    feedback_lines = [line.strip().split('. ', 1)[-1] for line in feedback_text.split('\n') if line.strip() and line[0].isdigit()]
                if not feedback_lines:
                    feedback_lines = [feedback_text] * len(qa_pairs)
                if return_raw_response:
                    return feedback_lines, result
                return feedback_lines
        except Exception as e:
            print("Error evaluating answers:", str(e))
            return ["Feedback not available."] * len(qa_pairs) 