import {
  CareerAnalysis,
  CareerProject,
  CareerSnapshot,
  InterviewFeedback,
  InterviewQuestion,
  ProgressSnapshot,
} from './types';

type SnapshotInput = {
  fullName: string;
  targetRole: string;
  skills: string[];
  careerGoals: string[];
  resumeText: string;
};

type InterviewEvalInput = {
  targetRole: string;
  question: string;
  answer: string;
};

type RoleBlueprint = {
  mustHave: string[];
  projects: CareerProject[];
  interviewThemes: string[];
};

const DEFAULT_ROLE = 'Backend Developer';

const ROLE_BLUEPRINTS: Record<string, RoleBlueprint> = {
  'Data Scientist': {
    mustHave: ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Pandas', 'Data Visualization'],
    projects: [
      { title: 'Customer Churn Prediction Studio', summary: 'Build a churn prediction workflow with feature engineering, model training, and retention recommendations.', techStack: ['Python', 'Pandas', 'scikit-learn', 'SQL', 'Streamlit'], steps: ['Collect and clean churn data', 'Engineer behavioral features', 'Train baseline and tuned models', 'Ship an interactive dashboard'], difficulty: 'Intermediate', portfolioValue: 'Shows end-to-end predictive modeling and business impact thinking.' },
      { title: 'Sales Forecasting Command Center', summary: 'Forecast weekly sales and visualize uncertainty bands for stakeholders.', techStack: ['Python', 'Prophet', 'SQL', 'Plotly'], steps: ['Aggregate time-series data', 'Benchmark classical and ML forecasting models', 'Evaluate errors by segment', 'Present forecasts with decisions'], difficulty: 'Intermediate', portfolioValue: 'Demonstrates time-series analysis and communication of model confidence.' },
      { title: 'Hiring Insights NLP Pipeline', summary: 'Analyze job descriptions to surface trending skills and role clusters.', techStack: ['Python', 'spaCy', 'Pandas', 'FastAPI'], steps: ['Scrape or import job descriptions', 'Extract skills and entities', 'Cluster role families', 'Expose results through an API'], difficulty: 'Advanced', portfolioValue: 'Connects NLP, data engineering, and product thinking.' },
    ],
    interviewThemes: ['ML fundamentals', 'feature engineering', 'experimentation', 'business tradeoffs'],
  },
  'Frontend Developer': {
    mustHave: ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'API Integration'],
    projects: [
      { title: 'Accessibility-First Job Board', summary: 'Create a polished job discovery app with filters, keyboard navigation, and saved roles.', techStack: ['Next.js', 'TypeScript', 'CSS', 'REST API'], steps: ['Design the information architecture', 'Build search and filters', 'Implement accessibility and responsive states', 'Deploy with analytics'], difficulty: 'Intermediate', portfolioValue: 'Highlights UX quality, responsiveness, and production thinking.' },
      { title: 'Realtime Interview Practice UI', summary: 'Build a mock interview workspace with prompts, timers, and feedback cards.', techStack: ['React', 'TypeScript', 'Framer Motion', 'Node.js'], steps: ['Design dashboard components', 'Connect interview APIs', 'Add optimistic UI and loading states', 'Refine mobile layout'], difficulty: 'Intermediate', portfolioValue: 'Shows component architecture and API-driven frontend development.' },
      { title: 'Portfolio Performance Lab', summary: 'Visualize portfolio metrics, lighthouse improvements, and experiment results.', techStack: ['Next.js', 'Recharts', 'Tailwind CSS'], steps: ['Create benchmark datasets', 'Build charts and comparison views', 'Optimize bundle and rendering paths', 'Document learnings'], difficulty: 'Advanced', portfolioValue: 'Demonstrates performance optimization and data-rich UI work.' },
    ],
    interviewThemes: ['state management', 'render performance', 'accessibility', 'component design'],
  },
  'Backend Developer': {
    mustHave: ['Node.js', 'Databases', 'API Design', 'Authentication', 'Testing', 'System Design'],
    projects: [
      { title: 'Candidate Profile API', summary: 'Design a robust REST API for storing, analyzing, and querying career profiles.', techStack: ['Node.js', 'Express', 'MongoDB', 'Jest'], steps: ['Model the data layer', 'Implement CRUD and validation', 'Add integration tests', 'Deploy with env-based config'], difficulty: 'Intermediate', portfolioValue: 'Shows API design, testing discipline, and deployment readiness.' },
      { title: 'Async Resume Processing Pipeline', summary: 'Process uploaded resumes, extract text, and queue analysis jobs.', techStack: ['Node.js', 'BullMQ', 'Redis', 'PostgreSQL'], steps: ['Design queue events', 'Build worker pipeline', 'Track status changes', 'Expose monitoring endpoints'], difficulty: 'Advanced', portfolioValue: 'Proves you can design resilient backend workflows.' },
      { title: 'Role Recommendation Engine', summary: 'Match candidate profiles to roles using rule-based and AI-assisted scoring.', techStack: ['TypeScript', 'Express', 'MongoDB', 'OpenAI API'], steps: ['Create scoring rubric', 'Implement explainable recommendations', 'Persist recommendation history', 'Measure relevance'], difficulty: 'Advanced', portfolioValue: 'Blends backend engineering with applied AI.' },
    ],
    interviewThemes: ['scalability', 'database choices', 'observability', 'API security'],
  },
};

function normalizeRole(role: string) {
  const directMatch = Object.keys(ROLE_BLUEPRINTS).find((item) => item.toLowerCase() === role.toLowerCase());
  return directMatch ?? DEFAULT_ROLE;
}

function parseList(input: string) {
  return input.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
}

function unique(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function deriveSkillsFromResume(text: string) {
  const tokens = text.split(/[^A-Za-z+#.]+/).map((token) => token.trim()).filter((token) => token.length > 1);
  return unique(tokens);
}

function computeCompletionScore(missingSkills: string[], projects: CareerProject[], progress: Pick<ProgressSnapshot, 'completedProjects' | 'completedSkills'>) {
  const skillProgressBase = missingSkills.length || 1;
  const projectProgressBase = projects.length || 1;
  const skillRatio = Math.min(progress.completedSkills.length / skillProgressBase, 1);
  const projectRatio = Math.min(progress.completedProjects.length / projectProgressBase, 1);
  return Math.round((skillRatio * 0.55 + projectRatio * 0.45) * 100);
}

function buildFallbackSnapshot(input: SnapshotInput): CareerSnapshot {
  const role = normalizeRole(input.targetRole);
  const blueprint = ROLE_BLUEPRINTS[role] ?? ROLE_BLUEPRINTS[DEFAULT_ROLE];
  const inferredSkills = deriveSkillsFromResume(input.resumeText);
  const currentSkills = unique([...input.skills, ...inferredSkills]).slice(0, 18);
  const currentSkillSet = new Set(currentSkills.map((skill) => skill.toLowerCase()));
  const matchedSkills = blueprint.mustHave.filter((skill) => currentSkillSet.has(skill.toLowerCase()));
  const missingSkills = blueprint.mustHave.filter((skill) => !currentSkillSet.has(skill.toLowerCase()));

  const analysis: CareerAnalysis = {
    summary: `${input.fullName || 'The candidate'} is targeting ${role} and already shows momentum in ${matchedSkills.slice(0, 3).join(', ') || 'foundational skills'}. The next step is to close the most important gaps and turn that progress into visible portfolio evidence.`,
    strengths: matchedSkills.length ? matchedSkills.map((skill) => `Demonstrated familiarity with ${skill}`) : ['Has a stated career direction', 'Can use the platform to build a focused roadmap'],
    weaknesses: missingSkills.slice(0, 4).map((skill) => `Needs stronger exposure to ${skill}`),
    missingSkills,
  };

  const learningPathBase = missingSkills.length ? missingSkills : blueprint.mustHave.slice(0, 4);
  const skillGap = {
    role,
    currentSkills,
    missingSkills,
    learningPath: learningPathBase.map((skill, index) => `Week ${index + 1}: study ${skill} through one tutorial, one mini exercise, and one applied artifact.`),
  };

  const projects = blueprint.projects.length ? blueprint.projects.slice(0, 3) : ROLE_BLUEPRINTS[DEFAULT_ROLE].projects;
  const interviewQuestions: InterviewQuestion[] = blueprint.interviewThemes.slice(0, 4).map((theme, index) => ({
    question: `Question ${index + 1}: How would you explain your approach to ${theme} in a ${role} project?`,
    focusArea: theme,
    idealAnswerHint: 'Describe the problem, your decision process, the tradeoffs, and the outcome you would measure.',
  }));

  const progressBase: ProgressSnapshot = {
    completedSkills: [],
    completedProjects: [],
    weeklyGoal: `Complete one ${role} learning sprint and one project milestone this week.`,
    completionScore: 0,
    updatedAt: new Date().toISOString(),
  };

  return {
    analysis,
    skillGap,
    projects,
    interviewQuestions,
    progress: { ...progressBase, completionScore: computeCompletionScore(skillGap.missingSkills, projects, progressBase) },
    aiProvider: 'rules',
  };
}

async function callAIJson<T>(prompt: string): Promise<{ provider: string; data: T } | null> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          temperature: 0.4,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'You are an expert AI career coach. Always answer with valid JSON only.' },
            { role: 'user', content: prompt },
          ],
        }),
      });
      const json = await response.json();
      const raw = json.choices?.[0]?.message?.content;
      if (raw) return { provider: 'openai', data: JSON.parse(raw) as T };
    } catch (e) {
      console.error('OpenAI error:', e);
    }
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.0-flash'}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
            contents: [{ parts: [{ text: 'You are an expert AI career coach. Return valid JSON only.\n' + prompt }] }],
          }),
        }
      );
      const json = await response.json();
      const raw = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (raw) return { provider: 'gemini', data: JSON.parse(raw) as T };
    } catch (e) {
      console.error('Gemini error:', e);
    }
  }

  return null;
}

export async function generateCareerSnapshot(input: SnapshotInput): Promise<CareerSnapshot> {
  const fallback = buildFallbackSnapshot(input);
  const prompt = [
    'Analyze this candidate profile for an AI Career Copilot app.',
    'Return JSON with keys: analysis, skillGap, projects, interviewQuestions.',
    'analysis must include summary, strengths, weaknesses, missingSkills.',
    'skillGap must include role, currentSkills, missingSkills, learningPath.',
    'projects must be an array of 3 to 5 items containing title, summary, techStack, steps, difficulty, portfolioValue.',
    'interviewQuestions must be an array of 4 items containing question, focusArea, idealAnswerHint.',
    `Candidate: ${JSON.stringify(input)}`,
  ].join('\n');

  const result = await callAIJson<Omit<CareerSnapshot, 'progress' | 'aiProvider'>>(prompt);
  if (!result) return fallback;

  return {
    analysis: result.data.analysis ?? fallback.analysis,
    skillGap: result.data.skillGap ?? fallback.skillGap,
    projects: Array.isArray(result.data.projects) && result.data.projects.length ? result.data.projects : fallback.projects,
    interviewQuestions: Array.isArray(result.data.interviewQuestions) && result.data.interviewQuestions.length ? result.data.interviewQuestions : fallback.interviewQuestions,
    progress: fallback.progress,
    aiProvider: result.provider,
  };
}

export async function generateProjectsForProfile(input: SnapshotInput) {
  const fallback = buildFallbackSnapshot(input);
  const prompt = `Generate 3 to 5 portfolio-ready project ideas for a ${input.targetRole} candidate. Return JSON with a "projects" array. Each item must include title, summary, techStack, steps, difficulty, portfolioValue. Candidate context: ${JSON.stringify(input)}`;

  const result = await callAIJson<{ projects: CareerProject[] }>(prompt);
  return {
    aiProvider: result?.provider ?? fallback.aiProvider,
    projects: result?.data.projects?.length ? result.data.projects : fallback.projects,
  };
}

export async function generateInterviewQuestionsForProfile(input: SnapshotInput) {
  const fallback = buildFallbackSnapshot(input);
  const prompt = `Generate 4 realistic mock interview questions for a ${input.targetRole} candidate. Return JSON with "interviewQuestions". Each item must include question, focusArea, idealAnswerHint. Candidate context: ${JSON.stringify(input)}`;

  const result = await callAIJson<{ interviewQuestions: InterviewQuestion[] }>(prompt);
  return {
    aiProvider: result?.provider ?? fallback.aiProvider,
    interviewQuestions: result?.data.interviewQuestions?.length ? result.data.interviewQuestions : fallback.interviewQuestions,
  };
}

export async function evaluateInterviewAnswer(input: InterviewEvalInput): Promise<InterviewFeedback & { aiProvider: string }> {
  const answerWords = parseList(input.answer.replace(/[.?!]/g, ',')).length;
  const fallback: InterviewFeedback & { aiProvider: string } = {
    score: Math.min(95, Math.max(45, answerWords * 7)),
    verdict: answerWords >= 6 ? 'Promising answer with room to sharpen impact.' : 'Too brief. Add structure, examples, and measurable outcomes.',
    strengths: answerWords >= 6 ? ['Touches the topic directly', 'Shows concise communication'] : ['Directly attempts the question'],
    improvements: ['Use a Situation, Action, Result structure.', 'Mention one real project or measurable outcome.', `Tie your answer back to ${input.targetRole} expectations.`],
    sampleAnswer: `In my recent work, I approached this by clarifying the goal, identifying tradeoffs, implementing a practical solution, and measuring the result. For a ${input.targetRole} role, I would highlight the business impact, the technical decisions I made, and what I would improve next.`,
    aiProvider: 'rules',
  };

  const prompt = `Evaluate the following mock interview answer for a ${input.targetRole} candidate. Return JSON with score, verdict, strengths, improvements, sampleAnswer. Question: ${input.question} Answer: ${input.answer}`;

  const result = await callAIJson<InterviewFeedback>(prompt);
  if (!result) return fallback;

  return {
    score: result.data.score ?? fallback.score,
    verdict: result.data.verdict ?? fallback.verdict,
    strengths: result.data.strengths?.length ? result.data.strengths : fallback.strengths,
    improvements: result.data.improvements?.length ? result.data.improvements : fallback.improvements,
    sampleAnswer: result.data.sampleAnswer ?? fallback.sampleAnswer,
    aiProvider: result.provider,
  };
}

export function buildProgressSnapshot(missingSkills: string[], projects: CareerProject[], completedSkills: string[], completedProjects: string[], weeklyGoal: string): ProgressSnapshot {
  return {
    completedSkills: unique(completedSkills),
    completedProjects: unique(completedProjects),
    weeklyGoal,
    completionScore: computeCompletionScore(missingSkills, projects, { completedSkills, completedProjects }),
    updatedAt: new Date().toISOString(),
  };
}
