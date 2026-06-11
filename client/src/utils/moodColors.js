export const MOOD_PALETTES = {
  grief:          { bg: '#161b35', accent: '#5b6fd6', glow: '#9db4ff', text: '#dfe6ff' },
  resilience:     { bg: '#0f2c1c', accent: '#23b87a', glow: '#5fffb0', text: '#d3ffe8' },
  joy:            { bg: '#2e1605', accent: '#ff9d2e', glow: '#ffd27a', text: '#fff0d4' },
  longing:        { bg: '#1a1640', accent: '#7a6cff', glow: '#b9aaff', text: '#e3dcff' },
  wonder:         { bg: '#06283a', accent: '#1fb6d8', glow: '#5ff0ff', text: '#cdf3ff' },
  gratitude:      { bg: '#2c2406', accent: '#e6b422', glow: '#ffe07a', text: '#fff6d2' },
  transformation: { bg: '#2a0d38', accent: '#b13ce0', glow: '#e88bff', text: '#f6dcff' },
};

export function getDominantMood(stories) {
  if (!stories || stories.length === 0) return 'wonder';
  const counts = {};
  for (const s of stories) {
    counts[s.mood] = (counts[s.mood] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export function getMoodGradient(mood) {
  const palettes = {
    grief:          'radial-gradient(ellipse at 25% 20%, #3a4790 0%, #1d2456 45%, #0a0e26 100%)',
    resilience:     'radial-gradient(ellipse at 75% 25%, #1d7a4f 0%, #114429 45%, #06150d 100%)',
    joy:            'radial-gradient(ellipse at 50% 30%, #b3590f 0%, #6e2f08 45%, #200f04 100%)',
    longing:        'radial-gradient(ellipse at 20% 75%, #4338a3 0%, #241d5e 45%, #0c0a28 100%)',
    wonder:         'radial-gradient(ellipse at 65% 18%, #0f6a8f 0%, #0a3a54 45%, #03141f 100%)',
    gratitude:      'radial-gradient(ellipse at 40% 35%, #9c7a12 0%, #5c4a0c 45%, #1a1505 100%)',
    transformation: 'radial-gradient(ellipse at 55% 25%, #7d1aa3 0%, #45125c 45%, #160820 100%)',
  };
  return palettes[mood] || palettes.wonder;
}
