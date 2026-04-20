import axios from 'axios';

const baseURL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');

const api = axios.create({
  baseURL,
});

export type CareerProfile = {
  id: string;
  fullName: string;
  email: string;
  targetRole: string;
  careerGoals: string[];
  skills: string[];
  resumeText: string;
  resumeFileName?: string;
  analysis: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    missingSkills: string[];
  };
  skillGap: {
    role: string;
    currentSkills: string[];
    missingSkills: string[];
    learningPath: string[];
  };
  projects: Array<{
    title: string;
    summary: string;
    techStack: string[];
    steps: string[];
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    portfolioValue: string;
  }>;
  interviewQuestions: Array<{
    question: string;
    focusArea: string;
    idealAnswerHint: string;
  }>;
  progress: {
    completedSkills: string[];
    completedProjects: string[];
    weeklyGoal: string;
    completionScore: number;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type AnalyzePayload = {
  fullName: string;
  email: string;
  targetRole: string;
  careerGoals: string[];
  skills: string[];
  resumeText?: string;
  resumeFileBase64?: string;
  resumeFileName?: string;
};

export async function analyzeCareerProfile(payload: AnalyzePayload) {
  const response = await api.post('/career/profiles/analyze', payload);
  return response.data.data as {
    profile: CareerProfile;
    meta: { aiProvider: string; storage: string; aiConfigured?: boolean; availableProviders?: string[]; warning?: string };
  };
}

export async function getCareerProfile(id: string) {
  const response = await api.get(`/career/profiles/${id}`);
  return response.data.data as { profile: CareerProfile };
}

export async function refreshProjects(id: string) {
  const response = await api.post(`/career/profiles/${id}/projects`);
  return response.data.data as {
    profile: CareerProfile;
    meta: { aiProvider: string; storage: string };
  };
}

export async function refreshInterviewQuestions(id: string) {
  const response = await api.post(`/career/profiles/${id}/interview/questions`);
  return response.data.data as {
    profile: CareerProfile;
    meta: { aiProvider: string; storage: string };
  };
}

export async function evaluateInterviewAnswer(id: string, question: string, answer: string) {
  const response = await api.post(`/career/profiles/${id}/interview/evaluate`, {
    question,
    answer,
  });
  return response.data.data as {
    feedback: {
      score: number;
      verdict: string;
      strengths: string[];
      improvements: string[];
      sampleAnswer: string;
      aiProvider: string;
    };
  };
}

export async function updateCareerProgress(
  id: string,
  payload: {
    completedSkills: string[];
    completedProjects: string[];
    weeklyGoal: string;
  }
) {
  const response = await api.patch(`/career/profiles/${id}/progress`, payload);
  return response.data.data as { profile: CareerProfile };
}
