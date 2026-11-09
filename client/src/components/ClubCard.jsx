import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clubAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiCalendar, FiArrowRight, FiCheck, FiPlus } from 'react-icons/fi';

const ClubCard = ({ club, onMembershipChanged }) => {
  const { user, isAuthenticated } = useAuth();
  const [isMember, setIsMember] = useState(
    club.members?.some(m => (typeof m === 'string' ? m : m?._id || m?.user) === user?._id)
  );
  const [memberCount, setMemberCount] = useState(club.members?.length || 0);
  const [loading, setLoading] = useState(false);

  const handleJoinLeave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please log in to join clubs');
      return;
    }
    setLoading(true);
    try {
      if (isMember) {
        await clubAPI.leave(club._id);
        setIsMember(false);
        setMemberCount(prev => Math.max(0, prev - 1));
        toast.success(`You have left ${club.name}`);
      } else {
        await clubAPI.join(club._id);
        setIsMember(true);
        setMemberCount(prev => prev + 1);
        toast.success(`Welcome to ${club.name}!`);
      }
      if (onMembershipChanged) onMembershipChanged(club._id, !isMember);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update membership');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryClass = (category) => {
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
      {/* Club Banner */}
      <div
        style={{
          position: 'relative',
          height: '110px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          overflow: 'hidden'
        }}
      >
        <img
          src={club.banner || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60'}
          alt={club.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <span className={`badge ${getCategoryClass(club.category)}`}>
            {club.category}
          </span>
        </div>
      </div>

      {/* Club Body */}
      <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Club Logo Avatar - Overlapping banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-32px', marginBottom: '0.85rem' }}>
          <img
            src={club.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'}
            alt={club.name}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-md)',
              objectFit: 'cover',
              border: '3px solid #121829',
              background: '#121829',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60';
            }}
          />

          {/* Join / Leave button */}
          <button
            onClick={handleJoinLeave}
            disabled={loading}
            className={`btn btn-sm ${isMember ? 'btn-secondary' : 'btn-primary'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
          >
            {isMember ? (
              <>
                <FiCheck style={{ color: 'var(--emerald)' }} /> Joined
              </>
            ) : (
              <>
                <FiPlus /> Join Club
              </>
            )}
          </button>
        </div>

        {/* Club Name & Bio */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.45rem', color: '#ffffff' }}>
          <Link to={`/clubs/${club._id}`} style={{ color: 'inherit' }}>
            {club.name}
          </Link>
        </h3>
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '1.25rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {club.description}
        </p>

        {/* Stats Row */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FiUsers size={14} style={{ color: 'var(--primary)' }} /> {memberCount} members
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FiCalendar size={14} style={{ color: 'var(--accent)' }} /> {club.upcomingEventCount || 0} events
            </span>
          </div>

          <Link
            to={`/clubs/${club._id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--primary)'
            }}
          >
            Explore <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClubCard;
