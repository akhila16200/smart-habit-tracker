import React from 'react';
import { Flame, CheckCircle2, Trophy, Target, TrendingUp } from 'lucide-react';
import { useHabits } from '../context/HabitContext';

export default function DashboardStats() {
  const { analytics, loading } = useHabits();

  if (loading || !analytics) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-panel" style={{ height: '110px', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    );
  }

  const { totalHabits, completedToday, maxStreak, totalCheckIns, completionRate } = analytics;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
      marginBottom: '28px'
    }}>
      {/* Stat 1: Today's Completion */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Today's Check-ins</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
              {completedToday} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {totalHabits}</span>
            </h3>
          </div>
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--accent-emerald)'
          }}>
            <CheckCircle2 size={22} />
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.08)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${completionRate}%`,
            height: '100%',
            background: 'var(--accent-emerald)',
            transition: 'width 0.4s ease'
          }} />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
          {completionRate}% of today's micro-goals done
        </p>
      </div>

      {/* Stat 2: Active Max Streak */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Top Active Streak</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginTop: '4px', color: 'var(--accent-flame)' }}>
              {maxStreak} <span style={{ fontSize: '1rem', fontWeight: 500 }}>Days</span>
            </h3>
          </div>
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(255, 94, 54, 0.15)',
            color: 'var(--accent-flame)'
          }}>
            <Flame size={22} />
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendingUp size={14} /> Peak momentum tracked
        </p>
      </div>

      {/* Stat 3: Total Lifetime Check-ins */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Check-ins</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
              {totalCheckIns}
            </h3>
          </div>
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(139, 92, 246, 0.15)',
            color: 'var(--accent-purple)'
          }}>
            <Trophy size={22} />
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Across all active micro-goals
        </p>
      </div>

      {/* Stat 4: Active Habits Count */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Habits</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
              {totalHabits}
            </h3>
          </div>
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.15)',
            color: 'var(--accent-cyan)'
          }}>
            <Target size={22} />
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Active micro-goals tracked
        </p>
      </div>
    </div>
  );
}
