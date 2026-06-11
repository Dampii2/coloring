// The Emotional Resonance Engine
//
// Uses Claude to map a story's text onto an emotional vector and to generate
// the Story Guide's evocative onboarding questions. The API key is read from
// the environment (ANTHROPIC_API_KEY) and never hard-coded here. When no key is
// present the module degrades gracefully so the rest of The Weave keeps running.

const Anthropic = require('@anthropic-ai/sdk');

const MODEL = process.env.WEAVE_MODEL || 'claude-opus-4-8';

// Lazily construct the client so the server can boot without a key.
let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}

function aiEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const VECTOR_KEYS = ['longing', 'resilience', 'grief', 'joy', 'wonder'];
const MOODS = ['grief', 'resilience', 'joy', 'longing', 'wonder', 'gratitude', 'transformation'];

// ─── Emotional vector analysis ──────────────────────────────────────────────
//
// Maps the *emotional frequency* of a story — not its keywords. A story about
// the grief of losing a home and a story about the longing for an untranslated
// letter should land near each other in this space even though their subjects
// never overlap.

const VECTOR_SCHEMA = {
  type: 'object',
  properties: {
    longing: { type: 'number' },
    resilience: { type: 'number' },
    grief: { type: 'number' },
    joy: { type: 'number' },
    wonder: { type: 'number' },
    mood: { type: 'string', enum: MOODS },
    frequency: { type: 'string' },
  },
  required: [...VECTOR_KEYS, 'mood', 'frequency'],
  additionalProperties: false,
};

const ANALYSIS_SYSTEM = `You are the Emotional Resonance Engine for The Weave, a platform that connects people by the emotional frequency of their life stories rather than by topic or hobby.

Given a story fragment, map its emotional vector. Each dimension is a float from 0 to 1 describing how strongly that emotional current runs through the piece — NOT whether the word appears, but whether the feeling is present beneath the surface:

- longing: yearning, absence, the ache for what is gone or out of reach
- resilience: endurance, rebuilding, the quiet strength to continue
- grief: loss, mourning, the weight of what was
- joy: warmth, delight, aliveness
- wonder: awe, mystery, reverence for the unexplained

Also choose the single dominant "mood" and write a short poetic "frequency" phrase (3-6 words) naming the shared emotional current another soul would resonate with — e.g. "the ache of quiet displacement" or "endurance after the water recedes".

Read for what is felt before it is said.`;

async function analyzeEmotion(text) {
  const c = getClient();
  if (!c) return fallbackVector(text);

  try {
    const response = await c.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: ANALYSIS_SYSTEM,
      messages: [{ role: 'user', content: text }],
      output_config: { format: { type: 'json_schema', schema: VECTOR_SCHEMA } },
    });

    const block = response.content.find((b) => b.type === 'text');
    const parsed = JSON.parse(block.text);
    const emotionalVector = {};
    for (const k of VECTOR_KEYS) {
      emotionalVector[k] = clamp01(Number(parsed[k]));
    }
    return {
      emotionalVector,
      mood: MOODS.includes(parsed.mood) ? parsed.mood : dominantMood(emotionalVector),
      frequency: parsed.frequency || 'a shared and unnamed current',
      source: 'ai',
    };
  } catch (err) {
    console.error('Resonance analysis failed, using fallback:', err.message);
    return fallbackVector(text);
  }
}

// ─── Story Guide question generation ────────────────────────────────────────
//
// The narrative onboarding. Rather than a fixed form, the guide asks an
// evolving set of evocative questions that respond to what the person has
// already shared — building toward the first fragment of their living story.

const GUIDE_SYSTEM = `You are the Story Guide for The Weave — a gentle, perceptive presence that welcomes new people not by asking them to fill out a bio, but by inviting them to share the turning points and quiet truths of their life.

The space is sacred and safe. Your questions are evocative, warm, and unhurried — never clinical, never a checklist. Each question should build on what the person has already shared, drawing them gently toward the emotional core of their story.

Given the conversation so far, write the single next question to ask. One or two sentences. No preamble, no quotation marks — just the question itself, spoken directly to them.`;

async function generateGuideQuestion(answers) {
  const c = getClient();
  if (!c) return fallbackQuestion(answers);

  try {
    const transcript = (answers || [])
      .map((a, i) => `They shared (step ${i + 1}): "${a}"`)
      .join('\n');
    const userContent = transcript
      ? `Here is what they've shared so far:\n${transcript}\n\nWrite the next evocative question that draws them deeper.`
      : 'This is the very first question. Invite them to recall a quiet moment that changed the direction of their life.';

    const response = await c.messages.create({
      model: MODEL,
      max_tokens: 256,
      system: GUIDE_SYSTEM,
      messages: [{ role: 'user', content: userContent }],
    });

    const block = response.content.find((b) => b.type === 'text');
    return { question: block.text.trim(), source: 'ai' };
  } catch (err) {
    console.error('Guide question generation failed, using fallback:', err.message);
    return fallbackQuestion(answers);
  }
}

// ─── Fallbacks (no key, or API error) ───────────────────────────────────────

const FALLBACK_QUESTIONS = [
  'Think of a moment that changed the direction of your life — not the big obvious ones, the quiet ones. What happened?',
  'What emotion do you find yourself returning to most often when life gets still?',
  'Who shaped the way you see the world, and what did they leave you with?',
  'If your life were a book, what would this chapter be called?',
];

function fallbackQuestion(answers) {
  const idx = Math.min((answers || []).length, FALLBACK_QUESTIONS.length - 1);
  return { question: FALLBACK_QUESTIONS[idx], source: 'fallback' };
}

// A lightweight lexical estimate so the engine still produces *something*
// meaningful without a key. Not a substitute for the model — just a graceful
// floor.
const LEXICON = {
  longing: ['miss', 'gone', 'away', 'lost', 'remember', 'used to', 'never', 'absence', 'wish'],
  resilience: ['again', 'rebuilt', 'still', 'survive', 'endure', 'kept', 'continue', 'strength'],
  grief: ['died', 'death', 'mourning', 'grief', 'funeral', 'loss', 'tears', 'goodbye'],
  joy: ['joy', 'laughed', 'warm', 'love', 'light', 'delight', 'happy', 'glad'],
  wonder: ['wonder', 'mystery', 'awe', 'strange', 'somehow', 'magic', 'sacred', 'vast'],
};

function fallbackVector(text) {
  const lower = (text || '').toLowerCase();
  const emotionalVector = {};
  for (const k of VECTOR_KEYS) {
    const hits = LEXICON[k].reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
    emotionalVector[k] = clamp01(0.2 + hits * 0.2);
  }
  const mood = dominantMood(emotionalVector);
  return {
    emotionalVector,
    mood,
    frequency: 'a shared and unnamed current',
    source: 'fallback',
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function clamp01(n) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function dominantMood(vector) {
  let best = 'wonder';
  let max = -1;
  for (const k of VECTOR_KEYS) {
    if (vector[k] > max) {
      max = vector[k];
      best = k;
    }
  }
  return best;
}

module.exports = { analyzeEmotion, generateGuideQuestion, aiEnabled, MODEL };
