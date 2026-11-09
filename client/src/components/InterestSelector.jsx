import React, { useState } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiSparkles as FiSparkles } from 'react-icons/hi2';
import { FiCheck, FiX } from 'react-icons/fi';

export const AVAILABLE_INTERESTS = [
  'AI & Machine Learning',
  'Web Development',
  'Mobile Apps',
  'UI/UX Design',
  'Cybersecurity',
  'Cloud & DevOps',
  'Robotics & IoT',
  'Competitive Programming',
  'Photography',
  'Film & Video',
  'Dance',
  'Music & Band',
  'Public Speaking & Debating',
  'Literature & Writing',
  'Gaming & Esports',
  'Entrepreneurship',
  'Social Impact',
  'Sports & Fitness'
];

const InterestSelector = ({ isOpen, onClose, onUpdated }) => {
  const { user, updateUser } = useAuth();
  const [selected, setSelected] = useState(user?.interests || []);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const toggleInterest = (interest) => {
    if (selected.includes(interest)) {
      setSelected(selected.filter(i => i !== interest));
    } else {
      setSelected([...selected, interest]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await userAPI.updateInterests({ interests: selected });
      if (res.data?.success) {
        updateUser({ interests: res.data.interests || selected });
        toast.success('Your interests have been updated! Recommendations refreshed.');
        if (onUpdated) onUpdated(selected);
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update interests');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem' }}>
              <FiSparkles style={{ color: 'var(--pink)' }} /> Select Your Interests
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Our AI recommender personalizes campus events based on your picks.
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <FiX size={20} />
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.65rem',
          maxHeight: '340px',
          overflowY: 'auto',
          padding: '0.5rem 0',
          marginBottom: '1.75rem'
        }}>
          {AVAILABLE_INTERESTS.map((interest) => {
            const isSelected = selected.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  border: isSelected
                    ? '1px solid #6366f1'
                    : '1px solid var(--border-subtle)',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))'
                    : 'var(--bg-glass)',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                {isSelected && <FiCheck style={{ color: '#818cf8' }} />}
                {interest}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Selected: <strong style={{ color: 'var(--primary)' }}>{selected.length}</strong> topics
          </span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save & Refresh Events'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestSelector;
