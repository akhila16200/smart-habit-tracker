import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Award, CheckCircle2, Sparkles, BookOpen, ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink, Plus, Check, X, Shield, Code, Terminal, FileCode, Layers, UserCheck, Trash2 } from 'lucide-react';
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

function extractMinutesFromText(text) {
  if (!text) return null;
  const match = text.match(/\b(\d{1,3})\s*(?:-|–|\s*)?(?:min|mins|minute|minutes|m)\b/i);
  if (match) {
    const parsed = parseInt(match[1], 10);
    if (parsed > 0 && parsed <= 300) return parsed;
  }
  return null;
}

function getHabitDurationMinutes(habit) {
  if (!habit) return 25;
  if (habit.targetMinutes) return Number(habit.targetMinutes);
  if (habit.duration) return Number(habit.duration);
  if (habit.targetDuration) return Number(habit.targetDuration);
  if (habit.minutes) return Number(habit.minutes);

  const fromTitle = extractMinutesFromText(habit.title);
  if (fromTitle) return fromTitle;

  const fromDesc = extractMinutesFromText(habit.description);
  if (fromDesc) return fromDesc;

  if (Array.isArray(habit.microGoals)) {
    for (const mg of habit.microGoals) {
      const fromMg = extractMinutesFromText(mg.text);
      if (fromMg) return fromMg;
    }
  }

  const cat = (habit.category || '').toLowerCase();
  if (cat.includes('learning')) return 45;
  if (cat.includes('productivity')) return 30;
  if (cat.includes('fitness')) return 20;
  if (cat.includes('mindfulness')) return 15;

  return 25;
}

function isStudyLearningHabit(habit) {
  if (!habit) return false;
  const category = (habit.category || '').toLowerCase();
  const title = (habit.title || '').toLowerCase();
  const description = (habit.description || '').toLowerCase();

  // Exclude general wellness habits (hydration, sleep, stretching, workout, meal)
  const isExcludedWellness =
    category.includes('fitness') ||
    category.includes('mindfulness') ||
    category.includes('health') ||
    category.includes('wellness') ||
    title.includes('water') ||
    title.includes('hydration') ||
    title.includes('stretch') ||
    title.includes('sleep') ||
    title.includes('workout') ||
    title.includes('meal') ||
    title.includes('nutrition') ||
    title.includes('step') ||
    title.includes('walk') ||
    description.includes('water') ||
    description.includes('sleep') ||
    description.includes('workout');

  if (isExcludedWellness) return false;

  // Include Learning, Study, Productivity, Code, & Professional Development categories
  const isLearningCategory =
    category.includes('learning') ||
    category.includes('study') ||
    category.includes('productivity') ||
    category.includes('professional') ||
    category.includes('code') ||
    category.includes('tech');

  const hasStudyKeywords =
    title.includes('study') ||
    title.includes('code') ||
    title.includes('coding') ||
    title.includes('read') ||
    title.includes('reading') ||
    title.includes('learn') ||
    title.includes('learning') ||
    title.includes('course') ||
    title.includes('deep work') ||
    title.includes('practice') ||
    description.includes('study') ||
    description.includes('code') ||
    description.includes('read') ||
    description.includes('learn');

  return isLearningCategory || hasStudyKeywords;
}

export default function FocusTimer() {
  const { habits, checkIn, setToastMessage } = useHabits();
  const { user } = useAuth();

  const userRole = user?.role || 'Working Professional';
  const rolePlatforms = getRolePlatforms(userRole);

  const customToolsStorageKey = `habitpulse_custom_tools_${user ? user.id : 'default'}`;
  const removedToolsStorageKey = `habitpulse_removed_tools_${user ? user.id : 'default'}`;

  const [customPlatforms, setCustomPlatforms] = useState([]);
  const [removedPlatformIds, setRemovedPlatformIds] = useState([]);
  const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customIcon, setCustomIcon] = useState('🎓');
  const [customCategory, setCustomCategory] = useState('Learning');

  useEffect(() => {
    const savedCustom = localStorage.getItem(customToolsStorageKey);
    if (savedCustom) {
      try {
        setCustomPlatforms(JSON.parse(savedCustom));
      } catch (e) {}
    }
    const savedRemoved = localStorage.getItem(removedToolsStorageKey);
    if (savedRemoved) {
      try {
        setRemovedPlatformIds(JSON.parse(savedRemoved));
      } catch (e) {}
    }
  }, [customToolsStorageKey, removedToolsStorageKey]);

  const availablePlatforms = [...rolePlatforms, ...customPlatforms].filter(
    p => !removedPlatformIds.includes(p.id)
  );

  // Learning & Study Category Filter: Exclude wellness habits, generate quick duration chips for study/coding goals
  const studyHabits = (habits || []).filter(isStudyLearningHabit);

  const dynamicPresets = (studyHabits.length > 0)
    ? studyHabits.map(h => {
        const mins = getHabitDurationMinutes(h);
        return {
          id: h.id,
          label: `✨ ${mins}m ${h.title.length > 16 ? h.title.substring(0, 16) + '...' : h.title}`,
          fullTitle: h.title,
          minutes: mins,
          habitId: h.id,
          category: h.category
        };
      })
    : [
        { id: 'default-25', label: '⚡ 25m Pomodoro Sprint', fullTitle: 'Pomodoro Focus', minutes: 25 },
        { id: 'default-45', label: '🎓 45m Deep Study', fullTitle: 'Deep Study Sprint', minutes: 45 },
        { id: 'default-50', label: '💻 50m Code & Build', fullTitle: 'Code & Build Focus', minutes: 50 }
      ];

  const [selectedPlatformId, setSelectedPlatformId] = useState(availablePlatforms[0]?.id || 'leetcode');
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState('');
  const [completedQuote, setCompletedQuote] = useState(null);

  // Window Reference Tracking for Linked Platform Tab
  const platformWindowRef = useRef(null);

  // Active Learning Domain Guard States
  const [hasDomainGuardPermission, setHasDomainGuardPermission] = useState(false);
  const [isGuardEnabled, setIsGuardEnabled] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [activeDomainUrl, setActiveDomainUrl] = useState(availablePlatforms[0]?.defaultUrl || 'leetcode.com/problems');
  const [domainWarning, setDomainWarning] = useState(null);

  // Build dynamic whitelist based on currently active platforms
  const whitelistedDomains = Array.from(new Set([
    ...availablePlatforms.map(p => p.domain)
  ]));

  const selectedPlatform = availablePlatforms.find(p => p.id === selectedPlatformId) || availablePlatforms[0] || {
    id: 'fallback',
    name: 'Custom Focus',
    icon: '🎯',
    domain: 'localhost',
    defaultUrl: 'localhost',
    category: 'Learning'
  };

  const handleAddCustomTool = (e) => {
    e.preventDefault();
    if (!customName || !customUrl) return;

    const cleanUrl = customUrl.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '');
    const domainOnly = cleanUrl.split('/')[0];

    const newTool = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      icon: customIcon || '🎓',
      domain: domainOnly,
      defaultUrl: cleanUrl,
      category: customCategory || 'Learning',
      isCustom: true
    };

    const updated = [...customPlatforms, newTool];
    setCustomPlatforms(updated);
    localStorage.setItem(customToolsStorageKey, JSON.stringify(updated));

    setSelectedPlatformId(newTool.id);
    setActiveDomainUrl(newTool.defaultUrl);

    setIsAddCustomModalOpen(false);
    setCustomName('');
    setCustomUrl('');
    setCustomIcon('🎓');
    setCustomCategory('Learning');

    if (setToastMessage) {
      setToastMessage({
        type: 'success',
        title: '✨ Custom Focus Tool Added!',
        message: `'${newTool.name}' added to your platform suite & Domain Guard whitelist.`
      });
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleRemovePlatform = (platformId, event) => {
    if (event) event.stopPropagation();

    const targetPlatform = availablePlatforms.find(p => p.id === platformId);
    if (!targetPlatform) return;

    // Remove from custom or preset platform tracking
    if (targetPlatform.isCustom || customPlatforms.some(c => c.id === platformId)) {
      const updatedCustoms = customPlatforms.filter(c => c.id !== platformId);
      setCustomPlatforms(updatedCustoms);
      localStorage.setItem(customToolsStorageKey, JSON.stringify(updatedCustoms));
    } else {
      const updatedRemoved = [...removedPlatformIds, platformId];
      setRemovedPlatformIds(updatedRemoved);
      localStorage.setItem(removedToolsStorageKey, JSON.stringify(updatedRemoved));
    }

    // State & Whitelist Cleanup: If deleted tool was active, pick the next available tool
    const remaining = availablePlatforms.filter(p => p.id !== platformId);
    if (selectedPlatformId === platformId && remaining.length > 0) {
      const nextPlat = remaining[0];
      setSelectedPlatformId(nextPlat.id);
      setActiveDomainUrl(nextPlat.defaultUrl);
    }

    if (setToastMessage) {
      setToastMessage({
        type: 'info',
        title: '🗑️ Learning Tool Removed',
        message: `'${targetPlatform.name}' removed from active suite & Domain Guard whitelist.`
      });
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

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

  // Open platform in new tab and save returned window reference
  const openPlatformTabAndTrack = () => {
    const rawUrl = selectedPlatform.defaultUrl || selectedPlatform.domain;
    const targetUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    try {
      const win = window.open(targetUrl, '_blank');
      platformWindowRef.current = win;
      return win;
    } catch (e) {
      console.warn('Window open error:', e);
      return null;
    }
  };

  // Synchronize platform selection with active domain URL simulator
  const handleSelectPlatform = (platformId) => {
    setSelectedPlatformId(platformId);
    const plat = availablePlatforms.find(p => p.id === platformId) || availablePlatforms[0];
    if (plat) {
      setActiveDomainUrl(plat.defaultUrl);
    }
    setDomainWarning(null);
  };

  // Lightweight Background Check for Tab Closure (Interval Check)
  useEffect(() => {
    let tabCheckInterval = null;
    if (isActive) {
      tabCheckInterval = setInterval(() => {
        if (platformWindowRef.current && platformWindowRef.current.closed) {
          setIsActive(false);
          platformWindowRef.current = null;

          const warningText = `Focus Paused: You closed your ${selectedPlatform.name} session early. Re-open the platform to resume your study target!`;
          setDomainWarning({
            domain: selectedPlatform.domain,
            message: warningText
          });

          if (setToastMessage) {
            setToastMessage({
              type: 'warning',
              title: `🛑 ${selectedPlatform.name} Session Interrupted!`,
              message: warningText
            });
            setTimeout(() => setToastMessage(null), 8000);
          }
        }
      }, 1000);
    }
    return () => {
      if (tabCheckInterval) clearInterval(tabCheckInterval);
    };
  }, [isActive, selectedPlatform, setToastMessage]);

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

  const handleSelectPreset = (preset) => {
    setIsActive(false);
    const mins = typeof preset === 'number' ? preset : preset.minutes;
    setSelectedMinutes(mins);
    setSecondsLeft(mins * 60);
    setCompletedQuote(null);
    setDomainWarning(null);

    // Instant Timer Setup: Select corresponding habit for auto-check-in upon completion
    if (typeof preset === 'object' && preset.habitId) {
      setSelectedHabitId(preset.habitId);
      if (setToastMessage) {
        setToastMessage({
          type: 'info',
          title: `⏱️ Timer Synced to AI Habit (${mins}m)`,
          message: `Focus timer set to ${mins} mins & linked to "${preset.fullTitle}"`
        });
        setTimeout(() => setToastMessage(null), 4000);
      }
    }
  };

  const handleReturnAndResume = () => {
    setActiveDomainUrl(selectedPlatform.defaultUrl);
    setDomainWarning(null);
    openPlatformTabAndTrack();
    setIsActive(true);
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

      // Open platform tab and save window reference if not already open
      if (!platformWindowRef.current || platformWindowRef.current.closed) {
        openPlatformTabAndTrack();
      }
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

        {/* AI Goal Duration Selector Chips */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sparkles size={13} color="var(--accent-purple)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              AI Study & Learning Goal Durations:
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {dynamicPresets.map(p => {
              const isSelected = selectedMinutes === p.minutes && (p.habitId ? selectedHabitId === p.habitId : true);
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  title={`Set timer to ${p.minutes} mins for "${p.fullTitle || p.label}"`}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: isSelected ? 'none' : '1px solid rgba(139, 92, 246, 0.35)',
                    background: isSelected ? 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)' : 'rgba(139, 92, 246, 0.1)',
                    color: isSelected ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: isSelected ? '0 2px 8px rgba(139, 92, 246, 0.3)' : 'none'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
          {availablePlatforms.map(p => {
            const isSelected = selectedPlatformId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => !isActive && handleSelectPlatform(p.id)}
                style={{
                  padding: '10px 10px 10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  color: isSelected ? 'white' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: isActive ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  opacity: isActive && !isSelected ? 0.5 : 1,
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{p.icon}</span>
                  <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                    <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                    <span style={{ fontSize: '0.68rem', color: isSelected ? '#A7F3D0' : 'var(--text-muted)' }}>{p.category}</span>
                  </div>
                </div>

                {/* Subtle Delete / Remove Tool Button */}
                <button
                  type="button"
                  onClick={(e) => handleRemovePlatform(p.id, e)}
                  disabled={isActive}
                  title={`Remove ${p.name}`}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '4px',
                    borderRadius: '4px',
                    color: 'rgba(255, 255, 255, 0.3)',
                    cursor: isActive ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#EF4444';
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}

          {/* Add Custom Tool Chip Button */}
          <button
            onClick={() => setIsAddCustomModalOpen(true)}
            disabled={isActive}
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1.5px dashed var(--accent-purple)',
              color: 'var(--accent-purple)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: isActive ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              opacity: isActive ? 0.5 : 1
            }}
          >
            <Plus size={16} />
            <span>+ Add Custom Tool</span>
          </button>
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
                onClick={handleReturnAndResume}
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
              onClick={openPlatformTabAndTrack}
              className="btn-secondary"
              style={{ padding: '10px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title={`Open ${selectedPlatform.name} in new tab & track session`}
            >
              <ExternalLink size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.85rem' }}>Open {selectedPlatform.name}</span>
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
      {/* Add Custom Tool Input Modal */}
      {isAddCustomModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '28px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
                }}>
                  <Plus size={20} color="#FFF" />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800 }}>
                    Add Custom Focus Tool
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Whitelist custom study site or app
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsAddCustomModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCustomTool}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Tool / Platform Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Udemy, My Custom Docs, Coursera"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Platform URL / Domain *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. udemy.com/course or my-docs.io"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Icon</label>
                  <select
                    className="form-control"
                    value={customIcon}
                    onChange={(e) => setCustomIcon(e.target.value)}
                  >
                    <option value="🎓">🎓 Graduate Cap</option>
                    <option value="💻">💻 Laptop / Web</option>
                    <option value="📚">📚 Book / Docs</option>
                    <option value="📝">📝 Notes / Journal</option>
                    <option value="🧘">🧘 Meditation</option>
                    <option value="🏋️">🏋️ Workout</option>
                    <option value="🚀">🚀 Launch</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Category</label>
                  <select
                    className="form-control"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  >
                    <option value="Learning">Learning</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Mindfulness">Mindfulness</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddCustomModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '10px 18px' }}
                >
                  <Plus size={16} /> Add & Whitelist Tool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
