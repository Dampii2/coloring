import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOOD_PALETTES, getMoodGradient } from '../utils/moodColors.js';
import EchoThread from '../components/EchoThread.jsx';
import ResonantSouls from '../components/ResonantSouls.jsx';

function getDominantVector(emotionalVector) {
  if (!emotionalVector) return 'unknown';
  return Object.entries(emotionalVector).sort((a, b) => b[1] - a[1])[0][0];
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function StoryView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [echoes, setEchoes] = useState([]);
  const [resonance, setResonance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/stories/${id}`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`/api/stories/${id}/echoes`).then(r => r.json()),
      fetch(`/api/resonance/${id}`).then(r => r.json()),
    ])
      .then(([storyData, echoData, resonanceData]) => {
        setStory(storyData);
        setEchoes(echoData);
        setResonance(resonanceData);
        setLoading(false);
      })
      .catch(() => {
        setError('This story could not be found.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    const palette = MOOD_PALETTES.wonder;
    return (
      <div style={{
        minHeight: '100vh',
        background: getMoodGradient('wonder'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: `2px solid ${palette.accent}44`,
          borderTopColor: palette.glow,
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: `${palette.text}66`, fontSize: '14px' }}>
          Unfolding the story...
        </p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div style={{
        minHeight: '100vh',
        background: getMoodGradient('grief'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <p style={{ color: '#c47b7b', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '16px' }}>
          {error || 'Story not found.'}
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            border: '1px solid #4a5a8a',
            color: '#7b8fc4',
            padding: '8px 18px',
            borderRadius: '2px',
            cursor: 'pointer',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Return to the Weave
        </button>
      </div>
    );
  }

  const palette = MOOD_PALETTES[story.mood] || MOOD_PALETTES.wonder;
  const gradient = getMoodGradient(story.mood);
  const dominantFreq = getDominantVector(story.emotionalVector);

  return (
    <div style={{
      minHeight: '100vh',
      background: gradient,
      backgroundAttachment: 'fixed',
      transition: 'background 1.2s ease',
      color: palette.text,
    }}>
      {/* Vignette */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Nav */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '18px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: `${palette.bg}cc`,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${palette.accent}33`,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            border: 'none',
            color: `${palette.text}88`,
            cursor: 'pointer',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-sans)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 0',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = palette.glow}
          onMouseLeave={e => e.currentTarget.style.color = `${palette.text}88`}
        >
          <span style={{ fontSize: '16px', lineHeight: 1 }}>&#8592;</span>
          The Weave
        </button>

        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: palette.glow,
          opacity: 0.7,
        }}>
          Living Story
        </div>
      </nav>

      {/* Content */}
      <main style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '680px',
        margin: '0 auto',
        padding: '60px 32px 80px',
        animation: 'stepFadeIn 0.6s ease both',
      }}>
        {/* Chapter */}
        <div style={{
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: `${palette.text}66`,
          marginBottom: '12px',
        }}>
          Chapter: {story.chapter}
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(28px, 5vw, 42px)',
          lineHeight: '1.2',
          color: palette.text,
          marginBottom: '20px',
          fontWeight: '400',
        }}>
          {story.title}
        </h1>

        {/* Author + date row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${palette.accent}, ${palette.bg})`,
            border: `1px solid ${palette.glow}55`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '600',
            color: palette.text,
          }}>
            {story.authorInitial}
          </div>
          <div>
            <div style={{ fontSize: '13px', color: palette.text, fontStyle: 'italic' }}>{story.author}</div>
            <div style={{ fontSize: '11px', color: `${palette.text}66` }}>{formatDate(story.createdAt)}</div>
          </div>

          {/* Emotional frequency badge */}
          <div style={{
            marginLeft: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '3px',
          }}>
            <div style={{
              fontSize: '9px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: `${palette.text}55`,
            }}>
              Emotional frequency
            </div>
            <div style={{
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: palette.glow,
              background: `${palette.accent}22`,
              padding: '3px 10px',
              borderRadius: '2px',
              border: `1px solid ${palette.accent}44`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: palette.glow,
                animation: 'orbPulse 2s ease-in-out infinite',
              }} />
              {dominantFreq}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: '60px',
          height: '1px',
          background: `linear-gradient(90deg, ${palette.glow}, transparent)`,
          marginBottom: '32px',
        }} />

        {/* Emotional vector bars */}
        <div style={{
          marginBottom: '36px',
          padding: '16px',
          background: `${palette.accent}11`,
          border: `1px solid ${palette.accent}22`,
          borderRadius: '3px',
        }}>
          <div style={{
            fontSize: '10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: `${palette.text}55`,
            marginBottom: story.frequency ? '8px' : '12px',
          }}>
            Resonance map
          </div>
          {story.frequency && (
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '14px',
              color: palette.glow,
              marginBottom: '14px',
              lineHeight: '1.5',
            }}>
              &ldquo;{story.frequency}&rdquo;
            </div>
          )}
          {Object.entries(story.emotionalVector).map(([key, val]) => (
            <div key={key} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: '11px', color: `${palette.text}88`, textTransform: 'capitalize', letterSpacing: '0.06em' }}>
                  {key}
                </span>
                <span style={{ fontSize: '11px', color: `${palette.text}66` }}>
                  {Math.round(val * 100)}%
                </span>
              </div>
              <div style={{ height: '2px', background: `${palette.accent}22`, borderRadius: '1px' }}>
                <div style={{
                  height: '100%',
                  width: `${val * 100}%`,
                  background: `linear-gradient(90deg, ${palette.accent}, ${palette.glow})`,
                  borderRadius: '1px',
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Story body */}
        <article>
          {(story.fullText || story.excerpt).split('\n\n').map((para, i) => (
            <p key={i} style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(16px, 2vw, 18px)',
              lineHeight: '1.8',
              color: palette.text,
              marginBottom: '24px',
            }}>
              {para}
            </p>
          ))}
        </article>

        {/* Mood tag */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '8px',
          paddingTop: '24px',
          borderTop: `1px solid ${palette.accent}22`,
        }}>
          <span style={{ fontSize: '11px', color: `${palette.text}55`, letterSpacing: '0.1em' }}>Mood:</span>
          <span style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: palette.glow,
            background: `${palette.accent}22`,
            padding: '2px 8px',
            borderRadius: '2px',
            border: `1px solid ${palette.accent}33`,
          }}>
            {story.mood}
          </span>
        </div>

        {/* Echoes */}
        <EchoThread
          storyId={id}
          echoes={echoes}
          palette={palette}
          onEchoAdded={echo => setEchoes(prev => [...prev, echo])}
        />

        {/* Resonant Souls */}
        <ResonantSouls matches={resonance} currentPalette={palette} />
      </main>
    </div>
  );
}
