import PyPDF2
import docx
import io
from fastapi import UploadFile
from typing import Optional

class ResumeParser:
    """Service for parsing resume files (PDF and DOCX)"""
    
    async def parse_file(self, file: UploadFile) -> str:
        """Parse resume file and extract text content"""
        content = await file.read()
        
        if file.filename.lower().endswith('.pdf'):
            return self._parse_pdf(content)
        elif file.filename.lower().endswith(('.docx', '.doc')):
            return self._parse_docx(content)
        else:
            raise ValueError(f"Unsupported file type: {file.filename}")
    
    def _parse_pdf(self, content: bytes) -> str:
        """Parse PDF content"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Error parsing PDF: {str(e)}")
    
    def _parse_docx(self, content: bytes) -> str:
        """Parse DOCX content"""
        try:
            doc = docx.Document(io.BytesIO(content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Error parsing DOCX: {str(e)}")
    
    def extract_skills(self, text: str) -> list:
        """Extract skills from resume text"""
        # Common technical skills
        common_skills = [
            "Python", "JavaScript", "Java", "C++", "C#", "React", "Angular", "Vue.js",
            "Node.js", "Express", "Django", "Flask", "FastAPI", "PostgreSQL", "MySQL",
            "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP",
            "Git", "GitHub", "CI/CD", "Jenkins", "Agile", "Scrum", "REST API",
            "GraphQL", "Microservices", "Machine Learning", "AI", "Data Science",
            "SQL", "NoSQL", "HTML", "CSS", "TypeScript", "PHP", "Ruby", "Go",
            "Rust", "Swift", "Kotlin", "Scala", "R", "MATLAB", "TensorFlow",
            "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Jupyter"
        ]
        
        found_skills = []
        text_lower = text.lower()
        
        for skill in common_skills:
            if skill.lower() in text_lower:
                found_skills.append(skill)
        
        return found_skills
    
    def extract_experience(self, text: str) -> str:
        """Extract work experience section from resume"""
        # Simple extraction - look for common experience keywords
        experience_keywords = [
            "experience", "work history", "employment", "career", "professional background"
        ]
        
        lines = text.split('\n')
        experience_lines = []
        in_experience_section = False
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # Check if we're entering experience section
            if any(keyword in line_lower for keyword in experience_keywords):
                in_experience_section = True
                continue
            
            # If we're in experience section, collect lines
            if in_experience_section and line.strip():
                experience_lines.append(line.strip())
            
            # Stop if we hit another major section
            if in_experience_section and any(keyword in line_lower for keyword in [
                "education", "skills", "projects", "certifications", "awards"
            ]):
                break
        
        return '\n'.join(experience_lines) if experience_lines else "No experience section found" 