import React from 'react';
import { Award, CheckCircle2, TrendingUp, Sparkles, Dumbbell, Heart, BookOpen, UserCheck, ShieldCheck } from 'lucide-react';
import { useHabits } from '../context/HabitContext';

export default function ProductivityScoreboard() {
  const { habits, analytics, checkIn } = useHabits();

  const targetCategories = ['Fitness', 'Mindfulness', 'Learning', 'Personal'];
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter active target habits
  const targetHabits = habits.filter(h =>
    targetCategories.map(c => c.toLowerCase()).includes((h.category || '').toLowerCase())
  );

  let score = 0;
  let status = { label: 'Poor', icon: '🛑', color: '#EF4444' };
  let categoryStats = {
    Fitness: { total: 0, completed: 0, rate: 0, color: '#10B981' },
    Mindfulness: { total: 0, completed: 0, rate: 0, color: '#06B6D4' },
    Learning: { total: 0, completed: 0, rate: 0, color: '#F59E0B' },
    Personal: { total: 0, completed: 0, rate: 0, color: '#EC4899' },
  };
  let completedTargetHabits = 0;
  let totalTargetHabits = targetHabits.length;

  if (analytics && analytics.productivityScoreboard) {
    score = analytics.productivityScoreboard.score;
    status = analytics.productivityScoreboard.status;
    categoryStats = analytics.productivityScoreboard.categoryStats || categoryStats;
    completedTargetHabits = analytics.productivityScoreboard.completedTargetHabits || 0;
    totalTargetHabits = analytics.productivityScoreboard.totalTargetHabits || totalTargetHabits;
  } else {
    // Client-side fallback calculation
    targetCategories.forEach(catName => {
      const catHabits = habits.filter(h => (h.category || '').toLowerCase() === catName.toLowerCase());
      const comp = catHabits.filter(h => (h.checkInHistory || []).some(e => e.date === todayStr)).length;
      categoryStats[catName] = {
        total: catHabits.length,
        completed: comp,
        rate: catHabits.length > 0 ? Math.round((comp / catHabits.length) * 100) : 0,
        color: catName === 'Fitness' ? '#10B981' : catName === 'Mindfulness' ? '#06B6D4' : catName === 'Learning' ? '#F59E0B' : '#EC4899'
      };
      completedTargetHabits += comp;
    });

    score = totalTargetHabits > 0 ? Math.round((completedTargetHabits / totalTargetHabits) * 100) : 0;
    if (score === 100) status = { label: 'Excellent', icon: '🌟', color: '#10B981' };
    else if (score >= 70) status = { label: 'Good', icon: '👍', color: '#3B82F6' };
    else if (score >= 40) status = { label: 'Low', icon: '⚠️', color: '#F59E0B' };
    else status = { label: 'Poor', icon: '🛑', color: '#EF4444' };
  }

  const categoryIcons = {
    Fitness: <Dumbbell size={18} color="#10B981" />,
    Mindfulness: <Heart size={18} color="#06B6D4" />,
    Learning: <BookOpen size={18} color="#F59E0B" />,
    Personal: <UserCheck size={18} color="#EC4899" />
  };

  const statusDescriptions = {
    Excellent: '🌟 Flawless Execution! All active habits across Fitness, Mindfulness, Learning, and Personal are checked off today.',
    Good: '👍 High Performance Day! You have completed the majority of your daily accountability micro-goals.',
    Low: '⚠️ Moderate Progress. Complete 1 or 2 more micro-goals to boost your score above 70%.',
    Poor: '🛑 Critical Focus Alert. High friction detected today. Initiate a 2-minute micro-goal now to recover momentum!'
  };

  // Calculate 7-Day Historical Trend across the 4 target categories
  const last7DaysTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

    if (targetHabits.length === 0) {
      return { dateStr, dayLabel, score: 0, completed: 0, total: 0 };
    }

    const completed = targetHabits.filter(h =>
      (h.checkInHistory || []).some(entry => entry.date === dateStr)
    ).length;

    const dayScore = Math.round((completed / targetHabits.length) * 100);
    return { dateStr, dayLabel, score: dayScore, completed, total: targetHabits.length };
  });

  return (
    <div className="glass-panel" style={{ padding: '28px', marginBottom: '28px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--accent-purple)" />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800 }}>
              Daily Productivity Scoreboard
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Aggregate execution score calculated across Fitness, Mindfulness, Learning, & Personal goals
          </p>
        </div>

        {/* Dynamic Status Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          borderRadius: '24px',
          background: status.color + '20',
          border: `1px solid ${status.color}50`,
          color: status.color,
          fontWeight: 800,
          fontSize: '1rem',
          boxShadow: `0 4px 14px ${status.color}30`
        }}>
          <span style={{ fontSize: '1.2rem' }}>{status.icon}</span>
          <span>{status.label} ({score}%)</span>
        </div>
      </div>

      {/* Main Score Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* Score Ring / Gauge Display */}
        <div style={{
          padding: '24px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Overall Daily Completion Score
          </span>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '3.6rem',
            fontWeight: 800,
            color: status.color,
            margin: '8px 0',
            lineHeight: 1
          }}>
            {score}%
          </h1>

          {/* Progress Ring / Gauge Bar */}
          <div style={{ width: '100%', maxWidth: '240px', background: 'rgba(255, 255, 255, 0.08)', height: '10px', borderRadius: '5px', overflow: 'hidden', margin: '8px 0' }}>
            <div style={{
              width: `${score}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${status.color}80 0%, ${status.color} 100%)`,
              transition: 'width 0.5s ease-out'
            }} />
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {completedTargetHabits} of {totalTargetHabits} category habits completed today
          </p>
        </div>

        {/* Status Guidance Box */}
        <div style={{
          padding: '24px',
          borderRadius: 'var(--radius-md)',
          background: `${status.color}10`,
          border: `1px solid ${status.color}30`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Award size={20} color={status.color} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: status.color }}>
              Performance Status: {status.label} {status.icon}
            </h4>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5, flex: 1 }}>
            {statusDescriptions[status.label] || statusDescriptions.Good}
          </p>
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: `1px solid ${status.color}25`, fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color={status.color} /> Real-time scoring synced with Cloud Engine
          </div>
        </div>
      </div>

      {/* 4-Category Performance Breakdown Grid */}
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
        4-Category Performance Breakdown
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {Object.keys(categoryStats).map((catName) => {
          const stat = categoryStats[catName];
          return (
            <div
              key={catName}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {categoryIcons[catName]}
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{catName}</span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: stat.color }}>
                  {stat.completed}/{stat.total}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.08)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${stat.rate}%`,
                  height: '100%',
                  background: stat.color,
                  transition: 'width 0.4s ease'
                }} />
              </div>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {stat.rate}% completion today
              </span>
            </div>
          );
        })}
      </div>

      {/* Historical 7-Day Trend Chart */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <TrendingUp size={18} color="var(--accent-purple)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700 }}>
            7-Day Historical Productivity Trend
          </h3>
        </div>

        <div style={{
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '12px',
          minHeight: '160px'
        }}>
          {last7DaysTrend.map((item, idx) => {
            let barColor = '#EF4444';
            if (item.score === 100) barColor = '#10B981';
            else if (item.score >= 70) barColor = '#3B82F6';
            else if (item.score >= 40) barColor = '#F59E0B';

            return (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {item.score}%
                </span>
                <div style={{
                  width: '100%',
                  maxWidth: '36px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '100%',
                    height: `${Math.max(item.score, 6)}%`,
                    background: `linear-gradient(to top, ${barColor}90, ${barColor})`,
                    borderRadius: '4px',
                    transition: 'height 0.5s ease-out'
                  }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {item.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Habit Execution Checklist */}
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>
        Today's Category Habit Execution Log
      </h3>

      {targetHabits.length === 0 ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          No active habits in Fitness, Mindfulness, Learning, or Personal categories yet. Create some habits to start calculating your score!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {targetHabits.map(h => {
            const isChecked = (h.checkInHistory || []).some(entry => entry.date === todayStr);
            return (
              <div
                key={h.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: isChecked ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  border: isChecked ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`badge badge-${(h.category || 'personal').toLowerCase()}`}>
                    {h.category}
                  </span>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textDecoration: isChecked ? 'line-through' : 'none', color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {h.title}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => checkIn(h.id)}
                  className="btn-secondary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    background: isChecked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: isChecked ? '#34D399' : 'var(--text-primary)',
                    border: isChecked ? 'none' : '1px solid var(--border-color)'
                  }}
                >
                  {isChecked ? '✓ Completed' : 'Check In'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
