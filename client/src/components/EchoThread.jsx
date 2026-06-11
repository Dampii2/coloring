import React, { useState } from 'react';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EchoThread({ storyId, echoes, palette, onEchoAdded }) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/echoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, author: author.trim() || 'Anonymous', text: text.trim() }),
      });
      if (!res.ok) throw new Error('Failed to send echo');
      const echo = await res.json();
      onEchoAdded(echo);
      setText('');
      setAuthor('');
      setExpanded(false);
    } catch (err) {
      setError('Your echo could not be sent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={{ marginTop: '48px' }}>
      <h2 style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: palette.glow,
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{
          display: 'inline-block',
          width: '20px',
          height: '1px',
          background: palette.glow,
        }} />
        Echoes ({echoes.length})
      </h2>

      {/* Echo list */}
      {echoes.length === 0 ? (
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          color: `${palette.text}66`,
          fontSize: '15px',
          marginBottom: '32px',
        }}>
          No echoes yet. Be the first to respond.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
          {echoes.map(echo => (
            <div key={echo.id} style={{
              display: 'flex',
              gap: '14px',
              padding: '16px',
              background: `${palette.accent}18`,
              border: `1px solid ${palette.accent}33`,
              borderRadius: '3px',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${palette.accent}88, transparent)`,
                border: `1px solid ${palette.glow}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600',
                color: palette.text,
                flexShrink: 0,
              }}>
                {echo.authorInitial}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: palette.glow, fontWeight: '500' }}>
                    {echo.author}
                  </span>
                  <span style={{ fontSize: '11px', color: `${palette.text}55` }}>
                    {formatDate(echo.createdAt)}
                  </span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: palette.text,
                }}>
                  {echo.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add echo toggle */}
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          style={{
            background: 'transparent',
            border: `1px solid ${palette.accent}66`,
            color: palette.glow,
            padding: '10px 20px',
            borderRadius: '2px',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: 'var(--font-sans)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${palette.accent}22`;
            e.currentTarget.style.borderColor = palette.glow;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = `${palette.accent}66`;
          }}
        >
          Add your echo
        </button>
      ) : (
        <form onSubmit={handleSubmit} style={{
          background: `${palette.accent}11`,
          border: `1px solid ${palette.accent}44`,
          borderRadius: '3px',
          padding: '20px',
          animation: 'stepFadeIn 0.3s ease both',
        }}>
          <input
            type="text"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="Your name (optional)"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${palette.accent}44`,
              color: palette.text,
              fontSize: '13px',
              padding: '6px 0',
              marginBottom: '14px',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
            }}
          />
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Let this story echo through you..."
            rows={4}
            style={{
              width: '100%',
              background: 'transparent',
              border: `1px solid ${palette.accent}33`,
              borderRadius: '2px',
              color: palette.text,
              fontSize: '14px',
              lineHeight: '1.6',
              padding: '10px',
              fontFamily: 'var(--font-serif)',
              outline: 'none',
              resize: 'vertical',
              marginBottom: '14px',
            }}
          />
          {error && (
            <p style={{ fontSize: '12px', color: '#c47b7b', marginBottom: '10px' }}>{error}</p>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              style={{
                background: `${palette.accent}44`,
                border: `1px solid ${palette.accent}88`,
                color: palette.text,
                padding: '8px 18px',
                borderRadius: '2px',
                fontSize: '12px',
                letterSpacing: '0.08em',
                cursor: submitting ? 'wait' : 'pointer',
                fontFamily: 'var(--font-sans)',
                opacity: (!text.trim() || submitting) ? 0.5 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {submitting ? 'Sending...' : 'Send echo'}
            </button>
            <button
              type="button"
              onClick={() => { setExpanded(false); setText(''); setAuthor(''); setError(null); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: `${palette.text}66`,
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.08em',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
