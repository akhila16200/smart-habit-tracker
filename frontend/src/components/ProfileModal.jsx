import React, { useState, useEffect } from 'react';
import { X, User, Mail, Briefcase, Target, Settings, Save, ShieldCheck, Sparkles, Bell, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitContext';

export default function ProfileModal() {
  const { user, isProfileModalOpen, setIsProfileModalOpen, updateProfile } = useAuth();
  const { setToastMessage, generateAiHabits } = useHabits();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Working Professional');
  const [primaryGoal, setPrimaryGoal] = useState('Improve daily productivity & balance');
  const [dailyFocusMins, setDailyFocusMins] = useState(45);
  const [autoSyncWearables, setAutoSyncWearables] = useState(true);
  const [aiCoachReminders, setAiCoachReminders] = useState(true);
  const [autoRegenerateOnRoleChange, setAutoRegenerateOnRoleChange] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setRole(user.role || 'Working Professional');
      setPrimaryGoal(user.primaryGoal || 'Improve daily productivity & balance');
      if (user.preferences) {
        setDailyFocusMins(user.preferences.dailyFocusMins || 45);
        setAutoSyncWearables(user.preferences.autoSyncWearables !== false);
        setAiCoachReminders(user.preferences.aiCoachReminders !== false);
        if (user.preferences.autoRegenerateOnRoleChange !== undefined) {
          setAutoRegenerateOnRoleChange(user.preferences.autoRegenerateOnRoleChange);
        }
      }
    }
  }, [user, isProfileModalOpen]);

  if (!isProfileModalOpen) return null;

  const saveProfileAndHabits = async (shouldRegenerateHabits = false) => {
    try {
      setIsSaving(true);
      const updatedUser = await updateProfile({
        name,
        email,
        role,
        primaryGoal,
        preferences: {
          dailyFocusMins: parseInt(dailyFocusMins, 10),
          autoSyncWearables,
          aiCoachReminders,
          autoRegenerateOnRoleChange
        }
      });

      const roleChanged = user && user.role !== role;
      const mustRegenerate = shouldRegenerateHabits || (roleChanged && autoRegenerateOnRoleChange);

      if (mustRegenerate && generateAiHabits) {
        await generateAiHabits({
          role,
          primaryGoal
        });
      }

      if (setToastMessage) {
        setToastMessage({
          type: 'success',
          title: mustRegenerate ? '✨ Profile & AI Habit Suite Updated!' : '👤 Profile & Settings Updated!',
          message: mustRegenerate
            ? `Profile updated and AI Habits re-generated for your '${role}' routine.`
            : 'Your personal account details and preferences have been securely saved.'
        });
        setTimeout(() => setToastMessage(null), 5000);
      }
      setIsProfileModalOpen(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveProfileAndHabits(false);
  };

  const rolesList = [
    'Student',
    'Working Professional',
    'Homemaker',
    'Entrepreneur',
    'Fitness & Health Focus'
  ];

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '30px',
        position: 'relative',
        maxHeight: '92vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
            }}>
              <Settings size={22} color="#FFF" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800 }}>
                User Profile & Settings
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                View & modify your personal account information & preferences
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Personal Information */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Personal Details
            </h3>

            <div className="form-group">
              <label>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Lifestyle Role</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <select
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {rolesList.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Goals & Preferences */}
          <div style={{ marginBottom: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Accountability Goals
            </h3>

            <div className="form-group">
              <label>Primary Monthly Focus Goal</label>
              <div style={{ position: 'relative' }}>
                <Target size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  placeholder="e.g. Master algorithms & maintain 80% daily productivity"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Target Daily Study Sprint (Minutes)</label>
              <input
                type="number"
                className="form-control"
                min="15"
                max="300"
                value={dailyFocusMins}
                onChange={(e) => setDailyFocusMins(e.target.value)}
              />
            </div>
          </div>

          {/* Section 3: Preferences Toggles */}
          <div style={{ marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              System Preferences
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Activity size={16} color="#34D399" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Automated Wearable Webhook Sync</span>
                </div>
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={autoSyncWearables}
                  onChange={(e) => setAutoSyncWearables(e.target.checked)}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={16} color="var(--accent-purple)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Personalized AI Coach Advice</span>
                </div>
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={aiCoachReminders}
                  onChange={(e) => setAiCoachReminders(e.target.checked)}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.3)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Target size={16} color="var(--accent-cyan)" />
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>Auto-Adapt AI Habits on Role Change</span>
                    <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>Re-generate daily habit targets when switching lifestyle roles</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={autoRegenerateOnRoleChange}
                  onChange={(e) => setAutoRegenerateOnRoleChange(e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* Section 4: Metadata Footer */}
          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="var(--accent-purple)" />
              <span>User ID: <strong style={{ color: 'var(--text-secondary)' }}>{user ? user.id : 'USER#default'}</strong></span>
            </div>
            <span>Encrypted Profile Storage</span>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsProfileModalOpen(false)}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => saveProfileAndHabits(true)}
              className="btn-ai"
              disabled={isSaving}
              style={{ padding: '10px 16px', fontSize: '0.85rem' }}
              title="Save profile and immediately re-generate AI Habits for current role"
            >
              <Sparkles size={16} />
              {isSaving ? 'Adapting...' : 'Save & Adapt AI Habits'}
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving}
              style={{ padding: '10px 18px', fontSize: '0.85rem' }}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
