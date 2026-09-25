import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, Award, CheckCircle2, Sparkles, BookOpen, ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink, Plus, Check, X, Shield, Code, Terminal, FileCode, Layers, UserCheck } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

const ROLE_PLATFORMS = {
  Student: [
    { id: 'leetcode', name: 'LeetCode', icon: '🟠', domain: 'leetcode.com', defaultUrl: 'leetcode.com/problems', category: 'Learning' },
    { id: 'hackerrank', name: 'HackerRank', icon: '🟢', domain: 'hackerrank.com', defaultUrl: 'hackerrank.com/challenges', category: 'Learning' },
    { id: 'geeksforgeeks', name: 'GeeksforGeeks', icon: '🌿', domain: 'geeksforgeeks.org', defaultUrl: 'geeksforgeeks.org/dsa', category: 'Learning' },
    { id: 'courses', name: 'Online Courses', icon: '🎓', domain: 'coursera.org', defaultUrl: 'coursera.org/learn', category: 'Learning' },
    { id: 'docs', name: 'Documentation', icon: '📚', domain: 'developer.mozilla.org', defaultUrl: 'developer.mozilla.org/docs', category: 'Learning' },
    { id: 'github', name: 'GitHub', icon: '🐙', domain: 'github.com', defaultUrl: 'github.com/my-project', category: 'Learning' }
  ],
  'Working Professional': [
    { id: 'vscode', name: 'VS Code Web', icon: '💻', domain: 'vscode.dev', defaultUrl: 'vscode.dev', category: 'Productivity' },
    { id: 'github', name: 'GitHub Workspace', icon: '🐙', domain: 'github.com', defaultUrl: 'github.com/org/repo', category: 'Productivity' },
    { id: 'cloud', name: 'AWS Cloud Console', icon: '☁️', domain: 'aws.amazon.com', defaultUrl: 'console.aws.amazon.com', category: 'Productivity' },
    { id: 'docs', name: 'Tech Documentation', icon: '📚', domain: 'developer.mozilla.org', defaultUrl: 'developer.mozilla.org/docs', category: 'Learning' },
    { id: 'notion', name: 'Notion / Confluence', icon: '📝', domain: 'notion.so', defaultUrl: 'notion.so/workspace', category: 'Productivity' },
    { id: 'leetcode', name: 'LeetCode Practice', icon: '🟠', domain: 'leetcode.com', defaultUrl: 'leetcode.com/problems', category: 'Learning' }
  ],
  Homemaker: [
    { id: 'wellness', name: 'Wellness & Hydration', icon: '🌿', domain: 'calm.com', defaultUrl: 'calm.com/meditate', category: 'Mindfulness' },
    { id: 'mindfulness', name: 'Mindfulness App', icon: '🧘', domain: 'headspace.com', defaultUrl: 'headspace.com/meditation', category: 'Mindfulness' },
    { id: 'journaling', name: 'Personal Journaling', icon: '📓', domain: 'notion.so', defaultUrl: 'notion.so/journal', category: 'Personal' },
    { id: 'audiobooks', name: 'Audiobook & Growth', icon: '🎧', domain: 'audible.com', defaultUrl: 'audible.com/library', category: 'Learning' },
    { id: 'fitness', name: 'Daily Home Workout', icon: '🏋️', domain: 'youtube.com', defaultUrl: 'youtube.com/workout', category: 'Fitness' }
  ],
  'Fitness Enthusiast': [
    { id: 'fitness', name: 'Workout & Cardio Tracker', icon: '🏋️', domain: 'fitbit.com', defaultUrl: 'fitbit.com/dashboard', category: 'Fitness' },
    { id: 'stretching', name: 'Mobility & Stretching', icon: '🏃', domain: 'strava.com', defaultUrl: 'strava.com/dashboard', category: 'Fitness' },
    { id: 'nutrition', name: 'Nutrition & Meal Prep', icon: '🥗', domain: 'myfitnesspal.com', defaultUrl: 'myfitnesspal.com/log', category: 'Personal' },
    { id: 'mindfulness', name: 'Mindful Recovery', icon: '🧘', domain: 'headspace.com', defaultUrl: 'headspace.com/meditation', category: 'Mindfulness' },
    { id: 'learning', name: 'Sports Science & Articles', icon: '📚', domain: 'pubmed.ncbi.nlm.nih.gov', defaultUrl: 'pubmed.ncbi.nlm.nih.gov', category: 'Learning' }
  ],
  Entrepreneur: [
    { id: 'cloud', name: 'AWS Cloud Console', icon: '☁️', domain: 'aws.amazon.com', defaultUrl: 'console.aws.amazon.com', category: 'Productivity' },
    { id: 'github', name: 'GitHub Codebase', icon: '🐙', domain: 'github.com', defaultUrl: 'github.com/my-startup', category: 'Productivity' },
    { id: 'notion', name: 'Notion Strategy HQ', icon: '🚀', domain: 'notion.so', defaultUrl: 'notion.so/strategy', category: 'Productivity' },
    { id: 'vscode', name: 'VS Code Web', icon: '💻', domain: 'vscode.dev', defaultUrl: 'vscode.dev', category: 'Productivity' },
    { id: 'learning', name: 'Market Research & News', icon: '📊', domain: 'news.ycombinator.com', defaultUrl: 'news.ycombinator.com', category: 'Learning' }
  ]
};

function getRolePlatforms(roleStr) {
  if (!roleStr) return ROLE_PLATFORMS['Working Professional'];
  const lower = roleStr.toLowerCase();
  if (lower.includes('student') || lower.includes('scholar')) return ROLE_PLATFORMS.Student;
  if (lower.includes('homemaker') || lower.includes('caregiver')) return ROLE_PLATFORMS.Homemaker;
  if (lower.includes('fitness') || lower.includes('health')) return ROLE_PLATFORMS['Fitness Enthusiast'];
  if (lower.includes('entrepreneur') || lower.includes('freelancer')) return ROLE_PLATFORMS.Entrepreneur;
  return ROLE_PLATFORMS['Working Professional'];
}

function isLearningDomain(urlOrDomain, whitelist) {
  if (!urlOrDomain) return false;
  const clean = urlOrDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
  return whitelist.some(domain => clean.includes(domain.toLowerCase()));
}

export default function FocusTimer() {
  const { habits, checkIn, setToastMessage } = useHabits();
  const { user } = useAuth();

  const userRole = user?.role || 'Working Professional';
  const availablePlatforms = getRolePlatforms(userRole);

  const presets = [
    { label: '25m Pomodoro', minutes: 25 },
    { label: '45m Deep Sprint', minutes: 45 },
    { label: '50m Code & Study', minutes: 50 },
  ];

  const [selectedPlatformId, setSelectedPlatformId] = useState(availablePlatforms[0].id);
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState('');
  const [completedQuote, setCompletedQuote] = useState(null);

  // Active Learning Domain Guard States
  const [hasDomainGuardPermission, setHasDomainGuardPermission] = useState(false);
  const [isGuardEnabled, setIsGuardEnabled] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [activeDomainUrl, setActiveDomainUrl] = useState(availablePlatforms[0].defaultUrl);
  const [domainWarning, setDomainWarning] = useState(null);

  // Build dynamic whitelist based on active role platforms
  const whitelistedDomains = Array.from(new Set([
    ...availablePlatforms.map(p => p.domain),
    'leetcode.com', 'github.com', 'vscode.dev', 'developer.mozilla.org', 'aws.amazon.com', 'coursera.org', 'notion.so', 'calm.com', 'headspace.com'
  ]));

  const selectedPlatform = availablePlatforms.find(p => p.id === selectedPlatformId) || availablePlatforms[0];

  // Dynamic habit filtering matching target category of selected platform
  const targetCategoryHabits = habits.filter(h =>
    (h.category || '').toLowerCase() === (selectedPlatform.category || 'learning').toLowerCase()
  );
  const habitOptions = targetCategoryHabits.length > 0 ? targetCategoryHabits : habits;

  // Sync default platform and habit selection when role/habits change
  useEffect(() => {
    if (availablePlatforms.length > 0 && !availablePlatforms.some(p => p.id === selectedPlatformId)) {
      const first = availablePlatforms[0];
      setSelectedPlatformId(first.id);
      setActiveDomainUrl(first.defaultUrl);
    }
  }, [userRole]);

  useEffect(() => {
    if (habitOptions && habitOptions.length > 0) {
      if (!habitOptions.some(h => h.id === selectedHabitId)) {
        setSelectedHabitId(habitOptions[0].id);
      }
    }
  }, [habitOptions, selectedPlatformId]);

  // Synchronize platform selection with active domain URL simulator
  const handleSelectPlatform = (platformId) => {
    setSelectedPlatformId(platformId);
    const plat = availablePlatforms.find(p => p.id === platformId) || availablePlatforms[0];
    if (plat) {
      setActiveDomainUrl(plat.defaultUrl);
    }
    setDomainWarning(null);
  };

  // Smart Domain Guard Enforcement
  useEffect(() => {
    if (isActive && isGuardEnabled) {
      const isValid = isLearningDomain(activeDomainUrl, whitelistedDomains);
      if (!isValid) {
        setIsActive(false);
        const invalidDomain = activeDomainUrl || 'non-whitelisted-site.com';
        setDomainWarning({
          domain: invalidDomain,
          message: `🛑 AI Focus Guard Alert: You switched to non-whitelisted domain '${invalidDomain}' during your ${selectedPlatform.name} session! Timer automatically paused to prevent distraction. Return to ${selectedPlatform.name} (${selectedPlatform.domain}) to resume.`
        });
      }
    }
  }, [activeDomainUrl, isActive, isGuardEnabled, whitelistedDomains, selectedPlatform]);

  // Timer countdown interval effect
  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      setIsActive(false);
      handleSessionCompleted();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const handleSelectPreset = (mins) => {
    setIsActive(false);
    setSelectedMinutes(mins);
    setSecondsLeft(mins * 60);
    setCompletedQuote(null);
    setDomainWarning(null);
  };

  const toggleTimer = () => {
    if (!isActive) {
      // Check permission modal
      if (!hasDomainGuardPermission) {
        setShowPermissionModal(true);
        return;
      }

      // Check domain validity if guard enabled
      if (isGuardEnabled) {
        const isValid = isLearningDomain(activeDomainUrl, whitelistedDomains);
        if (!isValid) {
          setDomainWarning({
            domain: activeDomainUrl,
            message: `🛑 Cannot start focus timer on non-whitelisted domain '${activeDomainUrl}'. Please switch to ${selectedPlatform.name} (${selectedPlatform.domain}).`
          });
          return;
        }
      }
      setDomainWarning(null);
    }
    setIsActive(!isActive);
  };

  const handleGrantPermission = () => {
    setHasDomainGuardPermission(true);
    setIsGuardEnabled(true);
    setShowPermissionModal(false);

    const isValid = isLearningDomain(activeDomainUrl, whitelistedDomains);
    if (!isValid) {
      setDomainWarning({
        domain: activeDomainUrl,
        message: `🛑 Active Domain Guard enabled! Current domain '${activeDomainUrl}' is non-whitelisted. Switch to ${selectedPlatform.name} (${selectedPlatform.domain}) to start timer.`
      });
    } else {
      setDomainWarning(null);
      setIsActive(true);
    }
  };

  const handleDenyPermission = () => {
    setHasDomainGuardPermission(false);
    setIsGuardEnabled(false);
    setShowPermissionModal(false);
    setIsActive(true);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(selectedMinutes * 60);
    setCompletedQuote(null);
    setDomainWarning(null);
  };

  const handleSessionCompleted = async () => {
    confetti({
      particleCount: 140,
      spread: 85,
      origin: { y: 0.6 }
    });

    const targetHabit = habits.find(h => h.id === selectedHabitId) || habitOptions[0] || habits[0];
    if (targetHabit) {
      await checkIn(targetHabit.id);
    }

    const aiQuotes = [
      `🏆 Outstanding ${selectedMinutes}-minute sprint on ${selectedPlatform.name} ${selectedPlatform.icon}! Tailored for your '${userRole}' role. You auto-completed '${targetHabit ? targetHabit.title : 'Micro-Goal'}' for today!`,
      `🚀 High-output focus unlocked on ${selectedPlatform.name}! Logged ${selectedMinutes}m of uninterrupted consistency. Your daily streak is alive and thriving!`,
      `🧠 Peak cognitive mastery! Completing your ${selectedMinutes}-minute ${selectedPlatform.name} session places your habit consistency in the top tier of disciplined achievers.`
    ];

    const randomQuote = aiQuotes[Math.floor(Math.random() * aiQuotes.length)];
    setCompletedQuote(randomQuote);

    if (setToastMessage) {
      setToastMessage({
        type: 'success',
        title: `🎓 ${selectedPlatform.name} Session Completed!`,
        message: randomQuote
      });
      setTimeout(() => setToastMessage(null), 8000);
    }
  };

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((selectedMinutes * 60 - secondsLeft) / (selectedMinutes * 60)) * 100;
  const isCurrentDomainValid = isLearningDomain(activeDomainUrl, whitelistedDomains);

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px', position: 'relative' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)'
          }}>
            <Timer size={20} color="#FFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800 }}>
                Focus & Auto-Study Tracker
              </h3>
              {/* Role Badge */}
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '10px',
                background: 'rgba(139, 92, 246, 0.2)',
                color: 'var(--accent-purple)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <UserCheck size={10} /> {userRole} Mode
              </span>

              {/* Domain Guard Status Pill */}
              <button
                onClick={() => setIsGuardEnabled(!isGuardEnabled)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isGuardEnabled ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
                  background: isGuardEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: isGuardEnabled ? '#34D399' : 'var(--text-muted)'
                }}
                title="Toggle Active Learning Domain Guard"
              >
                {isGuardEnabled ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                {isGuardEnabled ? 'Guard ON' : 'Guard OFF'}
              </button>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Tailored tools for <strong style={{ color: 'var(--accent-purple)' }}>{userRole}</strong> routines. Complete sessions to auto-check-in active habits.
            </p>
          </div>
        </div>

        {/* Duration Selector */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {presets.map(p => (
            <button
              key={p.minutes}
              onClick={() => handleSelectPreset(p.minutes)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedMinutes === p.minutes ? 'none' : '1px solid var(--border-color)',
                background: selectedMinutes === p.minutes ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedMinutes === p.minutes ? 'black' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. ROLE-ADAPTED PLATFORM SELECTOR */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} color="var(--accent-cyan)" /> Active Tools Prioritized for {userRole}:
          </label>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            {selectedPlatform.icon} {selectedPlatform.name} ({selectedPlatform.category})
          </span>
        </div>

        {/* Visual Platform Selector Chips Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
          {availablePlatforms.map(p => {
            const isSelected = selectedPlatformId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPlatform(p.id)}
                disabled={isActive}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  color: isSelected ? 'white' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: isActive ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  opacity: isActive && !isSelected ? 0.5 : 1
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                  <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                  <span style={{ fontSize: '0.68rem', color: isSelected ? '#A7F3D0' : 'var(--text-muted)' }}>{p.category}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Domain Simulator Bar */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        marginBottom: '20px',
        border: `1px solid ${isCurrentDomainValid ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.3)'}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ExternalLink size={14} color={isCurrentDomainValid ? '#34D399' : '#FCA5A5'} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Domain Guard Monitor & Active Tab:
            </span>
          </div>

          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '10px',
            background: isCurrentDomainValid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: isCurrentDomainValid ? '#34D399' : '#FCA5A5'
          }}>
            {isCurrentDomainValid ? `✅ Matched (${selectedPlatform.name})` : '🛑 Non-Whitelisted Domain'}
          </span>
        </div>

        {/* Domain Text Input */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            className="form-control"
            style={{ padding: '6px 12px', fontSize: '0.82rem', flex: 1 }}
            placeholder="Type active URL to test domain monitor..."
            value={activeDomainUrl}
            onChange={(e) => {
              setActiveDomainUrl(e.target.value);
              setDomainWarning(null);
            }}
          />
        </div>
      </div>

      {/* Warning Banner if non-whitelisted domain is detected */}
      {domainWarning && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.18)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          animation: 'pulse 1.5s infinite',
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)'
        }}>
          <AlertTriangle size={22} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FCA5A5', marginBottom: '4px' }}>
              Timer Paused: Non-Whitelisted Domain Detected
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#FEE2E2', lineHeight: 1.4 }}>
              {domainWarning.message}
            </p>
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setActiveDomainUrl(selectedPlatform.defaultUrl);
                  setDomainWarning(null);
                }}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.78rem', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
              >
                Return to {selectedPlatform.name} & Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Focus Clock & Habit Controls Display */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        alignItems: 'center'
      }}>
        {/* Clock Display */}
        <div style={{
          textAlign: 'center',
          padding: '24px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          position: 'relative'
        }}>
          {/* CONTEXT-AWARE TIMER SCREEN BANNER */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: isActive ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.06)',
            border: isActive ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
            marginBottom: '14px',
            boxShadow: isActive ? '0 0 12px rgba(6, 182, 212, 0.3)' : 'none'
          }}>
            <span style={{ fontSize: '1.1rem' }}>{selectedPlatform.icon}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isActive ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
              Focus Session {isActive ? 'active' : 'ready'} on <strong style={{ textDecoration: 'underline' }}>{selectedPlatform.name}</strong>
            </span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '3.2rem',
            fontWeight: 800,
            letterSpacing: '2px',
            color: isActive ? 'var(--accent-cyan)' : 'var(--text-primary)',
            textShadow: isActive ? '0 0 20px rgba(6, 182, 212, 0.5)' : 'none'
          }}>
            {formatTime(secondsLeft)}
          </h2>

          {/* Progress Indicator Bar */}
          <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.08)', height: '6px', borderRadius: '3px', margin: '16px 0 20px 0', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #06B6D4 0%, #10B981 100%)',
              transition: 'width 0.4s ease'
            }} />
          </div>

          {/* Control Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={toggleTimer}
              className="btn-primary"
              style={{
                background: isActive ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : 'linear-gradient(135deg, #06B6D4 0%, #059669 100%)',
                padding: '10px 24px',
                fontSize: '0.95rem'
              }}
            >
              {isActive ? <Pause size={18} /> : <Play size={18} />}
              {isActive ? 'Pause Session' : `Start ${selectedPlatform.name} Focus`}
            </button>

            <button
              onClick={resetTimer}
              className="btn-secondary"
              style={{ padding: '10px 14px' }}
              title="Reset Timer"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Right: AI HABIT SYNCED DROPDOWN & STATUS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                <BookOpen size={14} color="var(--accent-cyan)" /> Auto-Check-In AI Habit ({selectedPlatform.category})
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                Synced to {userRole}
              </span>
            </label>

            <select
              className="form-control"
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              disabled={isActive}
            >
              {habitOptions.map(h => (
                <option key={h.id} value={h.id}>
                  {h.title} ({h.category || 'General'})
                </option>
              ))}
            </select>
          </div>

          {/* Live Status Message */}
          <div style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
            border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid var(--border-color)',
            fontSize: '0.82rem',
            color: isActive ? '#6EE7B7' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={16} color="var(--accent-cyan)" />
            {isActive
              ? `🧠 Deep Focus Active on ${selectedPlatform.name} (${activeDomainUrl.split('/')[0]})!`
              : `Press Start to initiate your timed ${selectedPlatform.name} sprint.`}
          </div>

          {/* AUTO-COMPLETION & AI MOTIVATION SUCCESS CARD */}
          {completedQuote && (
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              fontSize: '0.85rem',
              color: '#A7F3D0',
              lineHeight: 1.45,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'fadeIn 0.4s ease-out'
            }}>
              <CheckCircle2 size={22} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.92rem', color: '#34D399' }}>
                  🎓 {selectedPlatform.name} Session Completed & Habit Auto-Checked-In!
                </strong>
                <p style={{ marginTop: '4px' }}>{completedQuote}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Permission & Mode Prompt Modal */}
      {showPermissionModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '520px',
            padding: '28px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)'
                }}>
                  <Shield size={22} color="#FFF" />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800 }}>
                    Active Domain Guard Permission
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Smart Focus Protection for {userRole}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowPermissionModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Enable <strong>Active Domain Guard</strong> to automatically monitor active tab URLs during your <strong>{selectedPlatform.name}</strong> focus session. If distraction sites are opened, the timer will automatically pause and issue an AI motivational reminder.
            </p>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              marginBottom: '20px',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'block', marginBottom: '6px' }}>
                Target Tool: {selectedPlatform.icon} {selectedPlatform.name} ({selectedPlatform.category})
              </span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Prioritized Whitelisted Tools for {userRole}: {availablePlatforms.map(p => p.name).join(', ')}.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleGrantPermission}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', background: 'linear-gradient(135deg, #06B6D4 0%, #059669 100%)', fontSize: '0.95rem' }}
              >
                <ShieldCheck size={18} /> Enable Guard & Start {selectedPlatform.name} Session
              </button>

              <button
                onClick={handleDenyPermission}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.85rem' }}
              >
                Start Session Without Domain Guard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
