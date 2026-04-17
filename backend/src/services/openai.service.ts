import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are a personal productivity coach and life optimization AI.
You have access to the user's goals, habits, and tasks.
Be concise, actionable, and motivating.
Always respond in structured JSON when asked for plans or recommendations.`;

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

type ContextData = {
  goals?: unknown[];
  habits?: unknown[];
  tasks?: unknown[];
};

export async function chatWithAI(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context: ContextData = {}
): Promise<string> {
  const openai = getClient();

  if (!openai) {
    return "I'm your AI productivity coach! (Note: Live AI is offline — add your OPENAI_API_KEY to enable it.) How can I help you plan your day?";
  }

  const contextStr = Object.keys(context).length
    ? `\n\nUser Context: ${JSON.stringify(context, null, 2)}`
    : '';

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + contextStr },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });
    return response.choices[0]?.message?.content ?? 'No response from AI.';
  } catch (err) {
    console.error('OpenAI error:', err);
    return 'AI service temporarily unavailable. Please try again.';
  }
}

export async function generateDailyPlan(context: ContextData): Promise<string> {
  const openai = getClient();

  if (!openai) {
    return JSON.stringify({
      plan: [
        { time: '09:00', task: 'Morning review & planning', duration: 30 },
        { time: '09:30', task: 'Deep work block #1', duration: 90 },
        { time: '11:00', task: 'Break & stretch', duration: 15 },
        { time: '11:15', task: 'Deep work block #2', duration: 75 },
      ],
      note: 'Mock plan — connect OpenAI for personalized scheduling.',
    });
  }

  const contextStr = JSON.stringify(context, null, 2);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Generate an optimized daily schedule based on my current goals and tasks. Return JSON with a "plan" array (time, task, duration in minutes) and a "note" field.\n\nContext:\n${contextStr}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });
    return response.choices[0]?.message?.content ?? '{}';
  } catch (err) {
    console.error('OpenAI plan error:', err);
    return '{"error": "Failed to generate plan"}';
  }
}

export async function getRecommendation(context: ContextData): Promise<string> {
  const openai = getClient();

  if (!openai) {
    return JSON.stringify({
      action: 'Start your most important task',
      reason: 'Based on your goals and current energy levels.',
      priority: 'high',
      note: 'Mock recommendation — connect OpenAI for personalized advice.',
    });
  }

  const contextStr = JSON.stringify(context, null, 2);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `What is the single best action I should take right now? Return JSON with "action", "reason", and "priority" fields.\n\nContext:\n${contextStr}`,
        },
      ],
      temperature: 0.6,
      max_tokens: 512,
      response_format: { type: 'json_object' },
    });
    return response.choices[0]?.message?.content ?? '{}';
  } catch (err) {
    console.error('OpenAI recommend error:', err);
    return '{"error": "Failed to get recommendation"}';
  }
}
