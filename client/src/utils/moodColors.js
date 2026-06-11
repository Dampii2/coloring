export const MOOD_PALETTES = {
  grief:          { bg: '#0d0f1a', accent: '#4a5a8a', glow: '#7b8fc4', text: '#c8cfe8' },
  resilience:     { bg: '#0f1a0d', accent: '#4a7a3a', glow: '#7bc47b', text: '#c8e8c8' },
  joy:            { bg: '#1a0f08', accent: '#8a5a1a', glow: '#c47b3a', text: '#e8d5b0' },
  longing:        { bg: '#0d1018', accent: '#3a4a6a', glow: '#6a7ab0', text: '#b8c0d8' },
  wonder:         { bg: '#0d1518', accent: '#1a5a6a', glow: '#3ab0c4', text: '#b0d8e0' },
  gratitude:      { bg: '#18150d', accent: '#6a5a1a', glow: '#b0a030', text: '#e0d8b0' },
  transformation: { bg: '#150d18', accent: '#5a1a6a', glow: '#a030c4', text: '#d8b0e0' },
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
    grief:          'radial-gradient(ellipse at 30% 40%, #1a1f3a 0%, #0d0f1a 60%, #080a12 100%)',
    resilience:     'radial-gradient(ellipse at 70% 30%, #132a0f 0%, #0f1a0d 60%, #080f07 100%)',
    joy:            'radial-gradient(ellipse at 50% 60%, #2a1808 0%, #1a0f08 60%, #100805 100%)',
    longing:        'radial-gradient(ellipse at 20% 70%, #111828 0%, #0d1018 60%, #070a10 100%)',
    wonder:         'radial-gradient(ellipse at 60% 20%, #0a2028 0%, #0d1518 60%, #070d10 100%)',
    gratitude:      'radial-gradient(ellipse at 40% 50%, #221d08 0%, #18150d 60%, #100e07 100%)',
    transformation: 'radial-gradient(ellipse at 50% 30%, #1e0a22 0%, #150d18 60%, #0c080f 100%)',
  };
  return palettes[mood] || palettes.wonder;
}
