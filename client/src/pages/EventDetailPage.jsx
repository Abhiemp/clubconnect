import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { eventAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiBookmark,
  FiCheck,
  FiShare2,
  FiArrowLeft,
  FiAlertCircle,
  FiInfo,
  FiCheckCircle,
  FiXCircle,
  FiCompass,
  FiTag
} from 'react-icons/fi';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, updateUser } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Registration state
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Bookmark state
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Fetch event and registration status
  const fetchEventDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventAPI.getById(id);
      if (res.data?.success && res.data.event) {
        setEvent(res.data.event);

        // Check if event is bookmarked by user
        if (user?.savedEvents) {
          const saved = user.savedEvents.some(
            (item) => (typeof item === 'string' ? item : item?._id) === res.data.event._id
          );
          setIsSaved(saved);
        }
      } else {
        setError('Event not found');
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError(err.response?.data?.message || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await eventAPI.getRegistrationStatus(id);
      if (res.data?.success) {
        setIsRegistered(!!res.data.isRegistered);
        setRegistrationData(res.data.registration || null);
      }
    } catch (err) {
      // Ignore if not logged in or endpoint returns 401
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated) {
      checkRegistration();
    } else {
      setIsRegistered(false);
      setRegistrationData(null);
    }
  }, [id, isAuthenticated]);

  // Handle Event Registration
  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast('Please log in to register for this event', { icon: 'ℹ️' });
      navigate('/login', { state: { from: location } });
      return;
    }

    setActionLoading(true);
    try {
      const res = await eventAPI.register(id);
      if (res.data?.success) {
        setIsRegistered(true);
        setRegistrationData(res.data.registration);
        setEvent((prev) => ({
          ...prev,
          registeredCount: (prev.registeredCount || 0) + 1
        }));
        toast.success(res.data.message || 'Successfully registered for this event!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Cancel Registration
  const handleCancelRegistration = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration for this event?')) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await eventAPI.cancelRegistration(id);
      if (res.data?.success) {
        setIsRegistered(false);
        setRegistrationData(null);
        setEvent((prev) => ({
          ...prev,
          registeredCount: Math.max(0, (prev.registeredCount || 1) - 1)
        }));
        toast.success('Registration cancelled successfully');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel registration';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Bookmark Toggle
  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save events');
      return;
    }
    setSaveLoading(true);
    try {
      const res = await userAPI.toggleSaveEvent(id);
      if (res.data?.success) {
        const nextSaved = !isSaved;
        setIsSaved(nextSaved);
        toast.success(nextSaved ? 'Saved to your bookmarks!' : 'Removed from bookmarks');
        if (res.data.savedEvents) {
          updateUser({ savedEvents: res.data.savedEvents });
        }
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle Share Link
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    } else {
      toast('Share URL: ' + window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '45px',
            height: '45px',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1.5rem'
          }}
        />
        <p style={{ color: 'var(--text-muted)' }}>Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '550px' }}>
        <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <FiAlertCircle size={48} style={{ color: 'var(--rose)', marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.75rem' }}>Event Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            {error || 'The event you are looking for does not exist or has been removed.'}
          </p>
          <Link to="/events" className="btn btn-primary">
            <FiArrowLeft /> Browse Other Events
          </Link>
        </div>
      </div>
    );
  }

  // Event metadata calculations
  const eventDateObj = new Date(event.date);
  const formattedDate = eventDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const deadlineObj = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
  const formattedDeadline = deadlineObj
    ? deadlineObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Not specified';

  const isDeadlinePassed = deadlineObj ? new Date() > deadlineObj : false;
  const isFull = (event.registeredCount || 0) >= event.capacity;
  const isPast = eventDateObj < new Date() || event.status === 'completed';
  const seatsRemaining = Math.max(0, event.capacity - (event.registeredCount || 0));
  const percentFull = Math.min(100, Math.round(((event.registeredCount || 0) / (event.capacity || 1)) * 100));

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
      {/* Back Navigation & Breadcrumbs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}
      >
        <Link
          to="/events"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          <FiArrowLeft /> Back to Events
        </Link>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={handleToggleSave}
            disabled={saveLoading}
            className="btn btn-secondary btn-sm"
            title={isSaved ? 'Remove bookmark' : 'Bookmark event'}
          >
            <FiBookmark style={{ fill: isSaved ? 'currentColor' : 'none', color: isSaved ? 'var(--pink)' : 'inherit' }} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="btn btn-secondary btn-sm"
            title="Share event link"
          >
            <FiShare2 /> Share
          </button>
        </div>
      </div>

      {/* Main Hero Header Card */}
      <div
        className="glass-card"
        style={{
          padding: 0,
          overflow: 'hidden',
          marginBottom: '2.5rem'
        }}
      >
        <div
          style={{
            position: 'relative',
            height: '320px',
            width: '100%',
            background: '#161d2f'
          }}
        >
          <img
            src={
              event.image ||
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&auto=format&fit=crop&q=80'
            }
            alt={event.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1400&auto=format&fit=crop&q=80';
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(10, 13, 20, 0.3) 0%, rgba(10, 13, 20, 0.92) 100%)'
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '1.75rem',
              left: '2rem',
              right: '2rem'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <span className="badge badge-primary">{event.category}</span>
              {event.status === 'upcoming' ? (
                <span className="badge badge-success">Upcoming</span>
              ) : event.status === 'completed' ? (
                <span className="badge badge-secondary">Completed</span>
              ) : (
                <span className="badge badge-warning">{event.status}</span>
              )}
              {isFull && <span className="badge badge-danger">Capacity Full</span>}
              {isRegistered && (
                <span
                  className="badge"
                  style={{
                    background: 'rgba(16, 185, 129, 0.25)',
                    color: '#34d399',
                    border: '1px solid #10b981'
                  }}
                >
                  <FiCheckCircle /> You are Registered
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: '#ffffff', marginBottom: '0.5rem' }}>
              {event.title}
            </h1>

            {event.club && (
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Organized by{' '}
                <Link
                  to={`/clubs/${event.club._id || event.club}`}
                  style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'underline' }}
                >
                  {event.club.name || 'Campus Club'}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Main Content & Sidebar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(300px, 1.1fr)',
          gap: '2.5rem',
          alignItems: 'start'
        }}
      >
        {/* Left Column: About & Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Quick Info Grid */}
          <div
            className="glass-card"
            style={{
              padding: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <FiCalendar size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Date
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  {formattedDate}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <FiClock size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Time
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  {event.startTime} - {event.endTime}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(236, 72, 153, 0.15)',
                  color: 'var(--pink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <FiMapPin size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Venue
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  {event.venue}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <FiUsers size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Spots Available
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  {isFull ? 'Full' : `${seatsRemaining} of ${event.capacity} left`}
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>About this Event</h2>
            <div
              style={{
                color: 'var(--text-muted)',
                lineHeight: 1.8,
                fontSize: '1rem',
                whiteSpace: 'pre-line'
              }}
            >
              {event.description}
            </div>

            {/* Eligibility Note */}
            {event.eligibility && (
              <div
                style={{
                  marginTop: '2rem',
                  padding: '1.25rem',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  gap: '0.85rem'
                }}
              >
                <FiInfo size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.92rem', marginBottom: '0.25rem', color: '#818cf8' }}>
                    Eligibility
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: 0 }}>
                    {event.eligibility}
                  </p>
                </div>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ fontSize: '0.92rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                  Tags & Topics
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {event.tags.map((t, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.35rem 0.85rem',
                        background: 'var(--bg-glass-strong)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.82rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <FiTag size={12} /> {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Organizer Card */}
          {event.club && typeof event.club === 'object' && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Organizing Club</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--grad-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}
                >
                  {event.club.logo ? (
                    <img
                      src={event.club.logo}
                      alt={event.club.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    event.club.name?.charAt(0) || 'C'
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{event.club.name}</h4>
                  <span className="badge badge-secondary" style={{ fontSize: '0.72rem', marginBottom: '0.5rem' }}>
                    {event.club.category}
                  </span>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                    {event.club.description?.substring(0, 140)}...
                  </p>
                </div>
                <Link to={`/clubs/${event.club._id}`} className="btn btn-secondary btn-sm">
                  View Club
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Registration Card */}
        <div style={{ position: 'sticky', top: '95px' }}>
          <div
            className="glass-card"
            style={{
              padding: '2rem',
              border: isRegistered ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
              boxShadow: isRegistered ? '0 0 25px rgba(16, 185, 129, 0.15)' : 'var(--shadow-md)'
            }}
          >
            {/* Registration Status Banner */}
            {isRegistered ? (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}
              >
                <FiCheckCircle size={32} style={{ color: 'var(--emerald)', marginBottom: '0.5rem' }} />
                <h3 style={{ fontSize: '1.1rem', color: '#34d399', marginBottom: '0.25rem' }}>
                  You're Attending!
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
                  A confirmation notification has been sent to your account inbox.
                </p>
              </div>
            ) : (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Event Registration</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Admission is free for verified students. Reserved tickets are limited.
                </p>
              </div>
            )}

            {/* Capacity Progress Bar */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  color: 'var(--text-dim)',
                  marginBottom: '0.45rem'
                }}
              >
                <span>Seat Reservations</span>
                <strong style={{ color: isFull ? 'var(--rose)' : 'var(--emerald)' }}>
                  {event.registeredCount || 0} / {event.capacity} Filled
                </strong>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
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
            </div>

            {/* Registration Deadline Details */}
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginBottom: '1.75rem',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Registration Deadline:</span>
                <span style={{ fontWeight: 600, color: isDeadlinePassed ? 'var(--rose)' : 'var(--text-main)' }}>
                  {formattedDeadline}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Ticket Price:</span>
                <span style={{ fontWeight: 600, color: 'var(--emerald)' }}>Free (Student ID)</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            {isRegistered ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', cursor: 'default', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: '#10b981' }}
                  disabled
                >
                  <FiCheck /> Registered
                </button>
                <button
                  type="button"
                  onClick={handleCancelRegistration}
                  disabled={actionLoading}
                  className="btn btn-danger btn-sm"
                  style={{ width: '100%' }}
                >
                  {actionLoading ? 'Cancelling...' : 'Cancel Registration'}
                </button>
              </div>
            ) : isPast ? (
              <button type="button" className="btn btn-secondary" style={{ width: '100%' }} disabled>
                Event has Ended
              </button>
            ) : isDeadlinePassed ? (
              <button type="button" className="btn btn-secondary" style={{ width: '100%' }} disabled>
                Registration Deadline Passed
              </button>
            ) : isFull ? (
              <button type="button" className="btn btn-secondary" style={{ width: '100%' }} disabled>
                Event is Full (Waitlist Closed)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRegister}
                disabled={actionLoading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                {actionLoading
                  ? 'Confirming...'
                  : isAuthenticated
                  ? 'Register Now (Instant Confirm)'
                  : 'Log in to Register'}
              </button>
            )}

            {!isAuthenticated && !isPast && !isDeadlinePassed && !isFull && (
              <p
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-dim)',
                  textAlign: 'center',
                  marginTop: '0.85rem'
                }}
              >
                Need an account?{' '}
                <Link to="/register" style={{ color: '#818cf8', fontWeight: 600 }}>
                  Sign up in seconds
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;

