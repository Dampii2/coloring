import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOOD_PALETTES } from '../utils/moodColors.js';

export default function ResonantSouls({ matches, currentPalette }) {
  const navigate = useNavigate();

  if (!matches || matches.length === 0) return null;

  return (
    <aside style={{ marginTop: '48px' }}>
      <h2 style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: currentPalette.glow,
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{
          display: 'inline-block',
          width: '20px',
          height: '1px',
          background: currentPalette.glow,
        }} />
        Resonant Souls
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {matches.map(match => {
          const palette = MOOD_PALETTES[match.mood] || MOOD_PALETTES.wonder;
          return (
            <div
              key={match.id}
              onClick={() => navigate(`/story/${match.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(`/story/${match.id}`)}
              style={{
                padding: '14px 16px',
                background: `${palette.accent}18`,
                border: `1px solid ${palette.accent}33`,
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${palette.accent}28`;
                e.currentTarget.style.borderColor = `${palette.accent}66`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = `${palette.accent}18`;
                e.currentTarget.style.borderColor = `${palette.accent}33`;
              }}
            >
              {/* Frequency bar */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '2px',
                width: `${match.sharedFrequency}%`,
                background: `linear-gradient(90deg, ${palette.accent}, ${palette.glow})`,
                transition: 'width 1s ease',
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${palette.accent}, transparent)`,
                  border: `1px solid ${palette.glow}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: palette.text,
                  flexShrink: 0,
                }}>
                  {match.authorInitial}
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: palette.text, fontFamily: 'var(--font-serif)', lineHeight: '1.3' }}>
                    {match.title}
                  </div>
                  <div style={{ fontSize: '10px', color: palette.glow, letterSpacing: '0.08em' }}>
                    {match.sharedFrequency}% shared frequency
                  </div>
                </div>
              </div>

              <p style={{
                fontSize: '12px',
                color: `${palette.text}88`,
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {match.excerpt}
              </p>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
