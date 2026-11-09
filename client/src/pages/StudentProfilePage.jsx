import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { AVAILABLE_INTERESTS } from '../components/InterestSelector';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiShield,
  FiSliders,
  FiCheck,
  FiX,
  FiCalendar,
  FiCompass,
  FiBookmark,
  FiSave,
  FiRefreshCw
} from 'react-icons/fi';
import { HiSparkles as FiSparkles } from 'react-icons/hi2';

const StudentProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [interests, setInterests] = useState(user?.interests || []);
  const [profileStats, setProfileStats] = useState({
    joinedClubsCount: user?.joinedClubs?.length || 0,
    savedEventsCount: user?.savedEvents?.length || 0
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingInterests, setSavingInterests] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load detailed profile
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await userAPI.getProfile();
        if (res.data?.success && res.data.user) {
          const u = res.data.user;
          setName(u.name || '');
          setAvatar(u.avatar || '');
          setInterests(u.interests || []);
          setProfileStats({
            joinedClubsCount: u.joinedClubs?.length || 0,
            savedEventsCount: u.savedEvents?.length || 0
          });
          updateUser(u);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Handle Profile Update (Name & Avatar)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await userAPI.updateProfile({
        name: name.trim(),
        avatar: avatar.trim()
      });
      if (res.data?.success) {
        toast.success('Profile details updated successfully!');
        updateUser({ name: name.trim(), avatar: avatar.trim() });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Toggle Interest Tag
  const toggleInterest = (tag) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Handle Save Interests
  const handleSaveInterests = async () => {
    setSavingInterests(true);
    try {
      const res = await userAPI.updateInterests({ interests });
      if (res.data?.success) {
        toast.success('Interests updated! Recommendations refreshed.');
        updateUser({ interests });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update interests');
    } finally {
      setSavingInterests(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '960px' }}>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#fff',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
            flexShrink: 0,
            overflow: 'hidden'
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            name?.charAt(0) || 'S'
          )}
        </div>

        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-primary">{user?.role || 'Student'}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', margin: '0 0 0.25rem' }}>{name || user?.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
            {user?.email}
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(10, 13, 20, 0.6)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#818cf8' }}>
              {profileStats.joinedClubsCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Clubs Joined
            </div>
          </div>
          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(10, 13, 20, 0.6)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f472b6' }}>
              {profileStats.savedEventsCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Bookmarks
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Profile Details Edit Form */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiUser /> Personal Details
          </h2>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">
                College Email (Read Only)
              </label>
              <input
                id="profile-email"
                type="email"
                className="form-control"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.35rem', display: 'block' }}>
                Email address is managed by your university authentication directory.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-avatar">
                Avatar Image URL (Optional)
              </label>
              <input
                id="profile-avatar"
                type="url"
                className="form-control"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <FiSave /> {savingProfile ? 'Saving...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Interests Configuration */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiSliders /> Your Topics of Interest
            </h2>
            <span className="badge badge-match">{interests.length} selected</span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            ClubConnect matches campus events to your interests. Toggle the tags below to update your personalized recommendations feed.
          </p>

          {/* Selected Tags Preview */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.25rem' }}>
            {interests.map((t) => (
              <span
                key={t}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary)',
                  color: '#ffffff'
                }}
              >
                {t}
                <button
                  type="button"
                  onClick={() => toggleInterest(t)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fb7185',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={`Remove ${t}`}
                >
                  <FiX size={13} />
                </button>
              </span>
            ))}
          </div>

          {/* All Available Interests Picker */}
          <div
            style={{
              flex: 1,
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '0.75rem',
              background: 'rgba(10, 13, 20, 0.6)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.45rem',
              marginBottom: '1.5rem'
            }}
          >
            {(AVAILABLE_INTERESTS || []).map((item) => {
              const isSelected = interests.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleInterest(item)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: '1px solid',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'var(--transition)',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-glass-strong)',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-subtle)',
                    color: isSelected ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  {isSelected && <FiCheck size={12} style={{ color: 'var(--primary)' }} />}
                  {item}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleSaveInterests}
            disabled={savingInterests}
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: 'auto' }}
          >
            <FiSparkles /> {savingInterests ? 'Updating...' : 'Save Interests Selection'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;

