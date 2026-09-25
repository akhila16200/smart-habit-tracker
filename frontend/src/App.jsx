import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardStats from './components/DashboardStats';
import HabitCard from './components/HabitCard';
import HabitModal from './components/HabitModal';
import AuthModal from './components/AuthModal';
import WearableModal from './components/WearableModal';
import AiCoachDrawer from './components/AiCoachDrawer';
import StreakHeatmap from './components/StreakHeatmap';
import Achievements from './components/Achievements';
import FocusTimer from './components/FocusTimer';
import ProductivityScoreboard from './components/ProductivityScoreboard';
import OnboardingModal from './components/OnboardingModal';
import AuthPage from './components/AuthPage';
import ProfileModal from './components/ProfileModal';
import { useHabits } from './context/HabitContext';
import { useAuth } from './context/AuthContext';
import { Search, PlusCircle, AlertTriangle, Sparkles, Activity, Brain } from 'lucide-react';

export default function App() {
  const { habits, loading, error, openCreateModal, setIsOnboardingOpen, toastMessage, setToastMessage } = useHabits();
  const { user, authLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [theme, setTheme] = useState('dark');
  const [isWearablesOpen, setIsWearablesOpen] = useState(false);
  const [isAiCoachOpen, setIsAiCoachOpen] = useState(false);

  // Synchronize document theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Dynamically extract categories from active habits + default categories
  const defaultCategories = ['All', 'Productivity', 'Fitness', 'Mindfulness', 'Learning', 'Personal'];
  const habitCategories = habits.map(h => h.category).filter(Boolean);
  const categories = Array.from(new Set([...defaultCategories, ...habitCategories]));

  const filteredHabits = habits.filter(habit => {
    const matchesSearch = habit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (habit.description && habit.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || habit.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px', animation: 'pulse 1.5s infinite' }}>🔥</div>
          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading HabitPulse...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar
          onOpenWearables={() => setIsWearablesOpen(true)}
          onOpenAiCoach={() => setIsAiCoachOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '28px 24px' }}>
          <AuthPage />
        </main>
        <AuthModal />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onOpenWearables={() => setIsWearablesOpen(true)}
        onOpenAiCoach={() => setIsAiCoachOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '28px 24px' }}>
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div style={{
            background: toastMessage.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            border: `1px solid ${toastMessage.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div>
              <h4 style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: toastMessage.type === 'error' ? '#FCA5A5' : '#6EE7B7',
                marginBottom: '4px'
              }}>
                {toastMessage.title}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {toastMessage.message}
              </p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 700,
                padding: '2px 8px'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#FCA5A5'
          }}>
            <AlertTriangle size={20} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* Hero & Hackathon Banner */}
        <div className="glass-panel" style={{
          padding: '24px 28px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(255, 94, 54, 0.1) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--accent-flame)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={14} /> AWS Hackathon Architecture Scaffolding
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>
              Micro-Goal Habits with AWS DynamoDB & AI Wearables
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '650px' }}>
              Logged in as <strong style={{ color: 'var(--accent-purple)' }}>{user ? user.email : 'Demo User'}</strong>. Deconstruct ambitious goals into daily micro-tasks, sync wearables, and track consistency heatmaps.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn-ai"
              onClick={() => setIsOnboardingOpen(true)}
              style={{ padding: '10px 16px', fontSize: '0.88rem' }}
            >
              <Sparkles size={16} /> AI Onboarding
            </button>
            <button
              className="btn-secondary"
              onClick={() => setIsWearablesOpen(true)}
              style={{ padding: '10px 16px', fontSize: '0.88rem', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}
            >
              <Activity size={16} /> Wearables
            </button>
            <button
              className="btn-ai"
              onClick={() => setIsAiCoachOpen(true)}
              style={{ padding: '10px 16px', fontSize: '0.88rem' }}
            >
              <Brain size={16} /> AI Coach
            </button>
            <button
              className="btn-primary"
              onClick={openCreateModal}
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              <PlusCircle size={18} /> New Habit
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Focus Session & Auto-Study Tracker */}
        <FocusTimer />

        {/* Heatmap & Achievements Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          <StreakHeatmap />
          <Achievements />
        </div>

        {/* Search & Category Filter Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                  border: selectedCategory === cat ? 'none' : '1px solid var(--border-color)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {cat === 'Productivity' ? '⚡ Productivity Scoreboard' : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content Body: Either Productivity Scoreboard or Habits List Grid */}
        {selectedCategory === 'Productivity' ? (
          <ProductivityScoreboard />
        ) : loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-panel" style={{ height: '260px', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : filteredHabits.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredHabits.map(habit => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', margin: '20px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌱</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700 }}>No Habits Found</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '16px' }}>
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search query or category filters.'
                : 'Get started by creating your first accountability habit!'}
            </p>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <PlusCircle size={18} /> Add Your First Habit
            </button>
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <HabitModal />
      <AuthModal />
      <OnboardingModal />
      <ProfileModal />
      <WearableModal isOpen={isWearablesOpen} onClose={() => setIsWearablesOpen(false)} />
      <AiCoachDrawer isOpen={isAiCoachOpen} onClose={() => setIsAiCoachOpen(false)} />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '20px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        marginTop: '40px'
      }}>
        Smart Habit & Micro-Goal Accountability Tracker • Built for AWS Hackathon with Node.js, Express, DynamoDB, & React
      </footer>
    </div>
  );
}
