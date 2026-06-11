import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOOD_PALETTES } from '../utils/moodColors.js';

const cardPositions = [
  { top: '8%',  left: '5%',   rotation: -2, width: '280px', delay: '0ms' },
  { top: '6%',  left: '33%',  rotation: 1,  width: '300px', delay: '80ms' },
  { top: '5%',  left: '63%',  rotation: -1, width: '270px', delay: '160ms' },
  { top: '38%', left: '2%',   rotation: 2,  width: '290px', delay: '120ms' },
  { top: '40%', left: '28%',  rotation: -3, width: '310px', delay: '200ms' },
  { top: '36%', left: '58%',  rotation: 1,  width: '285px', delay: '60ms' },
  { top: '70%', left: '8%',   rotation: -1, width: '275px', delay: '180ms' },
  { top: '68%', left: '40%',  rotation: 3,  width: '295px', delay: '240ms' },
  { top: '72%', left: '68%',  rotation: -2, width: '265px', delay: '100ms' },
];

export default function StoryCard({ story, index }) {
  const navigate = useNavigate();
  const palette = MOOD_PALETTES[story.mood] || MOOD_PALETTES.wonder;
  const pos = cardPositions[index % cardPositions.length];

  const cardStyle = {
    position: 'absolute',
    top: pos.top,
    left: pos.left,
    width: pos.width,
    '--card-rotation': `${pos.rotation}deg`,
    '--glow-color': palette.glow + '55',
    transform: `rotate(${pos.rotation}deg)`,
    background: `linear-gradient(135deg, ${palette.bg}ee, ${palette.bg}cc)`,
    border: `1px solid ${palette.accent}66`,
    borderRadius: '4px',
    padding: '20px',
    cursor: 'pointer',
    animation: `floatIn 0.7s ease both, floatDrift 6s ease-in-out infinite`,
    animationDelay: `${pos.delay}, ${1 + index * 0.3}s`,
    boxShadow: `0 4px 24px ${palette.glow}22, 0 0 0 1px ${palette.accent}22`,
    transition: 'box-shadow 0.4s ease, transform 0.4s ease, border-color 0.4s ease',
    backdropFilter: 'blur(4px)',
    willChange: 'transform',
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.boxShadow = `0 8px 40px ${palette.glow}55, 0 0 0 1px ${palette.accent}88`;
    e.currentTarget.style.transform = `rotate(${pos.rotation}deg) translateY(-4px) scale(1.02)`;
    e.currentTarget.style.borderColor = `${palette.accent}cc`;
    e.currentTarget.style.zIndex = '10';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.boxShadow = `0 4px 24px ${palette.glow}22, 0 0 0 1px ${palette.accent}22`;
    e.currentTarget.style.transform = `rotate(${pos.rotation}deg)`;
    e.currentTarget.style.borderColor = `${palette.accent}66`;
    e.currentTarget.style.zIndex = '1';
  };

  return (
    <article
      style={cardStyle}
      onClick={() => navigate(`/story/${story.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/story/${story.id}`)}
      aria-label={`Read story: ${story.title}`}
    >
      {/* Mood accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${palette.glow}, ${palette.accent})`,
        borderRadius: '4px 4px 0 0',
      }} />

      {/* Header: initials + mood badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${palette.accent}, ${palette.bg})`,
          border: `1px solid ${palette.glow}66`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: '600',
          color: palette.text,
          letterSpacing: '0.05em',
          flexShrink: 0,
        }}>
          {story.authorInitial}
        </div>

        <span style={{
          fontSize: '10px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: palette.glow,
          background: `${palette.accent}22`,
          padding: '2px 8px',
          borderRadius: '2px',
          border: `1px solid ${palette.accent}44`,
        }}>
          {story.mood}
        </span>
      </div>

      {/* Excerpt */}
      <p style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '13.5px',
        lineHeight: '1.65',
        color: palette.text,
        marginBottom: '14px',
        display: '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {story.excerpt}
      </p>

      {/* Footer: author + echoes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '11px',
          color: `${palette.text}99`,
          fontStyle: 'italic',
        }}>
          {story.author}
        </span>
        <span style={{
          fontSize: '11px',
          color: palette.glow,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <span style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: palette.glow,
            animation: 'orbPulse 2.5s ease-in-out infinite',
          }} />
          {story.echoes} echoes
        </span>
      </div>
    </article>
  );
}
