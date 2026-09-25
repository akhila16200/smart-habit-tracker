import React, { useState } from 'react';
import { Flame, Check, Trash2, Edit3, ChevronDown, ChevronUp, Sparkles, Calendar, CheckSquare } from 'lucide-react';
import { useHabits } from '../context/HabitContext';

export default function HabitCard({ habit }) {
  const { checkIn, toggleMicroGoal, deleteHabit, openEditModal } = useHabits();
  const [showMicroGoals, setShowMicroGoals] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const isCheckedInToday = (habit.checkInHistory || []).some(entry => entry.date === todayStr);

  const categoryLower = (habit.category || 'personal').toLowerCase();

  // Calculate micro-goals completion
  const microGoals = habit.microGoals || [];
  const completedMicroGoalsCount = microGoals.filter(m => m.completed).length;
  const microGoalsProgress = microGoals.length > 0
    ? Math.round((completedMicroGoalsCount / microGoals.length) * 100)
    : 0;

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete '${habit.title}'?`)) {
      setIsDeleting(true);
      await deleteHabit(habit.id);
    }
  };

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      opacity: isDeleting ? 0.4 : 1,
      transition: 'all 0.3s ease'
    }}>
      {/* Top Bar: Category & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge badge-${categoryLower}`}>
            {habit.category || 'Personal'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} /> {habit.frequency || 'Daily'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Streak Badge */}
          <div className={`streak-badge ${habit.currentStreak > 0 ? 'fire-active' : ''}`}>
            <Flame size={16} fill={habit.currentStreak > 0 ? "#FF5E36" : "none"} color="#FF5E36" />
            <span>{habit.currentStreak || 0} Day Streak</span>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => openEditModal(habit)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              transition: 'color 0.2s ease'
            }}
            title="Edit habit targets & micro-goals"
            onMouseEnter={(e) => e.target.style.color = 'var(--accent-purple)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
          >
            <Edit3 size={16} />
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              transition: 'color 0.2s ease'
            }}
            title="Delete habit"
            onMouseEnter={(e) => e.target.style.color = '#EF4444'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Info */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.25rem',
          fontWeight: 700,
          marginBottom: '6px'
        }}>
          {habit.title}
        </h3>
        {habit.description && (
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {habit.description}
          </p>
        )}
      </div>

      {/* Check-In Big Action Row */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        border: '1px solid rgba(255, 255, 255, 0.04)'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily Check-In Status</span>
          <p style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: isCheckedInToday ? 'var(--accent-emerald)' : 'var(--text-secondary)'
          }}>
            {isCheckedInToday ? '✓ Completed for Today!' : 'Pending Check-In'}
          </p>
        </div>

        <button
          onClick={() => checkIn(habit.id)}
          style={{
            background: isCheckedInToday
              ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
              : 'rgba(255, 255, 255, 0.08)',
            color: isCheckedInToday ? 'white' : 'var(--text-primary)',
            border: isCheckedInToday ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
            padding: '8px 18px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: isCheckedInToday ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
            transition: 'all 0.25s ease'
          }}
        >
          <Check size={18} />
          {isCheckedInToday ? 'Done Today' : 'Check In'}
        </button>
      </div>

      {/* Micro-Goals Section Toggle */}
      {microGoals.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div
            onClick={() => setShowMicroGoals(!showMicroGoals)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              padding: '6px 0',
              borderTop: '1px solid var(--border-color)',
              marginBottom: showMicroGoals ? '12px' : '0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={14} color="var(--accent-purple)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Micro-Goals Breakdown ({completedMicroGoalsCount}/{microGoals.length})
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '60px', background: 'rgba(255, 255, 255, 0.1)', height: '4px', borderRadius: '2px' }}>
                <div style={{ width: `${microGoalsProgress}%`, height: '100%', background: 'var(--accent-purple)', borderRadius: '2px' }} />
              </div>
              {showMicroGoals ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
            </div>
          </div>

          {showMicroGoals && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {microGoals.map((mg) => (
                <label
                  key={mg.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: mg.completed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={!!mg.completed}
                      onChange={() => toggleMicroGoal(habit.id, mg.id)}
                    />
                    <span style={{
                      fontSize: '0.85rem',
                      textDecoration: mg.completed ? 'line-through' : 'none',
                      color: mg.completed ? 'var(--text-muted)' : 'var(--text-primary)'
                    }}>
                      {mg.text}
                    </span>
                  </div>
                  {mg.points && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
                      +{mg.points} pts
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Motivational Tip Footer */}
      {habit.tip && (
        <div style={{
          marginTop: '16px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <Sparkles size={14} color="var(--accent-purple)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <p style={{ fontSize: '0.78rem', color: '#C4B5FD', lineHeight: 1.35 }}>
            {habit.tip}
          </p>
        </div>
      )}
    </div>
  );
}
