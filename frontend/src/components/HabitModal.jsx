import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Trash2, Edit3 } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import { suggestMicroGoals } from '../services/api';

export default function HabitModal() {
  const { isModalOpen, closeModal, editingHabit, addHabit, editHabit } = useHabits();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Productivity');
  const [targetDays, setTargetDays] = useState(7);
  const [microGoals, setMicroGoals] = useState([
    { id: 'temp-1', text: 'Preparation & environment setup', points: 15 },
    { id: 'temp-2', text: 'Core 15-minute action focus', points: 30 }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title || '');
      setDescription(editingHabit.description || '');
      setCategory(editingHabit.category || 'Productivity');
      setTargetDays(editingHabit.targetDays || 7);
      setMicroGoals(editingHabit.microGoals && editingHabit.microGoals.length > 0
        ? editingHabit.microGoals
        : [
            { id: 'temp-1', text: 'Preparation & environment setup', points: 15 },
            { id: 'temp-2', text: 'Core 15-minute action focus', points: 30 }
          ]
      );
    } else {
      setTitle('');
      setDescription('');
      setCategory('Productivity');
      setTargetDays(7);
      setMicroGoals([
        { id: 'temp-1', text: 'Preparation & environment setup', points: 15 },
        { id: 'temp-2', text: 'Core 15-minute action focus', points: 30 }
      ]);
    }
  }, [editingHabit, isModalOpen]);

  if (!isModalOpen) return null;

  const handleAiSuggest = async () => {
    try {
      setIsGenerating(true);
      const suggestions = await suggestMicroGoals(title || 'New Habit', category);
      setMicroGoals(suggestions);
    } catch (err) {
      console.error('Failed to generate suggestions:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddMicroGoalInput = () => {
    setMicroGoals([
      ...microGoals,
      { id: `temp-${Date.now()}`, text: '', points: 15 }
    ]);
  };

  const handleRemoveMicroGoal = (id) => {
    setMicroGoals(microGoals.filter(m => m.id !== id));
  };

  const handleMicroGoalTextChange = (id, text) => {
    setMicroGoals(microGoals.map(m => m.id === id ? { ...m, text } : m));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      const validMicroGoals = microGoals
        .filter(m => m.text.trim() !== '')
        .map((m, idx) => ({
          id: m.id && !m.id.startsWith('temp-') ? m.id : `mg-${Date.now()}-${idx}`,
          text: m.text,
          points: m.points || 15,
          completed: m.completed || false
        }));

      const payload = {
        title,
        description,
        category,
        targetDays: parseInt(targetDays, 10),
        microGoals: validMicroGoals
      };

      if (editingHabit) {
        await editHabit(editingHabit.id, payload);
      } else {
        await addHabit(payload);
      }
    } catch (err) {
      console.error('Error saving habit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '540px',
        padding: '28px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {editingHabit ? <Edit3 size={20} color="var(--accent-purple)" /> : null}
              {editingHabit ? 'Edit Micro-Goal Habit' : 'Create Micro-Goal Habit'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {editingHabit ? 'Modify targets, category, title, or micro-goal steps' : 'Set up a daily habit with actionable accountability micro-steps'}
            </p>
          </div>
          <button
            onClick={closeModal}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label>Habit Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Read 20 Pages Daily"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category & Target */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Category</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Productivity">Productivity</option>
                <option value="Fitness">Fitness</option>
                <option value="Mindfulness">Mindfulness</option>
                <option value="Learning">Learning</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Streak Goal (Days)</label>
              <input
                type="number"
                className="form-control"
                min="1"
                max="365"
                value={targetDays}
                onChange={(e) => setTargetDays(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Why this habit matters (Motivation)</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="e.g. Expanding knowledge and building consistent mental discipline."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Micro Goals Breakdown */}
          <div style={{ marginTop: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Accountability Micro-Goals (Sub-tasks)
              </label>

              <button
                type="button"
                className="btn-ai"
                onClick={handleAiSuggest}
                disabled={isGenerating}
              >
                <Sparkles size={14} />
                {isGenerating ? 'Generating...' : 'AI Auto-Breakdown'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {microGoals.map((mg, index) => (
                <div key={mg.id || index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '16px' }}>{index + 1}.</span>
                  <input
                    type="text"
                    className="form-control"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                    placeholder="Enter micro-step objective..."
                    value={mg.text}
                    onChange={(e) => handleMicroGoalTextChange(mg.id, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMicroGoal(mg.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddMicroGoalInput}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-purple)',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginTop: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Plus size={14} /> Add another micro-step
            </button>
          </div>

          {/* Submit CTA */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (editingHabit ? 'Updating...' : 'Creating...') : (editingHabit ? 'Save Changes' : 'Create Habit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
