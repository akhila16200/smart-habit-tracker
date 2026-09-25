import React, { useState } from 'react';
import { X, Sparkles, UserCheck, Briefcase, GraduationCap, Home, Zap, ArrowRight, CheckCircle2, Shield, HeartPulse } from 'lucide-react';
import { useHabits } from '../context/HabitContext';

export default function OnboardingModal() {
  const { isOnboardingOpen, setIsOnboardingOpen, generateAiHabits } = useHabits();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState('Working Professional');
  const [primaryGoal, setPrimaryGoal] = useState('Improve daily productivity & balance');
  const [focusAreas, setFocusAreas] = useState(['Fitness', 'Learning', 'Mindfulness', 'Personal']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHabits, setGeneratedHabits] = useState([]);

  if (!isOnboardingOpen) return null;

  const roles = [
    { id: 'Student', label: 'Student / Scholar', icon: <GraduationCap size={24} color="#8B5CF6" />, desc: 'Exam prep, deep study sprints, academic focus' },
    { id: 'Working Professional', label: 'Working Professional', icon: <Briefcase size={24} color="#3B82F6" />, desc: 'Career expansion, work-life boundaries, desk health' },
    { id: 'Homemaker', label: 'Homemaker / Caregiver', icon: <Home size={24} color="#EC4899" />, desc: 'Daily wellness routines, personal time, mental clarity' },
    { id: 'Entrepreneur', label: 'Entrepreneur / Freelancer', icon: <Zap size={24} color="#F59E0B" />, desc: 'High-leverage routines, strategic deep work, endurance' },
    { id: 'Fitness Enthusiast', label: 'Fitness & Health Focus', icon: <HeartPulse size={24} color="#10B981" />, desc: 'Peak physical performance, hydration, recovery' },
  ];

  const goalsList = [
    'Improve daily productivity & balance',
    'Build unstoppable morning & evening routines',
    'Master new skills & study consistently',
    'Lower stress & practice mindfulness',
    'Maintain physical energy & step goals'
  ];

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setStep(3);
      const habits = await generateAiHabits({
        role,
        primaryGoal,
        focusAreas
      });
      setGeneratedHabits(habits);
    } catch (err) {
      console.error('AI Onboarding Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    setIsOnboardingOpen(false);
    setStep(1);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '580px',
        padding: '32px',
        position: 'relative',
        maxHeight: '92vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #FF5E36 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
            }}>
              <Sparkles size={22} color="#FFF" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800 }}>
                Smart AI Onboarding
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Step {step} of 3 • Customizing Your Daily Micro-Goal System
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOnboardingOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: i <= step ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.1)',
                transition: 'background 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* STEP 1: Select Lifestyle Role */}
        {step === 1 && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
              What best describes your current daily lifestyle?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Our AI Habit Coach will structure micro-goals adapted specifically to your schedule & friction points.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {roles.map(r => (
                <div
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: role === r.id ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: role === r.id ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ flexShrink: 0 }}>{r.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: role === r.id ? 'white' : 'var(--text-primary)' }}>
                      {r.label}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {r.desc}
                    </p>
                  </div>
                  {role === r.id && <CheckCircle2 size={20} color="var(--accent-purple)" />}
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              Next: Select Goals <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: Select Personal Goals */}
        {step === 2 && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
              What is your primary focus for this month?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Select a primary objective to guide your AI-generated habit recommendations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {goalsList.map(g => (
                <div
                  key={g}
                  onClick={() => setPrimaryGoal(g)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: primaryGoal === g ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: primaryGoal === g ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: primaryGoal === g ? 700 : 500,
                    color: primaryGoal === g ? 'white' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{g}</span>
                  {primaryGoal === g && <CheckCircle2 size={18} color="var(--accent-purple)" />}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(1)}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Back
              </button>
              <button
                onClick={handleGenerate}
                className="btn-ai"
                style={{ flex: 2, justifyContent: 'center', padding: '12px' }}
              >
                <Sparkles size={18} /> Generate AI Habit Suite
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: AI Generation & Preview */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            {isGenerating ? (
              <div style={{ padding: '40px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>⚡</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                  AI Coach is Synthesizing Your Habits...
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                  Tailoring 4-5 micro-goal habits for a <strong style={{ color: 'var(--accent-purple)' }}>{role}</strong> aiming to <strong style={{ color: '#34D399' }}>{primaryGoal}</strong>.
                </p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎯</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>
                  Your Custom Habit Suite is Ready!
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  The AI Coach created 4 tailored daily habits across Fitness, Learning, Mindfulness, & Personal categories:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', marginBottom: '24px' }}>
                  {generatedHabits.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <span className={`badge badge-${(h.category || 'personal').toLowerCase()}`} style={{ fontSize: '0.7rem', marginBottom: '4px' }}>
                          {h.category}
                        </span>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{h.title}</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{h.description}</p>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                        {h.microGoals ? h.microGoals.length : 3} micro-goals
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleComplete}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
                >
                  🚀 Go to Dashboard & Start Streaks
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
