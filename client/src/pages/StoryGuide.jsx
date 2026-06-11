import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOOD_PALETTES } from '../utils/moodColors.js';

const FALLBACK_MOMENT_Q = 'Think of a moment that changed the direction of your life. Not the big obvious ones — the quiet ones. What happened?';

const STEP_ATMOSPHERES = [
  { bg: 'radial-gradient(ellipse at 40% 60%, #0a1228 0%, #060b18 100%)', accent: '#2a3a6a', glow: '#4a6ab0', text: '#b0bcd8' },
  { bg: 'radial-gradient(ellipse at 60% 40%, #281808 0%, #180e04 100%)', accent: '#6a3a10', glow: '#b06030', text: '#d8c0a0' },
  { bg: 'radial-gradient(ellipse at 30% 70%, #081820 0%, #050f14 100%)', accent: '#10505a', glow: '#28909a', text: '#a0ccd4' },
  { bg: 'radial-gradient(ellipse at 70% 30%, #140a20 0%, #0c0614 100%)', accent: '#4a2060', glow: '#8040a8', text: '#c8a8d8' },
  { bg: 'radial-gradient(ellipse at 50% 50%, #201508 0%, #140c04 100%)', accent: '#705010', glow: '#c09020', text: '#e0d0a0' },
];

const MOOD_TILES = [
  {
    key: 'grief',
    label: 'Grief',
    description: 'The ache of absence',
    icon: (color) => (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="11" stroke={color} strokeWidth="1.5" />
        <path d="M10 16 Q14 12 18 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <circle cx="10.5" cy="11.5" r="1" fill={color} />
        <circle cx="17.5" cy="11.5" r="1" fill={color} />
      </svg>
    ),
  },
  {
    key: 'joy',
    label: 'Joy',
    description: 'Light finding a way in',
    icon: (color) => (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="11" stroke={color} strokeWidth="1.5" />
        <path d="M10 15 Q14 20 18 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <circle cx="10.5" cy="11" r="1.2" fill={color} />
        <circle cx="17.5" cy="11" r="1.2" fill={color} />
      </svg>
    ),
  },
  {
    key: 'wonder',
    label: 'Wonder',
    description: 'The world still surprises',
    icon: (color) => (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <polygon points="14,3 17,11 25,11 19,16 21,24 14,19 7,24 9,16 3,11 11,11" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'longing',
    label: 'Longing',
    description: 'Distance between hearts',
    icon: (color) => (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 22 C14 22 5 16 5 10 C5 7 7.5 5 10.5 5 C12 5 13.5 6 14 7 C14.5 6 16 5 17.5 5 C20.5 5 23 7 23 10 C23 16 14 22 14 22Z" stroke={color} strokeWidth="1.5" fill="none" />
        <line x1="14" y1="8" x2="14" y2="3" stroke={color} strokeWidth="1" strokeDasharray="2 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'resilience',
    label: 'Resilience',
    description: 'Bending without breaking',
    icon: (color) => (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 24 L14 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 8 C14 8 8 10 8 14 C8 18 14 20 14 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M14 8 C14 8 20 10 20 14 C20 18 14 20 14 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M11 5 L14 8 L17 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    key: 'gratitude',
    label: 'Gratitude',
    description: 'Gifts hidden in plain sight',
    icon: (color) => (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="11" stroke={color} strokeWidth="1.5" />
        <path d="M9 14 L12 17 L19 10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function StoryGuide() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    moment: '',
    mood: '',
    chapter: '',
  });
  const [transitioning, setTransitioning] = useState(false);

  // Live engine: the first question is drawn from the Story Guide; on
  // completion the moment is analyzed into a real emotional vector + frequency.
  const [momentQuestion, setMomentQuestion] = useState(FALLBACK_MOMENT_Q);
  const [createdStory, setCreatedStory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const atm = STEP_ATMOSPHERES[step] || STEP_ATMOSPHERES[0];
  const totalSteps = 5;

  // Ask the Story Guide for the opening question once, on entry.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/guide/next', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: [] }),
    })
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data && data.question) setMomentQuestion(data.question);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  function advance() {
    setTransitioning(true);
    setTimeout(() => {
      setStep(s => s + 1);
      setTransitioning(false);
    }, 300);
  }

  // From the chapter step, weave the fragment: analyze it server-side so the
  // preview shows the engine's real emotional vector + frequency phrase, and
  // the story joins the Weave. Falls through to the local preview on error.
  function weaveAndAdvance() {
    setSubmitting(true);
    fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: answers.chapter || 'An Untitled Fragment',
        fullText: answers.moment,
        author: 'You',
        chapter: answers.chapter,
      }),
    })
      .then(r => (r.ok ? r.json() : null))
      .then(story => { if (story) setCreatedStory(story); })
      .catch(() => {})
      .finally(() => {
        setSubmitting(false);
        advance();
      });
  }

  function goBack() {
    if (step > 0) {
      setTransitioning(true);
      setTimeout(() => {
        setStep(s => s - 1);
        setTransitioning(false);
      }, 300);
    }
  }

  const contentStyle = {
    opacity: transitioning ? 0 : 1,
    transform: transitioning ? 'translateY(12px)' : 'translateY(0)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  };

  const btnBase = {
    background: `${atm.accent}55`,
    border: `1px solid ${atm.glow}66`,
    color: atm.text,
    padding: '12px 28px',
    borderRadius: '2px',
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    transition: 'all 0.3s ease',
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div style={contentStyle}>
            {/* Orb */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${atm.glow}66, transparent)`,
              border: `1px solid ${atm.glow}44`,
              margin: '0 auto 32px',
              animation: 'orbPulse 3s ease-in-out infinite',
            }} />

            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: `${atm.text}66`,
              textAlign: 'center',
              marginBottom: '20px',
            }}>
              Story Guide
            </p>

            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(22px, 4vw, 32px)',
              fontWeight: '400',
              color: atm.text,
              textAlign: 'center',
              lineHeight: '1.4',
              marginBottom: '24px',
            }}>
              Before we begin...
            </h1>

            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '16px',
              lineHeight: '1.8',
              color: `${atm.text}cc`,
              textAlign: 'center',
              maxWidth: '480px',
              margin: '0 auto 16px',
            }}>
              This is a sacred space.
            </p>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '15px',
              lineHeight: '1.8',
              color: `${atm.text}aa`,
              textAlign: 'center',
              maxWidth: '480px',
              margin: '0 auto 36px',
            }}>
              Your story is yours alone. You decide what's shared, with whom, and when. Nothing leaves this space without your permission.
            </p>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={advance}
                style={btnBase}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${atm.accent}88`;
                  e.currentTarget.style.boxShadow = `0 4px 20px ${atm.glow}33`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = `${atm.accent}55`;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                I understand, begin
              </button>
            </div>
          </div>
        );

      case 1:
        return (
          <div style={contentStyle}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: `${atm.text}66`,
              marginBottom: '28px',
            }}>
              Story Guide is listening
            </p>

            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(18px, 3vw, 26px)',
              fontWeight: '400',
              color: atm.text,
              lineHeight: '1.5',
              marginBottom: '32px',
            }}>
              {momentQuestion}
            </h2>

            <textarea
              value={answers.moment}
              onChange={e => setAnswers(a => ({ ...a, moment: e.target.value }))}
              placeholder="Take your time. There are no wrong words here."
              rows={7}
              style={{
                width: '100%',
                background: `${atm.accent}11`,
                border: `1px solid ${atm.accent}44`,
                borderRadius: '3px',
                color: atm.text,
                fontSize: '15px',
                lineHeight: '1.7',
                padding: '16px',
                fontFamily: 'var(--font-serif)',
                outline: 'none',
                resize: 'vertical',
                marginBottom: '24px',
                transition: 'border-color 0.3s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = `${atm.glow}88`}
              onBlur={e => e.currentTarget.style.borderColor = `${atm.accent}44`}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={goBack} style={{
                background: 'transparent',
                border: 'none',
                color: `${atm.text}55`,
                cursor: 'pointer',
                fontSize: '12px',
                letterSpacing: '0.08em',
                fontFamily: 'var(--font-sans)',
              }}>
                Back
              </button>
              <button
                onClick={advance}
                disabled={!answers.moment.trim()}
                style={{
                  ...btnBase,
                  opacity: answers.moment.trim() ? 1 : 0.4,
                  cursor: answers.moment.trim() ? 'pointer' : 'default',
                }}
                onMouseEnter={e => answers.moment.trim() && (e.currentTarget.style.background = `${atm.accent}88`)}
                onMouseLeave={e => (e.currentTarget.style.background = `${atm.accent}55`)}
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div style={contentStyle}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: `${atm.text}66`,
              marginBottom: '28px',
            }}>
              Story Guide
            </p>

            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(18px, 3vw, 26px)',
              fontWeight: '400',
              color: atm.text,
              lineHeight: '1.5',
              marginBottom: '36px',
            }}>
              What emotion do you return to most often when life gets still?
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '14px',
              marginBottom: '32px',
            }}>
              {MOOD_TILES.map(tile => {
                const selected = answers.mood === tile.key;
                const tilePalette = MOOD_PALETTES[tile.key] || MOOD_PALETTES.wonder;
                return (
                  <button
                    key={tile.key}
                    onClick={() => setAnswers(a => ({ ...a, mood: tile.key }))}
                    style={{
                      background: selected ? `${tilePalette.accent}44` : `${tilePalette.accent}11`,
                      border: `1px solid ${selected ? tilePalette.glow : tilePalette.accent + '44'}`,
                      borderRadius: '3px',
                      padding: '18px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      boxShadow: selected ? `0 0 16px ${tilePalette.glow}33` : 'none',
                    }}
                    onMouseEnter={e => {
                      if (!selected) {
                        e.currentTarget.style.background = `${tilePalette.accent}22`;
                        e.currentTarget.style.borderColor = `${tilePalette.accent}88`;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!selected) {
                        e.currentTarget.style.background = `${tilePalette.accent}11`;
                        e.currentTarget.style.borderColor = `${tilePalette.accent}44`;
                      }
                    }}
                  >
                    {tile.icon(selected ? tilePalette.glow : `${tilePalette.text}66`)}
                    <span style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-sans)',
                      color: selected ? tilePalette.glow : `${tilePalette.text}88`,
                      letterSpacing: '0.08em',
                      fontWeight: selected ? '600' : '400',
                    }}>
                      {tile.label}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      color: selected ? `${tilePalette.text}cc` : `${tilePalette.text}55`,
                      textAlign: 'center',
                      lineHeight: '1.4',
                    }}>
                      {tile.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={goBack} style={{
                background: 'transparent',
                border: 'none',
                color: `${atm.text}55`,
                cursor: 'pointer',
                fontSize: '12px',
                letterSpacing: '0.08em',
                fontFamily: 'var(--font-sans)',
              }}>
                Back
              </button>
              <button
                onClick={advance}
                disabled={!answers.mood}
                style={{
                  ...btnBase,
                  opacity: answers.mood ? 1 : 0.4,
                  cursor: answers.mood ? 'pointer' : 'default',
                }}
                onMouseEnter={e => answers.mood && (e.currentTarget.style.background = `${atm.accent}88`)}
                onMouseLeave={e => (e.currentTarget.style.background = `${atm.accent}55`)}
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div style={contentStyle}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: `${atm.text}66`,
              marginBottom: '28px',
            }}>
              Story Guide
            </p>

            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(18px, 3vw, 26px)',
              fontWeight: '400',
              color: atm.text,
              lineHeight: '1.5',
              marginBottom: '14px',
            }}>
              If your life were a book, what would this chapter be called?
            </h2>

            <p style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '14px',
              color: `${atm.text}77`,
              marginBottom: '28px',
              lineHeight: '1.6',
            }}>
              Not the whole story — just this season. The one you're living right now.
            </p>

            <input
              type="text"
              value={answers.chapter}
              onChange={e => setAnswers(a => ({ ...a, chapter: e.target.value }))}
              placeholder="e.g. The Becoming, After the Storm, Learning to Stay..."
              style={{
                width: '100%',
                background: `${atm.accent}11`,
                border: `1px solid ${atm.accent}44`,
                borderBottom: `2px solid ${atm.glow}55`,
                borderRadius: '3px 3px 0 0',
                color: atm.text,
                fontSize: '18px',
                lineHeight: '1.5',
                padding: '14px 16px',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                outline: 'none',
                marginBottom: '32px',
                transition: 'border-color 0.3s',
              }}
              onFocus={e => e.currentTarget.style.borderBottomColor = atm.glow}
              onBlur={e => e.currentTarget.style.borderBottomColor = `${atm.glow}55`}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={goBack} style={{
                background: 'transparent',
                border: 'none',
                color: `${atm.text}55`,
                cursor: 'pointer',
                fontSize: '12px',
                letterSpacing: '0.08em',
                fontFamily: 'var(--font-sans)',
              }}>
                Back
              </button>
              <button
                onClick={weaveAndAdvance}
                disabled={!answers.chapter.trim() || submitting}
                style={{
                  ...btnBase,
                  opacity: answers.chapter.trim() && !submitting ? 1 : 0.4,
                  cursor: answers.chapter.trim() && !submitting ? 'pointer' : 'default',
                }}
                onMouseEnter={e => answers.chapter.trim() && !submitting && (e.currentTarget.style.background = `${atm.accent}88`)}
                onMouseLeave={e => (e.currentTarget.style.background = `${atm.accent}55`)}
              >
                {submitting ? 'Weaving...' : 'Weave my fragment'}
              </button>
            </div>
          </div>
        );

      case 4: {
        // Prefer the engine's analysis of the fragment; fall back to the
        // mood the person chose if the story couldn't be woven server-side.
        const resolvedMood = (createdStory && createdStory.mood) || answers.mood;
        const moodPalette = MOOD_PALETTES[resolvedMood] || MOOD_PALETTES.wonder;
        const moodTile = MOOD_TILES.find(t => t.key === resolvedMood);
        const excerpt = answers.moment.trim().slice(0, 180) + (answers.moment.trim().length > 180 ? '...' : '');
        const frequency = createdStory && createdStory.frequency;

        return (
          <div style={contentStyle}>
            <div style={{
              textAlign: 'center',
              marginBottom: '32px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${atm.glow}88, transparent)`,
                border: `1px solid ${atm.glow}66`,
                margin: '0 auto 16px',
                animation: 'orbPulse 2s ease-in-out infinite',
              }} />
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: `${atm.text}66`,
                marginBottom: '16px',
              }}>
                Story Guide
              </p>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(18px, 3vw, 24px)',
                fontWeight: '400',
                color: atm.text,
                lineHeight: '1.5',
                marginBottom: '8px',
              }}>
                Your story is beginning to take shape...
              </h2>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '14px',
                color: `${atm.text}88`,
              }}>
                Here is your first fragment.
              </p>
            </div>

            {/* Story fragment preview */}
            <div style={{
              background: `linear-gradient(135deg, ${moodPalette.bg}ee, ${moodPalette.bg}cc)`,
              border: `1px solid ${moodPalette.accent}66`,
              borderRadius: '4px',
              padding: '24px',
              marginBottom: '32px',
              position: 'relative',
              boxShadow: `0 4px 32px ${moodPalette.glow}22`,
            }}>
              {/* Accent bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${moodPalette.glow}, ${moodPalette.accent})`,
                borderRadius: '4px 4px 0 0',
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: `${moodPalette.text}66`,
                }}>
                  Chapter: {answers.chapter || 'Unnamed Chapter'}
                </div>
                <span style={{
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: moodPalette.glow,
                  background: `${moodPalette.accent}22`,
                  padding: '2px 8px',
                  borderRadius: '2px',
                  border: `1px solid ${moodPalette.accent}44`,
                }}>
                  {resolvedMood}
                </span>
              </div>

              {frequency && (
                <div style={{
                  fontSize: '9px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: `${moodPalette.text}55`,
                  marginBottom: '6px',
                }}>
                  Shared frequency
                </div>
              )}
              {frequency && (
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: '15px',
                  color: moodPalette.glow,
                  marginBottom: '16px',
                  lineHeight: '1.5',
                }}>
                  &ldquo;{frequency}&rdquo;
                </p>
              )}

              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '15px',
                lineHeight: '1.7',
                color: moodPalette.text,
                marginBottom: '16px',
                fontStyle: 'italic',
              }}>
                "{excerpt}"
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${moodPalette.accent}, ${moodPalette.bg})`,
                  border: `1px solid ${moodPalette.glow}55`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: moodPalette.text,
                }}>
                  Y
                </div>
                <span style={{ fontSize: '12px', color: `${moodPalette.text}88`, fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
                  You
                </span>
                {moodTile && (
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {moodTile.icon(moodPalette.glow)}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={() => navigate(createdStory ? `/story/${createdStory.id}` : '/')}
                style={{
                  ...btnBase,
                  padding: '13px 32px',
                  fontSize: '12px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${atm.accent}88`;
                  e.currentTarget.style.boxShadow = `0 4px 20px ${atm.glow}33`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = `${atm.accent}55`;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Enter the Weave
              </button>
              <button onClick={goBack} style={{
                background: 'transparent',
                border: 'none',
                color: `${atm.text}44`,
                cursor: 'pointer',
                fontSize: '11px',
                letterSpacing: '0.08em',
                fontFamily: 'var(--font-sans)',
              }}>
                Go back
              </button>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: atm.bg,
      transition: 'background 1.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
    }}>
      {/* Vignette */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Story Guide orb (corner) */}
      <div style={{
        position: 'fixed',
        bottom: '32px',
        left: '32px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
      }}>
        <div style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${atm.glow}cc, ${atm.glow}22)`,
          border: `1px solid ${atm.glow}66`,
          animation: 'orbPulse 3s ease-in-out infinite',
          boxShadow: `0 0 12px ${atm.glow}44`,
        }} />
        <span style={{
          fontSize: '9px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: `${atm.text}44`,
          fontFamily: 'var(--font-sans)',
        }}>
          Guide
        </span>
      </div>

      {/* Main content card */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '560px',
        background: `${atm.accent}0a`,
        border: `1px solid ${atm.accent}22`,
        borderRadius: '4px',
        padding: 'clamp(28px, 5vw, 52px)',
        backdropFilter: 'blur(8px)',
      }}>
        {renderStep()}

        {/* Progress dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '36px',
        }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === step ? atm.glow : i < step ? `${atm.glow}66` : `${atm.accent}44`,
                transition: 'all 0.4s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
