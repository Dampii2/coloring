import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoryCard from '../components/StoryCard.jsx';
import { getDominantMood, getMoodGradient, MOOD_PALETTES } from '../utils/moodColors.js';

export default function Weave() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/stories')
      .then(r => r.json())
      .then(data => { setStories(data); setLoading(false); })
      .catch(() => { setError('Could not reach the Weave.'); setLoading(false); });
  }, []);

  const dominantMood = getDominantMood(stories);
  const palette = MOOD_PALETTES[dominantMood] || MOOD_PALETTES.wonder;
  const gradient = getMoodGradient(dominantMood);

  return (
    <div style={{
      minHeight: '100vh',
      background: gradient,
      backgroundAttachment: 'fixed',
      transition: 'background 1.2s ease',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Ambient texture overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'saturate\' values=\'0\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Header wordmark */}
      <header style={{
        position: 'fixed',
        top: '24px',
        left: '28px',
        zIndex: 100,
        userSelect: 'none',
      }}>
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '18px',
          letterSpacing: '0.25em',
          color: palette.glow,
          textTransform: 'uppercase',
          opacity: 0.85,
          textShadow: `0 0 20px ${palette.glow}44`,
        }}>
          The Weave
        </div>
        <div style={{
          width: '40px',
          height: '1px',
          background: `linear-gradient(90deg, ${palette.glow}, transparent)`,
          marginTop: '4px',
        }} />
      </header>

      {/* Mood indicator */}
      {!loading && stories.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '28px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: `${palette.text}77`,
          }}>
            Atmosphere
          </span>
          <span style={{
            fontSize: '10px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: palette.glow,
            background: `${palette.accent}22`,
            padding: '3px 10px',
            borderRadius: '2px',
            border: `1px solid ${palette.accent}44`,
          }}>
            {dominantMood}
          </span>
        </div>
      )}

      {/* Canvas */}
      <main style={{
        position: 'relative',
        minHeight: '200vh',
        paddingTop: '80px',
        paddingBottom: '120px',
        zIndex: 1,
      }}>
        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            flexDirection: 'column',
            gap: '20px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: `2px solid ${palette.accent}44`,
              borderTopColor: palette.glow,
              animation: 'spin 1s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              color: `${palette.text}66`,
              fontSize: '14px',
            }}>
              The threads are gathering...
            </p>
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
          }}>
            <p style={{ color: '#c47b7b', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              {error}
            </p>
          </div>
        )}

        {!loading && !error && stories.map((story, i) => (
          <StoryCard key={story.id} story={story} index={i} />
        ))}
      </main>

      {/* Begin your story CTA */}
      <div style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 100,
      }}>
        <button
          onClick={() => navigate('/onboarding')}
          style={{
            background: `linear-gradient(135deg, ${palette.accent}66, ${palette.accent}33)`,
            border: `1px solid ${palette.glow}66`,
            color: palette.text,
            padding: '12px 24px',
            borderRadius: '2px',
            fontSize: '12px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            boxShadow: `0 4px 20px ${palette.glow}33`,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `linear-gradient(135deg, ${palette.accent}99, ${palette.accent}55)`;
            e.currentTarget.style.boxShadow = `0 6px 28px ${palette.glow}55`;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = `linear-gradient(135deg, ${palette.accent}66, ${palette.accent}33)`;
            e.currentTarget.style.boxShadow = `0 4px 20px ${palette.glow}33`;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Begin your story
        </button>
      </div>

      {/* Subtle vignette */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
    </div>
  );
}
