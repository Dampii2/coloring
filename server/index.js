require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { analyzeEmotion, generateGuideQuestion, aiEnabled, MODEL } = require('./resonance');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve the built client (production / single-origin demo) when present.
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
const HAS_CLIENT_BUILD = fs.existsSync(path.join(CLIENT_DIST, 'index.html'));
if (HAS_CLIENT_BUILD) {
  app.use(express.static(CLIENT_DIST));
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const stories = [
  {
    id: 'story-001',
    title: 'The Last Tuesday',
    excerpt: 'She kept every voicemail he ever left, even the mundane ones — "picking up milk, need anything?" It was only after he was gone that she realized those were the love letters. The ordinary ones are always the truest.',
    author: 'Mara Solenne',
    authorInitial: 'M',
    mood: 'grief',
    emotionalVector: { longing: 0.9, resilience: 0.2, grief: 0.95, joy: 0.1, wonder: 0.15 },
    chapter: 'The Winter After',
    createdAt: '2024-01-15T10:23:00Z',
    echoes: 47,
    fullText: `She kept every voicemail he ever left, even the mundane ones — "picking up milk, need anything?" It was only after he was gone that she realized those were the love letters. The ordinary ones are always the truest.\n\nFor months she played them on Tuesday evenings, the day of the week he used to call most. She'd sit in the kitchen chair he always claimed, the one with the wobbly leg he kept meaning to fix, and just listen to his breathing between words.\n\nSomeday, she thinks, she'll understand why ordinary things become sacred only in their absence. But for now she just listens. Tuesday after Tuesday after Tuesday.`
  },
  {
    id: 'story-002',
    title: 'What the River Kept',
    excerpt: 'After the flood took everything, I found myself oddly unburdened. The photographs, the furniture, all the objects I had confused for memories — gone. What remained was surprisingly light.',
    author: 'Jonas Adeyemi',
    authorInitial: 'J',
    mood: 'resilience',
    emotionalVector: { longing: 0.4, resilience: 0.9, grief: 0.5, joy: 0.35, wonder: 0.6 },
    chapter: 'After the Water',
    createdAt: '2024-02-03T14:45:00Z',
    echoes: 83,
    fullText: `After the flood took everything, I found myself oddly unburdened. The photographs, the furniture, all the objects I had confused for memories — gone. What remained was surprisingly light.\n\nMy neighbor found me standing in the mud where my front door used to be, and she thought I was in shock. Maybe I was. But I was also realizing that I had been carrying all of that for so long. The weight of accumulated things. The weight of curated self.\n\nI rebuilt slowly. Chose each object deliberately. Now every cup in my cabinet is one I consciously wanted. There's a kind of freedom in starting from nothing that I would never have chosen — but also would never give back.`
  },
  {
    id: 'story-003',
    title: 'The Beekeeper\'s Daughter',
    excerpt: 'My grandmother taught me that bees can recognize human faces. She would walk through her hives without a veil and they would part for her like a slow gold current. I never learned that kind of trust.',
    author: 'Elif Yıldız',
    authorInitial: 'E',
    mood: 'wonder',
    emotionalVector: { longing: 0.5, resilience: 0.3, grief: 0.2, joy: 0.7, wonder: 0.95 },
    chapter: 'Inheritance',
    createdAt: '2024-02-18T09:12:00Z',
    echoes: 61,
    fullText: `My grandmother taught me that bees can recognize human faces. She would walk through her hives without a veil and they would part for her like a slow gold current. I never learned that kind of trust.\n\nShe tried to teach me. "Still your breathing," she'd say, "they feel your fear before you do." I always failed. The buzzing would start and something ancient in me would tighten, and the bees would sense it immediately.\n\nShe died in early spring, before the hives woke for the season. That first summer I stood at the edge of the apiary for a long time. Then I walked in. I don't know if they recognized her in me, or something else entirely. But they parted.`
  },
  {
    id: 'story-004',
    title: 'Forty-Three Sunrises',
    excerpt: 'I counted the sunrises from the hospital window. Not because I was afraid — because I was trying to learn how to want things again. Each morning was practice.',
    author: 'Ryo Nakamura',
    authorInitial: 'R',
    mood: 'transformation',
    emotionalVector: { longing: 0.6, resilience: 0.75, grief: 0.6, joy: 0.5, wonder: 0.7 },
    chapter: 'The Counting Season',
    createdAt: '2024-03-07T06:30:00Z',
    echoes: 129,
    fullText: `I counted the sunrises from the hospital window. Not because I was afraid — because I was trying to learn how to want things again. Each morning was practice.\n\nThe nurses thought it was sweet, this sunrise habit. They didn't know I was running a kind of experiment: could I make myself care about something reliably? Could I manufacture longing until it became real?\n\nBy sunrise forty-three, I had stopped counting. Not because I gave up — because I had forgotten to count, caught up in the actual beauty of the thing. That forgetting felt like the first true sign of recovery. Wanting without accounting for it.`
  },
  {
    id: 'story-005',
    title: 'Letters I Never Translated',
    excerpt: 'My mother wrote letters home in a language I was never taught. After she died I found hundreds of them — unsent, kept in shoeboxes. I know enough to read my name in the margins of each one.',
    author: 'Celeste Moreau',
    authorInitial: 'C',
    mood: 'longing',
    emotionalVector: { longing: 0.95, resilience: 0.3, grief: 0.8, joy: 0.15, wonder: 0.4 },
    chapter: 'Mother Tongue',
    createdAt: '2024-03-22T16:00:00Z',
    echoes: 94,
    fullText: `My mother wrote letters home in a language I was never taught. After she died I found hundreds of them — unsent, kept in shoeboxes. I know enough to read my name in the margins of each one.\n\nI had them translated, eventually. A professor at the university who specializes in that dialect. She did the work quietly, professionally, and handed me back a manila envelope without ceremony.\n\nI haven't opened it. It's been two years. I'm not sure I want to know what she was telling people about me, in the language she never shared. The mystery feels closer to her than the truth might.`
  },
  {
    id: 'story-006',
    title: 'Small Ceremony',
    excerpt: 'Every morning my father made terrible coffee and offered it to everyone with the same gravity as communion. We hated the coffee. We always accepted. Now I make terrible coffee too.',
    author: 'Tobias Brennan',
    authorInitial: 'T',
    mood: 'gratitude',
    emotionalVector: { longing: 0.55, resilience: 0.5, grief: 0.3, joy: 0.8, wonder: 0.3 },
    chapter: 'What We Inherit',
    createdAt: '2024-04-01T08:14:00Z',
    echoes: 156,
    fullText: `Every morning my father made terrible coffee and offered it to everyone with the same gravity as communion. We hated the coffee. We always accepted. Now I make terrible coffee too.\n\nIt took me years to understand that the coffee was never the point. The point was the offering. The point was five minutes standing in the kitchen together before the day scattered everyone to their different urgencies.\n\nMy daughter is seven. She can't drink coffee yet. I give her warm milk in a real cup, not a sippy cup, and we stand in the kitchen together in the early quiet. She holds the cup with both hands the way her grandfather held his mug. I have no idea how she knows to do that.`
  },
  {
    id: 'story-007',
    title: 'The Permission I Gave Myself',
    excerpt: 'At thirty-eight, I quit a career everyone respected to do something no one understood. The hardest part wasn\'t the leap. It was deciding I was allowed to want what I actually wanted.',
    author: 'Amara Osei',
    authorInitial: 'A',
    mood: 'transformation',
    emotionalVector: { longing: 0.5, resilience: 0.85, grief: 0.2, joy: 0.75, wonder: 0.6 },
    chapter: 'The Turn',
    createdAt: '2024-04-14T11:30:00Z',
    echoes: 201,
    fullText: `At thirty-eight, I quit a career everyone respected to do something no one understood. The hardest part wasn't the leap. It was deciding I was allowed to want what I actually wanted.\n\nI had spent so long orienting myself by other people's definitions of worthwhile. Not consciously — I genuinely believed I wanted what I was pursuing. Until a Tuesday afternoon when a small voice said, clearly and without drama: this is not your life.\n\nThe voice didn't tell me what was. That part took longer. But the permission — the internal click of it — happened on that Tuesday. Everything after that was just execution of a decision that had already been made.`
  },
  {
    id: 'story-008',
    title: 'August, Unchanged',
    excerpt: 'We returned to the same beach town every August for twenty-two years. Then one year we didn\'t. I don\'t know who made that decision or how. We just stopped. The town is still there.',
    author: 'Nadia Kowalski',
    authorInitial: 'N',
    mood: 'longing',
    emotionalVector: { longing: 0.9, resilience: 0.25, grief: 0.6, joy: 0.4, wonder: 0.35 },
    chapter: 'Summer\'s End',
    createdAt: '2024-04-29T19:45:00Z',
    echoes: 72,
    fullText: `We returned to the same beach town every August for twenty-two years. Then one year we didn't. I don't know who made that decision or how. We just stopped. The town is still there.\n\nI looked it up recently. The ice cream place is under new management. The motel where we always stayed has been renovated — new paint, new sign. I felt a strange grief about this, as if my memories had been subtly edited without my consent.\n\nBut I think what I'm really mourning isn't the town. It's the family we were when we went there. The arguing in the car, the ritual dinner arguments, my mother's sunburn every single year despite the sunscreen. Those people don't exist anymore either.`
  }
];

// In-memory echo store
let echoes = [
  {
    id: 'echo-001',
    storyId: 'story-001',
    author: 'Anonymous Wanderer',
    authorInitial: 'A',
    text: 'I have seventeen voicemails I can\'t delete. Thank you for naming this.',
    createdAt: '2024-01-16T08:00:00Z'
  },
  {
    id: 'echo-002',
    storyId: 'story-001',
    author: 'S',
    authorInitial: 'S',
    text: 'The ordinary ones. Yes. I had to read this three times.',
    createdAt: '2024-01-17T14:22:00Z'
  },
  {
    id: 'echo-003',
    storyId: 'story-003',
    author: 'Paulo',
    authorInitial: 'P',
    text: 'My grandfather had this with horses. I always thought it was just familiarity. Now I think it was something deeper.',
    createdAt: '2024-02-19T10:05:00Z'
  },
  {
    id: 'echo-004',
    storyId: 'story-006',
    author: 'Marguerite',
    authorInitial: 'M',
    text: 'Small ceremonies are how love survives. This is everything.',
    createdAt: '2024-04-02T07:45:00Z'
  },
  {
    id: 'echo-005',
    storyId: 'story-007',
    author: 'Unnamed',
    authorInitial: 'U',
    text: 'I am thirty-six and that small voice has been speaking. I am not ready to listen yet. But I heard you.',
    createdAt: '2024-04-15T22:10:00Z'
  }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cosineSimilarity(vecA, vecB) {
  const keys = Object.keys(vecA);
  let dot = 0, magA = 0, magB = 0;
  for (const k of keys) {
    dot += (vecA[k] || 0) * (vecB[k] || 0);
    magA += (vecA[k] || 0) ** 2;
    magB += (vecB[k] || 0) ** 2;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/api/stories', (req, res) => {
  const list = stories.map(({ fullText, ...rest }) => rest);
  res.json(list);
});

app.get('/api/stories/:id', (req, res) => {
  const story = stories.find(s => s.id === req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });
  res.json(story);
});

app.post('/api/echoes', (req, res) => {
  const { storyId, author, text } = req.body;
  if (!storyId || !text) {
    return res.status(400).json({ error: 'storyId and text are required' });
  }
  const story = stories.find(s => s.id === storyId);
  if (!story) return res.status(404).json({ error: 'Story not found' });

  const echo = {
    id: uuidv4(),
    storyId,
    author: author || 'Anonymous',
    authorInitial: (author || 'A')[0].toUpperCase(),
    text,
    createdAt: new Date().toISOString()
  };
  echoes.push(echo);
  story.echoes += 1;
  res.status(201).json(echo);
});

app.get('/api/stories/:id/echoes', (req, res) => {
  const storyEchoes = echoes.filter(e => e.storyId === req.params.id);
  res.json(storyEchoes);
});

app.get('/api/resonance/:storyId', (req, res) => {
  const source = stories.find(s => s.id === req.params.storyId);
  if (!source) return res.status(404).json({ error: 'Story not found' });

  const matches = stories
    .filter(s => s.id !== source.id)
    .map(s => ({
      ...s,
      fullText: undefined,
      similarity: cosineSimilarity(source.emotionalVector, s.emotionalVector)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map(({ fullText, similarity, ...rest }) => ({
      ...rest,
      sharedFrequency: Math.round(similarity * 100)
    }));

  res.json(matches);
});

// ─── AI: Emotional Resonance Engine ─────────────────────────────────────────

// Whether the live AI engine is wired up (key present) — lets the client adapt.
app.get('/api/engine', (req, res) => {
  res.json({ aiEnabled: aiEnabled(), model: aiEnabled() ? MODEL : null });
});

// Analyze arbitrary story text into an emotional vector + frequency phrase.
app.post('/api/analyze', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }
  const result = await analyzeEmotion(text);
  res.json(result);
});

// The Story Guide's adaptive next question. Body: { answers: [string, ...] }.
app.post('/api/guide/next', async (req, res) => {
  const { answers } = req.body;
  const result = await generateGuideQuestion(Array.isArray(answers) ? answers : []);
  res.json(result);
});

// Create a new living story — its emotional vector is mapped by the engine,
// so it immediately joins the resonance space and can be matched to other souls.
app.post('/api/stories', async (req, res) => {
  const { title, fullText, author, chapter } = req.body;
  if (!fullText || !fullText.trim()) {
    return res.status(400).json({ error: 'fullText is required' });
  }
  const analysis = await analyzeEmotion(fullText);
  const authorName = author || 'Anonymous';
  const excerpt = fullText.trim().split('\n')[0].slice(0, 280);

  const story = {
    id: `story-${uuidv4().slice(0, 8)}`,
    title: title || 'An Untitled Fragment',
    excerpt,
    author: authorName,
    authorInitial: authorName[0].toUpperCase(),
    mood: analysis.mood,
    emotionalVector: analysis.emotionalVector,
    frequency: analysis.frequency,
    chapter: chapter || 'A New Chapter',
    createdAt: new Date().toISOString(),
    echoes: 0,
    fullText,
  };
  stories.push(story);
  res.status(201).json(story);
});

// SPA fallback — any non-API route serves the client so deep links work.
if (HAS_CLIENT_BUILD) {
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`The Weave server running on port ${PORT}`);
  console.log(`Emotional Resonance Engine: ${aiEnabled() ? `live (${MODEL})` : 'fallback mode (no ANTHROPIC_API_KEY)'}`);
});
