import React, { useState } from 'react';
import { Flame, Lock, Mail, User, LogIn, UserPlus, Sparkles, CheckCircle2, Shield, Activity, Brain, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitContext';

export default function AuthPage() {
  const { login, signup } = useAuth();
  const { refresh, setIsOnboardingOpen } = useHabits();

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(name, email, password);
        setIsOnboardingOpen(true);
      } else {
        await login(email, password);
      }
      await refresh();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('demo@habitpulse.io', 'password123');
      await refresh();
    } catch (err) {
      try {
        await signup('Demo Hackathon User', 'demo@habitpulse.io', 'password123');
        await refresh();
      } catch (e) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1040px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '32px',
        alignItems: 'center'
      }}>
        {/* Left Column: Hero Value Proposition */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', marginBottom: '16px' }}>
            <Sparkles size={14} color="var(--accent-purple)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
              AWS Hackathon Multi-User Platform
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '16px'
          }}>
            Master Daily Habits with <span style={{ color: 'var(--accent-flame)' }}>Micro-Goals</span> & AI
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
            Transform ambitious goals into 2-minute daily execution steps. Powered by Amazon DynamoDB, automated wearable sync webhooks, and real-time productivity scoring.
          </p>

          {/* Value Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', flexShrink: 0 }}>
                <Brain size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>AI Habit Coach & Onboarding</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Automated lifestyle profile assessment & 4-5 category habit generation.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', flexShrink: 0 }}>
                <Activity size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Wearable Auto-Sync Webhook</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Fitbit, Apple Health, & Google Fit auto check-in integrations.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', flexShrink: 0 }}>
                <Database size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Serverless AWS DynamoDB Architecture</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Strict user data isolation with instant streak calculation.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Glassmorphic Auth Card */}
        <div className="glass-panel" style={{
          padding: '36px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #FF5E36 0%, #FF2E54 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 6px 18px rgba(255, 94, 54, 0.4)'
            }}>
              <Flame size={26} color="#FFF" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800 }}>
              {isSignup ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {isSignup ? 'Start your habit journey with personalized AI micro-goals' : 'Sign in to access your protected habit dashboard & streaks'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => { setIsSignup(false); setError(''); }}
              style={{
                padding: '10px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: !isSignup ? 'var(--accent-purple)' : 'transparent',
                color: !isSignup ? 'white' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => { setIsSignup(true); setError(''); }}
              style={{
                padding: '10px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: isSignup ? 'var(--accent-purple)' : 'transparent',
                color: isSignup ? 'white' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              color: '#FCA5A5'
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="form-group">
                <label>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '40px' }}
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '12px', fontSize: '0.95rem' }}
            >
              {isSignup ? <UserPlus size={18} /> : <LogIn size={18} />}
              {loading ? 'Authenticating...' : isSignup ? 'Create Account & Start' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Quick Demo Access */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
              Exploring for hackathon review?
            </span>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="btn-ai"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.88rem' }}
            >
              <Sparkles size={16} /> Instant Demo Account Sign-In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
