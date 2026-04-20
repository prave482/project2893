export interface CareerAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
}

export interface SkillGapAnalysis {
  role: string;
  currentSkills: string[];
  missingSkills: string[];
  learningPath: string[];
}

export interface CareerProject {
  title: string;
  summary: string;
  techStack: string[];
  steps: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  portfolioValue: string;
}

export interface InterviewQuestion {
  question: string;
  focusArea: string;
  idealAnswerHint: string;
}

export interface ProgressSnapshot {
  completedSkills: string[];
  completedProjects: string[];
  weeklyGoal: string;
  completionScore: number;
  updatedAt: string;
}

export interface CareerSnapshot {
  analysis: CareerAnalysis;
  skillGap: SkillGapAnalysis;
  projects: CareerProject[];
  interviewQuestions: InterviewQuestion[];
  progress: ProgressSnapshot;
  aiProvider: string;
}

export interface InterviewFeedback {
  score: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  sampleAnswer: string;
}

export interface CareerProfileRecord {
  id: string;
  fullName: string;
  email: string;
  targetRole: string;
  careerGoals: string[];
  skills: string[];
  resumeText: string;
  resumeFileName?: string;
  analysis: CareerAnalysis;
  skillGap: SkillGapAnalysis;
  projects: CareerProject[];
  interviewQuestions: InterviewQuestion[];
  progress: ProgressSnapshot;
  createdAt: string;
  updatedAt: string;
}
