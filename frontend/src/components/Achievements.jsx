import React from 'react';
import { Award, Lock, Check } from 'lucide-react';
import { useHabits } from '../context/HabitContext';

export default function Achievements() {
  const { analytics } = useHabits();

  if (!analytics || !analytics.badges) return null;

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Award size={18} color="var(--accent-amber)" />
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700 }}>
          Accountability Milestones & Badges
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        {analytics.badges.map((badge) => (
          <div
            key={badge.id}
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: badge.earned ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.02)',
              border: badge.earned ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              opacity: badge.earned ? 1 : 0.45,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '1.6rem' }}>{badge.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: badge.earned ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {badge.title}
                </h4>
                {badge.earned && <Check size={12} color="var(--accent-amber)" />}
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {badge.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
