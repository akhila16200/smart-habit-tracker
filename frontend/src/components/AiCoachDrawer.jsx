import React, { useState } from 'react';
import { X, Sparkles, Brain, Flame, Target, Zap, Lightbulb } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import { suggestMicroGoals } from '../services/api';

export default function AiCoachDrawer({ isOpen, onClose }) {
  const { habits, analytics } = useHabits();

  const [selectedHabitId, setSelectedHabitId] = useState('');
  const [generatedSuggestions, setGeneratedSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const maxStreak = analytics ? analytics.maxStreak : 0;
  const completedToday = analytics ? analytics.completedToday : 0;
  const totalHabits = analytics ? analytics.totalHabits : 0;

  const handleGenerateAIInsight = async (habit) => {
    try {
      setLoading(true);
      setSelectedHabitId(habit.id);
      const suggestions = await suggestMicroGoals(habit.title, habit.category);
      setGeneratedSuggestions({
        habitTitle: habit.title,
        suggestions
      });
    } catch (err) {
      console.error('AI Coach error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        height: '100vh',
        borderRadius: 0,
        padding: '24px',
        overflowY: 'auto',
        animation: 'slideInRight 0.3s ease-out',
        borderLeft: '1px solid rgba(139, 92, 246, 0.3)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
            }}>
              <Brain size={20} color="#FFF" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800 }}>
                AI Habit Coach
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                Powered by Amazon Bedrock Insights
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Daily Accountability Insight Card */}
        <div style={{
          padding: '18px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(255, 94, 54, 0.12) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={18} color="var(--accent-amber)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Today's Coaching Diagnosis
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {maxStreak >= 7
              ? `🔥 Phenomenal consistency! You are on a ${maxStreak}-day peak streak. Your neural habit loops are cementing. Keep execution steps under 3 minutes to avoid friction.`
              : maxStreak > 0
                ? `⚡ You have momentum! ${maxStreak} consecutive days logged. Today you've completed ${completedToday}/${totalHabits} habits. Finish remaining micro-goals before 9 PM!`
                : `🌱 Welcome to Day 1! Focus exclusively on completing the first micro-goal of each habit. Small wins generate massive momentum.`}
          </p>
        </div>

        {/* Actionable Micro-Goal Re-Breakdown Tool */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lightbulb size={16} color="var(--accent-purple)" />
            AI Habit Optimization Generator
          </h3>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Select any habit to generate optimized 2-minute micro-goals:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {habits.map(h => (
              <button
                key={h.id}
                onClick={() => handleGenerateAIInsight(h)}
                className="glass-panel"
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: selectedHabitId === h.id ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)',
                  background: selectedHabitId === h.id ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>{h.title}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{h.category}</span>
                </div>
                <Zap size={14} color="var(--accent-purple)" />
              </button>
            ))}
          </div>
        </div>

        {/* Generated AI Micro-Goals Display */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--accent-purple)', fontSize: '0.85rem' }}>
            ✨ Consulting AI Coach & Analyzing Micro-Goals...
          </div>
        )}

        {generatedSuggestions && !loading && (
          <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.08)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '10px' }}>
              Suggested Micro-Goals for '{generatedSuggestions.habitTitle}'
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {generatedSuggestions.suggestions.map((s, idx) => (
                <div key={idx} style={{ fontSize: '0.8rem', padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>• {s.text}</span>
                  <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>+{s.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
