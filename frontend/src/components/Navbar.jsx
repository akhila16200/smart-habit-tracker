import React from 'react';
import { Flame, Plus, Database, Activity, Brain, Moon, Sun, User, LogOut, LogIn, Settings } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenWearables, onOpenAiCoach, theme, toggleTheme }) {
  const { setIsModalOpen } = useHabits();
  const { user, setIsAuthModalOpen, setIsProfileModalOpen, logout } = useAuth();


  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'background 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #FF5E36 0%, #FF2E54 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(255, 94, 54, 0.4)'
          }}>
            <Flame size={24} color="#FFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.4rem',
                fontWeight: 800,
                letterSpacing: '-0.5px'
              }}>
                Habit<span style={{ color: 'var(--accent-flame)' }}>Pulse</span>
              </h1>
              <span style={{
                fontSize: '0.7rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--accent-purple)',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600
              }}>
                <Database size={10} /> AWS DynamoDB
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Micro-Goal Accountability System
            </p>
          </div>
        </div>

        {/* Right CTA Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ padding: '8px', borderRadius: '50%' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={16} color="#FBBF24" /> : <Moon size={16} color="#8B5CF6" />}
          </button>

          {user ? (
            <>
              {/* Wearables Modal Trigger */}
              <button
                onClick={onOpenWearables}
                className="btn-secondary"
                title="Manage Wearable Integrations (Fitbit, Apple Health, Google Fit)"
                style={{
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#34D399',
                  padding: '8px 14px',
                  fontSize: '0.85rem'
                }}
              >
                <Activity size={16} /> Connect Wearable
              </button>

              {/* AI Coach Drawer Trigger */}
              <button
                onClick={onOpenAiCoach}
                className="btn-ai"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <Brain size={16} /> AI Coach
              </button>

              {/* New Habit Modal Trigger */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> New Habit
              </button>

              {/* User Info & Profile/Settings Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    padding: '2px 4px'
                  }}
                  title="Open Profile & Settings"
                >
                  <User size={14} color="var(--accent-purple)" />
                  <span>{user.name || user.email}</span>
                  {user.role && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-purple)', background: 'rgba(139, 92, 246, 0.15)', padding: '1px 6px', borderRadius: '8px' }}>
                      {user.role}
                    </span>
                  )}
                  <Settings size={13} color="var(--text-muted)" style={{ marginLeft: '2px' }} />
                </button>

                <button
                  onClick={logout}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#FCA5A5',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '14px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    marginLeft: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  title="Logout & redirect to Sign In"
                >
                  <LogOut size={12} /> Logout
                </button>
              </div>

            </>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              <LogIn size={16} /> Sign In / Sign Up
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
