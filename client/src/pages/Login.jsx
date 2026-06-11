import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── steps: 'email' → 'code' → done ──────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep]       = useState('email');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [digits, setDigits]   = useState(['', '', '', '', '', '']);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);

  // countdown for resend button
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // ── Step 1: send code ──────────────────────────────────────────────────────
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to send code.'); setLoading(false); return; }
      // dev mode: auto-fill code
      if (data.dev && data.code) {
        setDigits(data.code.split(''));
      }
      setStep('code');
      setResendTimer(60);
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  // ── Step 2: verify code ────────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e?.preventDefault();
    setError('');
    const code = digits.join('');
    if (code.length < 6) { setError('Please enter the full 6-digit code.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Verification failed.'); setLoading(false); return; }
      localStorage.setItem('weave_user', JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase() }));
      navigate('/');
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    setDigits(['', '', '', '', '', '']);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.dev && data.code) setDigits(data.code.split(''));
      setResendTimer(60);
    } catch { setError('Failed to resend.'); }
    setLoading(false);
  };

  // ── Digit input handlers ───────────────────────────────────────────────────
  const handleDigit = (i, val) => {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every(d => d !== '')) {
      // auto-submit when all 6 filled
      setTimeout(() => handleVerify(), 80);
    }
  };

  const handleDigitKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handleDigitPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
      setTimeout(() => handleVerify(), 80);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        .wv-input {
          width:100%; padding:14px 16px;
          background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.15);
          border-radius:12px; color:#fff; font-size:15px; outline:none;
          transition:all 0.2s; box-sizing:border-box; font-family:inherit;
        }
        .wv-input::placeholder { color:rgba(255,255,255,0.3); }
        .wv-input:focus { border-color:#a78bfa; background:rgba(167,139,250,0.1); box-shadow:0 0 0 4px rgba(167,139,250,0.15); }
        .wv-btn {
          width:100%; padding:15px; background:linear-gradient(135deg,#7c3aed,#a78bfa);
          border:none; border-radius:12px; color:#fff; font-size:15px; font-weight:700;
          cursor:pointer; transition:all 0.25s; font-family:inherit; letter-spacing:0.03em;
          box-shadow:0 4px 20px rgba(124,58,237,0.45); display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .wv-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 28px rgba(124,58,237,0.6); }
        .wv-btn:disabled { opacity:0.55; cursor:not-allowed; transform:none; }
        .digit-box {
          width:48px; height:60px; text-align:center; font-size:24px; font-weight:700;
          background:rgba(255,255,255,0.08); border:2px solid rgba(255,255,255,0.2);
          border-radius:12px; color:#fff; outline:none; transition:all 0.2s; font-family:inherit;
          caret-color: #a78bfa;
        }
        .digit-box:focus { border-color:#a78bfa; background:rgba(167,139,250,0.15); box-shadow:0 0 0 4px rgba(167,139,250,0.2); }
        .digit-box.filled { border-color:#a78bfa88; background:rgba(167,139,250,0.1); }
      `}</style>

      <div style={{ width:'100%', maxWidth:'420px', margin:'20px', animation:'fadeUp 0.6s ease both' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{
            width:'56px', height:'56px', borderRadius:'16px',
            background:'linear-gradient(135deg,#7c3aed,#a78bfa)',
            margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'26px', boxShadow:'0 8px 32px rgba(124,58,237,0.5)',
          }}>🕸</div>
          <h1 style={{ color:'#fff', fontSize:'24px', fontWeight:'700', margin:'0 0 6px', letterSpacing:'-0.5px' }}>
            {step === 'email' ? 'Join The Weave' : 'Check your email'}
          </h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'14px', margin:0 }}>
            {step === 'email'
              ? 'Enter your details to get started'
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background:'rgba(255,255,255,0.06)', backdropFilter:'blur(20px)',
          borderRadius:'20px', border:'1px solid rgba(255,255,255,0.12)',
          padding:'32px', boxShadow:'0 24px 64px rgba(0,0,0,0.4)',
        }}>

          {/* ── STEP 1: email form ── */}
          {step === 'email' && (
            <form onSubmit={handleSendCode} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div>
                <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:'13px', fontWeight:'500', marginBottom:'8px' }}>Your name</label>
                <input className="wv-input" type="text" placeholder="e.g. Mara Solenne" value={name} onChange={e => setName(e.target.value)} autoFocus />
              </div>
              <div>
                <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:'13px', fontWeight:'500', marginBottom:'8px' }}>Email address</label>
                <input className="wv-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </div>

              {error && <ErrorBox msg={error} />}

              <button type="submit" className="wv-btn" disabled={loading} style={{ marginTop:'4px' }}>
                {loading && <Spinner />}
                {loading ? 'Sending code…' : 'Send verification code →'}
              </button>
            </form>
          )}

          {/* ── STEP 2: 6-digit code ── */}
          {step === 'code' && (
            <form onSubmit={handleVerify} style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
              {/* digit boxes */}
              <div style={{ display:'flex', gap:'8px', justifyContent:'center', animation: error ? 'shake 0.4s ease' : 'none' }}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    className={`digit-box${d ? ' filled' : ''}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleDigitKey(i, e)}
                    onPaste={handleDigitPaste}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {error && <ErrorBox msg={error} />}

              <button type="submit" className="wv-btn" disabled={loading || digits.join('').length < 6}>
                {loading && <Spinner />}
                {loading ? 'Verifying…' : 'Verify & enter the Weave'}
              </button>

              {/* resend */}
              <p style={{ textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:'13px', margin:0 }}>
                Didn't receive it?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  style={{ background:'none', border:'none', color: resendTimer > 0 ? 'rgba(255,255,255,0.25)' : '#a78bfa', cursor: resendTimer > 0 ? 'default' : 'pointer', fontSize:'13px', fontFamily:'inherit', padding:0 }}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                </button>
              </p>

              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); setDigits(['','','','','','']); }}
                style={{ background:'none', border:'none', color:'rgba(255,255,255,0.35)', cursor:'pointer', fontSize:'13px', fontFamily:'inherit', textAlign:'center' }}
              >
                ← Change email
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign:'center', marginTop:'20px', color:'rgba(255,255,255,0.3)', fontSize:'12px' }}>
          By continuing you agree to our terms of service
        </p>
      </div>
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div style={{ padding:'12px 14px', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', color:'#fca5a5', fontSize:'13px' }}>
      {msg}
    </div>
  );
}

function Spinner() {
  return <div style={{ width:'16px', height:'16px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />;
}
