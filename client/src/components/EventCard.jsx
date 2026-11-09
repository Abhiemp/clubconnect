import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, eventAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiSparkles as FiSparkles } from 'react-icons/hi2';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiBookmark,
  FiCheck,
  FiArrowRight
} from 'react-icons/fi';

const EventCard = ({
  event,
  matchPercentage,
  matchingInterests,
  recommendationReason,
  onSaveToggled,
  isSavedInitial = false
}) => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [isSaved, setIsSaved] = useState(
    isSavedInitial || user?.savedEvents?.some(id => (typeof id === 'string' ? id : id?._id) === event._id)
  );
  const [saving, setSaving] = useState(false);

  const isFull = event.registeredCount >= event.capacity;
  const isPast = new Date(event.date) < new Date() || event.status === 'completed';

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please log in to save events');
      return;
    }
    setSaving(true);
    try {
      const res = await userAPI.toggleSaveEvent(event._id);
      if (res.data?.success) {
        const newSaved = !isSaved;
        setIsSaved(newSaved);
        if (newSaved) {
          toast.success('Event saved to your bookmarks!');
        } else {
          toast.success('Event removed from bookmarks');
        }
        if (res.data.savedEvents) {
          updateUser({ savedEvents: res.data.savedEvents });
        }
        if (onSaveToggled) onSaveToggled(event._id, newSaved);
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const percentFull = Math.min(100, Math.round(((event.registeredCount || 0) / (event.capacity || 1)) * 100));

  // Determine category color badge
  const getCategoryBadgeClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'technical': return 'badge-primary';
      case 'cultural': return 'badge-secondary';
      case 'sports': return 'badge-accent';
      case 'arts': return 'badge-match';
      case 'academic': return 'badge-success';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Event Header Banner */}
      <div
        style={{
          position: 'relative',
          height: '180px',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: '#161d2f'
        }}
      >
        <img
          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'}
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=60';
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(10, 13, 20, 0.2) 0%, rgba(10, 13, 20, 0.85) 100%)'
          }}
        />

        {/* Top Badges */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span className={`badge ${getCategoryBadgeClass(event.category)}`}>
            {event.category || 'Event'}
          </span>

          <button
            type="button"
            onClick={handleToggleSave}
            disabled={saving}
            className="btn-icon"
            style={{
              width: '34px',
              height: '34px',
              background: isSaved ? '#6366f1' : 'rgba(10, 13, 20, 0.7)',
              color: '#ffffff',
              border: isSaved ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)'
            }}
            aria-label="Save event"
          >
            <FiBookmark size={16} fill={isSaved ? '#ffffff' : 'none'} />
          </button>
        </div>

        {/* Match Percentage Badge (If Recommended) */}
        {matchPercentage && matchPercentage > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.9), rgba(139, 92, 246, 0.9))',
              color: '#fff',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)'
            }}
          >
            <FiSparkles size={13} /> {matchPercentage}% Match
          </div>
        )}
      </div>

      {/* Event Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Organizer Club Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem' }}>
          <img
            src={event.club?.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'}
            alt={event.club?.name || 'Club'}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid var(--border-subtle)'
            }}
          />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {event.club?.name || 'Campus Club'}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.18rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            lineHeight: 1.35,
            color: '#ffffff'
          }}
        >
          <Link to={`/events/${event._id}`} style={{ color: 'inherit' }}>
            {event.title}
          </Link>
        </h3>

        {/* Recommendation Reason Snippet */}
        {recommendationReason && (
          <div
            style={{
              fontSize: '0.78rem',
              color: '#f472b6',
              background: 'rgba(236, 72, 153, 0.08)',
              padding: '0.4rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '0.75rem',
              borderLeft: '2px solid #ec4899'
            }}
          >
            {recommendationReason}
          </div>
        )}

        {/* Meta Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiCalendar style={{ color: 'var(--primary)' }} />
            <span>{formattedDate} {event.startTime ? `at ${event.startTime}` : ''}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiMapPin style={{ color: 'var(--accent)' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.venue || 'Campus Auditorium'}
            </span>
          </div>
        </div>

        {/* Capacity / Registration Progress */}
        <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem', color: 'var(--text-dim)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FiUsers size={13} /> {event.registeredCount || 0} / {event.capacity} registered
            </span>
            <span style={{ color: isFull ? 'var(--rose)' : 'var(--emerald)', fontWeight: 600 }}>
              {isFull ? 'Full' : `${event.capacity - (event.registeredCount || 0)} spots left`}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '5px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}
          >
            <div
              style={{
                width: `${percentFull}%`,
                height: '100%',
                background: isFull
                  ? 'var(--rose)'
                  : percentFull > 80
                  ? 'var(--amber)'
                  : 'var(--grad-primary)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>

          {/* Action Button */}
          <Link
            to={`/events/${event._id}`}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <span>{isPast ? 'View Event Details' : isFull ? 'Join Waitlist / View' : 'Register / View Details'}</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
