import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, Award, CheckCircle2, Sparkles, BookOpen, ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink, Plus, Check, X, Shield, Code, Terminal, FileCode, Layers } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import confetti from 'canvas-confetti';

const PLATFORMS = [
  { id: 'leetcode', name: 'LeetCode', icon: '🟠', domain: 'leetcode.com', defaultUrl: 'leetcode.com/problems' },
  { id: 'hackerrank', name: 'HackerRank', icon: '🟢', domain: 'hackerrank.com', defaultUrl: 'hackerrank.com/challenges' },
  { id: 'geeksforgeeks', name: 'GeeksforGeeks', icon: '🌿', domain: 'geeksforgeeks.org', defaultUrl: 'geeksforgeeks.org/dsa' },
  { id: 'github', name: 'GitHub', icon: '🐙', domain: 'github.com', defaultUrl: 'github.com/my-project' },
  { id: 'vscode', name: 'VS Code Web', icon: '💻', domain: 'vscode.dev', defaultUrl: 'vscode.dev' },
  { id: 'docs', name: 'Documentation', icon: '📚', domain: 'developer.mozilla.org', defaultUrl: 'developer.mozilla.org/docs' },
  { id: 'courses', name: 'Online Courses', icon: '🎓', domain: 'coursera.org', defaultUrl: 'coursera.org/learn' }
];

const DEFAULT_WHITELIST = [
  'leetcode.com',
  'hackerrank.com',
  'geeksforgeeks.org',
  'github.com',
  'vscode.dev',
  'developer.mozilla.org',
  'docs.python.org',
  'aws.amazon.com',
  'coursera.org',
  'udemy.com',
  'khanacademy.org'
];

function isLearningDomain(urlOrDomain, whitelist) {
  if (!urlOrDomain) return false;
  const clean = urlOrDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
  return whitelist.some(domain => clean.includes(domain.toLowerCase()));
}

export default function FocusTimer() {
  const { habits, checkIn, setToastMessage } = useHabits();

  const presets = [
    { label: '25m Pomodoro', minutes: 25 },
    { label: '45m Deep Sprint', minutes: 45 },
    { label: '50m Code & Study', minutes: 50 },
  ];

  const domainPresets = [
    { label: 'leetcode.com/problems', valid: true },
    { label: 'github.com/my-project', valid: true },
    { label: 'developer.mozilla.org', valid: true },
    { label: 'twitter.com/feed', valid: false },
    { label: 'youtube.com/shorts', valid: false },
    { label: 'reddit.com/r/all', valid: false },
  ];

  const [selectedPlatformId, setSelectedPlatformId] = useState('leetcode');
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState('');
  const [completedQuote, setCompletedQuote] = useState(null);

  // Active Learning Domain Guard States
  const [hasDomainGuardPermission, setHasDomainGuardPermission] = useState(false);
  const [isGuardEnabled, setIsGuardEnabled] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [whitelistedDomains, setWhitelistedDomains] = useState(DEFAULT_WHITELIST);
  const [activeDomainUrl, setActiveDomainUrl] = useState('leetcode.com/problems/two-sum');
  const [domainWarning, setDomainWarning] = useState(null);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [showAddDomainInput, setShowAddDomainInput] = useState(false);

  const selectedPlatform = PLATFORMS.find(p => p.id === selectedPlatformId) || PLATFORMS[0];

  // Default habit selection
  useEffect(() => {
    if (habits && habits.length > 0 && !selectedHabitId) {
      const studyHabit = habits.find(h =>
        h.category?.toLowerCase() === 'learning' ||
        h.category?.toLowerCase() === 'productivity' ||
        h.title.toLowerCase().includes('study') ||
        h.title.toLowerCase().includes('work') ||
        h.title.toLowerCase().includes('coding')
      );
      setSelectedHabitId(studyHabit ? studyHabit.id : habits[0].id);
    }
  }, [habits]);

  // Synchronize platform selection with active domain URL simulator
  const handleSelectPlatform = (platformId) => {
    setSelectedPlatformId(platformId);
    const plat = PLATFORMS.find(p => p.id === platformId);
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
          message: `🛑 AI Focus Guard Alert: You switched to non-learning domain '${invalidDomain}' during your ${selectedPlatform.name} session! Timer automatically paused to prevent distraction. Return to ${selectedPlatform.name} (${selectedPlatform.domain}) to resume.`
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
            message: `🛑 Cannot start focus timer on non-learning domain '${activeDomainUrl}'. Please switch to a whitelisted platform (e.g. ${selectedPlatform.name}).`
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
        message: `🛑 Active Domain Guard enabled! Current domain '${activeDomainUrl}' is non-learning. Switch to ${selectedPlatform.name} (${selectedPlatform.domain}) to start timer.`
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

  const handleAddCustomDomain = (e) => {
    e.preventDefault();
    if (!newDomainInput.trim()) return;
    const cleanDomain = newDomainInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    if (!whitelistedDomains.includes(cleanDomain)) {
      setWhitelistedDomains([...whitelistedDomains, cleanDomain]);
    }
    setNewDomainInput('');
    setShowAddDomainInput(false);
    setDomainWarning(null);
  };

  const handleSessionCompleted = async () => {
    confetti({
      particleCount: 140,
      spread: 85,
      origin: { y: 0.6 }
    });

    const targetHabit = habits.find(h => h.id === selectedHabitId) || habits[0];
    if (targetHabit) {
      await checkIn(targetHabit.id);
    }

    const aiQuotes = [
      `🏆 Outstanding ${selectedMinutes}-minute deep sprint on ${selectedPlatform.name} ${selectedPlatform.icon}! You auto-completed '${targetHabit ? targetHabit.title : 'Study Goal'}' for today and boosted your streak!`,
      `🚀 High-output focus unlocked on ${selectedPlatform.name}! Logged ${selectedMinutes}m of uninterrupted study. Your daily micro-goal target is complete!`,
      `🧠 Peak cognitive mastery! Completing your ${selectedMinutes}-minute ${selectedPlatform.name} session places your habit consistency in the top tier of achievers.`
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
                {isGuardEnabled ? 'Domain Guard ON' : 'Domain Guard OFF'}
              </button>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Select platform, complete timed focus, and auto-check-in your daily study habit
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

      {/* 1. VISUAL PLATFORM SELECTOR */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} color="var(--accent-cyan)" /> Select Active Learning Platform:
          </label>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            {selectedPlatform.icon} {selectedPlatform.name} Active
          </span>
        </div>

        {/* Visual Platform Selector Chips Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
          {PLATFORMS.map(p => {
            const isSelected = selectedPlatformId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPlatform(p.id)}
                disabled={isActive}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  color: isSelected ? 'white' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: isActive ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  opacity: isActive && !isSelected ? 0.5 : 1
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{p.icon}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
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
              Domain Guard Monitor & Tab Simulator:
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
            {isCurrentDomainValid ? `✅ Matched (${selectedPlatform.name})` : '🛑 Non-Learning Domain'}
          </span>
        </div>

        {/* Quick Simulator Preset Domain Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {domainPresets.map((dp, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveDomainUrl(dp.label);
                setDomainWarning(null);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '14px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: activeDomainUrl === dp.label ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                background: activeDomainUrl === dp.label ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: dp.valid ? '#A7F3D0' : '#FCA5A5',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{dp.valid ? '✅' : '🛑'}</span> {dp.label}
            </button>
          ))}
        </div>

        {/* Domain Text Input & Custom Add Whitelist */}
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

          <button
            onClick={() => setShowAddDomainInput(!showAddDomainInput)}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem', flexShrink: 0 }}
            title="Add custom domain to Whitelist"
          >
            <Plus size={14} /> Add Whitelist
          </button>
        </div>

        {/* Add Custom Whitelist Form */}
        {showAddDomainInput && (
          <form onSubmit={handleAddCustomDomain} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <input
              type="text"
              className="form-control"
              style={{ padding: '6px 12px', fontSize: '0.82rem', flex: 1 }}
              placeholder="e.g. edx.org or stackoverflow.com"
              value={newDomainInput}
              onChange={(e) => setNewDomainInput(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              Add
            </button>
          </form>
        )}
      </div>

      {/* Warning Banner if non-learning domain is detected */}
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
              Timer Paused: Non-Learning Domain Detected
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
          {/* 2. CONTEXT-AWARE TIMER SCREEN BANNER */}
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

        {/* Right: Target Habit Selection & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={14} color="var(--accent-cyan)" /> Target Habit to Auto-Check-In
            </label>
            <select
              className="form-control"
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              disabled={isActive}
            >
              {habits.map(h => (
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

          {/* 3. AUTO-COMPLETION & AI MOTIVATION SUCCESS CARD */}
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
                    Smart Focus Protection System
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
              Enable <strong>Active Learning Domain Guard</strong> to automatically monitor active tab URLs. If distraction sites (social media, entertainment) are opened during your <strong>{selectedPlatform.name}</strong> focus session, the timer will automatically pause and issue an AI motivational reminder.
            </p>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              marginBottom: '20px',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'block', marginBottom: '6px' }}>
                Target Platform: {selectedPlatform.icon} {selectedPlatform.name}
              </span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Whitelisted Learning & Coding Platforms: LeetCode, HackerRank, GeeksforGeeks, GitHub, VS Code Web, MDN Docs, Python Docs, AWS Docs, Coursera, Udemy, & Khan Academy.
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
