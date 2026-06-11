import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  delay: Math.random() * 4,
  duration: 2.5 + Math.random() * 3,
}));

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hue, setHue] = useState(0);

  // Slowly cycle background hue
  useEffect(() => {
    const id = setInterval(() => setHue(h => (h + 0.3) % 360), 50);
    return () => clearInterval(id);
  }, []);

  const bg = `radial-gradient(ellipse at 30% 40%,
    hsl(${hue}, 60%, 18%) 0%,
    hsl(${(hue + 60) % 360}, 50%, 10%) 50%,
    hsl(${(hue + 120) % 360}, 40%, 6%) 100%)`;

  const accentHsl = `hsl(${(hue + 40) % 360}, 80%, 65%)`;
  const glowHsl   = `hsl(${(hue + 40) % 360}, 90%, 75%)`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    // Simulate network latency then store session
    setTimeout(() => {
      const user = {
        name: mode === 'signup' ? name.trim() : email.split('@')[0],
        email: email.trim().toLowerCase(),
      };
      localStorage.setItem('weave_user', JSON.stringify(user));
      navigate('/');
    }, 900);
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, transition: 'background 0.6s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Animated stars */}
      {STARS.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: `${s.size}px`,
          height: `${s.size}px`,
          borderRadius: '50%',
          background: 'white',
          opacity: 0,
          animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 0.85; transform: scale(1.2); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinRing {
          to { transform: rotate(360deg); }
        }
        .weave-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 10px;
          color: #f0eeff;
          font-size: 15px;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
          font-family: inherit;
        }
        .weave-input::placeholder { color: rgba(255,255,255,0.35); }
        .weave-input:focus {
          border-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.12);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.08);
        }
        .tab-btn {
          flex: 1;
          padding: 9px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s;
          font-family: inherit;
        }
      `}</style>

      {/* Card */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '420px',
        margin: '20px',
        background: 'rgba(10,8,30,0.72)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: `1px solid rgba(255,255,255,0.14)`,
        boxShadow: `0 0 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)`,
        animation: 'fadeUp 0.7s ease both',
        overflow: 'hidden',
      }}>
        {/* Top color bar */}
        <div style={{
          height: '4px',
          background: `linear-gradient(90deg, ${accentHsl}, ${glowHsl}, ${accentHsl})`,
          backgroundSize: '200% 100%',
          animation: 'progressReveal 0.8s ease both',
        }} />

        <div style={{ padding: '40px 36px 36px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              fontFamily: 'Georgia, serif',
              fontSize: '28px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: glowHsl,
              textShadow: `0 0 30px ${accentHsl}`,
              marginBottom: '6px',
            }}>
              The Weave
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', letterSpacing: '0.05em' }}>
              Where stories find their souls
            </p>
          </div>

          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px', marginBottom: '28px' }}>
            {['login', 'signup'].map(m => (
              <button
                key={m}
                className="tab-btn"
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  background: mode === m ? `linear-gradient(135deg, ${accentHsl}33, ${glowHsl}22)` : 'transparent',
                  color: mode === m ? glowHsl : 'rgba(255,255,255,0.45)',
                  border: mode === m ? `1px solid ${accentHsl}55` : '1px solid transparent',
                  fontWeight: mode === m ? '600' : '400',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                  Your name
                </label>
                <input
                  className="weave-input"
                  type="text"
                  placeholder="e.g. Mara Solenne"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                Email
              </label>
              <input
                className="weave-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                Password
              </label>
              <input
                className="weave-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <p style={{ color: '#ff8fa3', fontSize: '13px', padding: '10px 14px', background: 'rgba(255,80,100,0.12)', borderRadius: '8px', border: '1px solid rgba(255,80,100,0.25)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '6px',
                padding: '14px',
                background: loading
                  ? 'rgba(255,255,255,0.08)'
                  : `linear-gradient(135deg, ${accentHsl}, ${glowHsl})`,
                border: 'none',
                borderRadius: '10px',
                color: loading ? 'rgba(255,255,255,0.4)' : '#0a0820',
                fontSize: '14px',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontFamily: 'inherit',
                boxShadow: loading ? 'none' : `0 4px 24px ${accentHsl}55`,
              }}
            >
              {loading && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spinRing 0.8s linear infinite',
                }} />
              )}
              {loading ? 'Entering the Weave…' : mode === 'login' ? 'Enter the Weave' : 'Begin your story'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already here? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              style={{ background: 'none', border: 'none', color: glowHsl, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', padding: 0, textDecoration: 'underline' }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
