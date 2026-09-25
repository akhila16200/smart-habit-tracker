import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';
import confetti from 'canvas-confetti';

const HabitContext = createContext(null);

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [habitsData, analyticsData] = await Promise.all([
        api.fetchHabits(),
        api.fetchAnalytics()
      ]);
      setHabits(habitsData);
      setAnalytics(analyticsData);
      setError(null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Could not connect to Habit API backend. Is the Express server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHabit(null);
  };

  const addHabit = async (habitData) => {
    const newHabit = await api.createHabit(habitData);
    await loadData();
    closeModal();
    return newHabit;
  };

  const editHabit = async (id, habitData) => {
    const updated = await api.updateHabit(id, habitData);
    await loadData();
    closeModal();
    return updated;
  };

  const generateAiHabits = async (profileData) => {
    const newHabits = await api.generateAiHabits(profileData);
    await loadData();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
    setToastMessage({
      type: 'success',
      title: '✨ AI Habits Generated!',
      message: `Successfully created ${newHabits.length} personalized daily micro-goal habits for your routine.`
    });
    setTimeout(() => setToastMessage(null), 6000);
    return newHabits;
  };

  const checkIn = async (id) => {
    const updated = await api.checkInHabit(id);
    const todayStr = new Date().toISOString().split('T')[0];
    const isNowChecked = (updated.checkInHistory || []).some(entry => entry.date === todayStr);

    if (isNowChecked) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    }

    await loadData();
  };

  const toggleMicroGoal = async (habitId, microGoalId) => {
    await api.toggleMicroGoal(habitId, microGoalId);
    await loadData();
  };

  const deleteHabit = async (id) => {
    await api.deleteHabit(id);
    await loadData();
  };

  const simulateWearableSync = async () => {
    try {
      const samplePayload = {
        userId: 'USER#default',
        provider: 'Fitbit Wearable',
        metrics: {
          steps: 4500,
          activeMinutes: 30,
          workoutsCompleted: 1,
          waterMl: 600
        }
      };

      const result = await api.sendFitnessWebhook(samplePayload);
      await loadData();

      if (result.autoCheckedInHabits && result.autoCheckedInHabits.length > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setToastMessage({
        type: 'success',
        title: '⌚ Wearable Data Synced!',
        message: result.summary,
        details: result
      });

      setTimeout(() => setToastMessage(null), 7000);
      return result;
    } catch (err) {
      setToastMessage({
        type: 'error',
        title: 'Sync Error',
        message: err.message
      });
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        analytics,
        loading,
        error,
        isModalOpen,
        setIsModalOpen,
        editingHabit,
        openCreateModal,
        openEditModal,
        closeModal,
        isOnboardingOpen,
        setIsOnboardingOpen,
        toastMessage,
        setToastMessage,
        addHabit,
        editHabit,
        generateAiHabits,
        checkIn,
        toggleMicroGoal,
        deleteHabit,
        simulateWearableSync,
        refresh: loadData
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export const useHabits = () => useContext(HabitContext);
