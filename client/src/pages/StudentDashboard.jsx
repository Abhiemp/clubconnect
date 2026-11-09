import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  registrationAPI,
  clubAPI,
  userAPI,
  recommendationAPI,
  notificationAPI,
  eventAPI
} from '../services/api';
import EventCard from '../components/EventCard';
import ClubCard from '../components/ClubCard';
import InterestSelector from '../components/InterestSelector';
import toast from 'react-hot-toast';
import {
  FiCalendar,
  FiCompass,
  FiBookmark,
  FiBell,
  FiUser,
  FiSliders,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiRefreshCw,
  FiInfo,
  FiAlertCircle
} from 'react-icons/fi';
import { HiSparkles as FiSparkles } from 'react-icons/hi2';

const StudentDashboard = ({ defaultTab = 'registrations' }) => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);
  const [loading, setLoading] = useState(true);

  // Data states
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Modals
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [regRes, profileRes, savedRes, recRes, notifRes] = await Promise.allSettled([
        registrationAPI.getMyEvents(),
        userAPI.getProfile(),
        userAPI.getSavedEvents(),
        recommendationAPI.getEvents(),
        notificationAPI.getAll({ limit: 10 })
      ]);

      if (regRes.status === 'fulfilled' && regRes.value?.data?.registrations) {
        setMyRegistrations(regRes.value.data.registrations);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value?.data?.user) {
        const u = profileRes.value.data.user;
        setJoinedClubs(u.joinedClubs || []);
      }
      if (savedRes.status === 'fulfilled' && savedRes.value?.data?.events) {
        setSavedEvents(savedRes.value.data.events);
      }
      if (recRes.status === 'fulfilled' && recRes.value?.data?.events) {
        setRecommendedEvents(recRes.value.data.events);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value?.data) {
        setNotifications(notifRes.value.data.notifications || []);
        setUnreadNotifications(notifRes.value.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error loading dashboard data', err);
      toast.error('Could not refresh all dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Cancel event registration
  const handleCancelRegistration = async (eventId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this event registration?')) {
      return;
    }

    setCancellingId(eventId);
    try {
      const res = await eventAPI.cancelRegistration(eventId);
      if (res.data?.success) {
        toast.success('Registration cancelled successfully');
        setMyRegistrations((prev) =>
          prev.filter((r) => {
            const id = typeof r.event === 'string' ? r.event : r.event?._id;
            return id !== eventId;
          })
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel registration');
    } finally {
      setCancellingId(null);
    }
  };

  // Leave club
  const handleLeaveClub = async (clubId, clubName, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Leave ${clubName}?`)) return;

    try {
      const res = await clubAPI.leave(clubId);
      if (res.data?.success) {
        toast.success(`You have left ${clubName}`);
        setJoinedClubs((prev) => prev.filter((c) => c._id !== clubId));
        updateUser({
          joinedClubs: (user?.joinedClubs || []).filter(
            (id) => (typeof id === 'string' ? id : id?._id) !== clubId
          )
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave club');
    }
  };

  // Unsave event
  const handleUnsaveEvent = async (eventId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await userAPI.toggleSaveEvent(eventId);
      if (res.data?.success) {
        toast.success('Event removed from saved list');
        setSavedEvents((prev) => prev.filter((ev) => ev._id !== eventId));
        updateUser({
          savedEvents: (user?.savedEvents || []).filter(
            (id) => (typeof id === 'string' ? id : id?._id) !== eventId
          )
        });
      }
    } catch (err) {
      toast.error('Failed to update bookmarks');
    }
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
      setUnreadNotifications(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to update notifications');
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Welcome Banner Card */}
      <div
        className="glass-card"
        style={{
          padding: '2.25rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(236, 72, 153, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#ffffff',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
              flexShrink: 0
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-primary">Student Member</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{currentDate}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', margin: '0 0 0.35rem' }}>
              Welcome back, {user?.name || 'Student'}! 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
              Track your registered events, club activities, bookmarks, and personalized recommendations.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setInterestModalOpen(true)}
            className="btn btn-secondary btn-sm"
          >
            <FiSliders /> Customize Interests
          </button>
          <Link to="/profile" className="btn btn-secondary btn-sm">
            <FiUser /> Edit Profile
          </Link>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="btn btn-secondary btn-sm"
            title="Refresh dashboard"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}
      >
        {/* Stat 1: Registered Events */}
        <div
          className="glass-card"
          onClick={() => setActiveTab('registrations')}
          style={{
            padding: '1.5rem',
            cursor: 'pointer',
            borderColor: activeTab === 'registrations' ? 'var(--primary)' : 'var(--border-subtle)',
            background: activeTab === 'registrations' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Registered Events
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FiCalendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {myRegistrations.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#818cf8', marginTop: '0.25rem' }}>
            Confirmed passes
          </div>
        </div>

        {/* Stat 2: Joined Clubs */}
        <div
          className="glass-card"
          onClick={() => setActiveTab('clubs')}
          style={{
            padding: '1.5rem',
            cursor: 'pointer',
            borderColor: activeTab === 'clubs' ? 'var(--accent)' : 'var(--border-subtle)',
            background: activeTab === 'clubs' ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Joined Clubs
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FiCompass size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {joinedClubs.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#22d3ee', marginTop: '0.25rem' }}>
            Active memberships
          </div>
        </div>

        {/* Stat 3: Saved Events */}
        <div
          className="glass-card"
          onClick={() => setActiveTab('saved')}
          style={{
            padding: '1.5rem',
            cursor: 'pointer',
            borderColor: activeTab === 'saved' ? 'var(--pink)' : 'var(--border-subtle)',
            background: activeTab === 'saved' ? 'rgba(236, 72, 153, 0.1)' : 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Bookmarked
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(236, 72, 153, 0.15)',
                color: 'var(--pink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FiBookmark size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {savedEvents.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#f472b6', marginTop: '0.25rem' }}>
            Saved for later
          </div>
        </div>

        {/* Stat 4: Notifications */}
        <div
          className="glass-card"
          onClick={() => setActiveTab('notifications')}
          style={{
            padding: '1.5rem',
            cursor: 'pointer',
            borderColor: activeTab === 'notifications' ? 'var(--amber)' : 'var(--border-subtle)',
            background: activeTab === 'notifications' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Updates & Alerts
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FiBell size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {unreadNotifications}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#fbbf24', marginTop: '0.25rem' }}>
            Unread notifications
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.65rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.5rem',
          marginBottom: '2rem',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}
      >
        {[
          { id: 'registrations', label: 'My Registrations', count: myRegistrations.length, icon: FiCalendar },
          { id: 'clubs', label: 'Joined Clubs', count: joinedClubs.length, icon: FiCompass },
          { id: 'saved', label: 'Saved Bookmarks', count: savedEvents.length, icon: FiBookmark },
          { id: 'recommendations', label: 'Recommended For You', count: recommendedEvents.length, icon: FiSparkles },
          { id: 'notifications', label: 'Alerts', count: unreadNotifications, icon: FiBell }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: 'none',
                background: isActive ? 'var(--bg-glass-strong)' : 'transparent',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                padding: '0.65rem 1.15rem',
                fontSize: '0.92rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                transition: 'var(--transition)'
              }}
            >
              <Icon size={16} style={{ color: isActive ? 'var(--primary)' : 'inherit' }} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  style={{
                    background: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    padding: '0.1rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: My Registered Events */}
      {activeTab === 'registrations' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Events You're Registered For</h2>
            <Link to="/events" className="btn btn-primary btn-sm">
              <FiCalendar /> Browse More Events
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading registrations...
            </div>
          ) : myRegistrations.length === 0 ? (
            <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  color: 'var(--primary)'
                }}
              >
                <FiCalendar size={28} />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>No registrations yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                You have not registered for any events yet. Check out upcoming workshops, competitions, and seminars!
              </p>
              <Link to="/events" className="btn btn-primary">
                Explore Campus Events <FiArrowRight />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {myRegistrations.map((reg) => {
                const event = reg.event;
                if (!event) return null;
                const eventDate = new Date(event.date);
                const isPast = eventDate < new Date() || event.status === 'completed';

                return (
                  <div
                    key={reg._id}
                    className="glass-card"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flex: '1 1 350px' }}>
                      <div
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: 'var(--radius-md)',
                          background: '#161d2f',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200'}
                          alt={event.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span className="badge badge-success">
                            <FiCheckCircle size={12} /> {reg.attendanceStatus || 'Registered'}
                          </span>
                          <span className="badge badge-secondary">{event.category || 'Event'}</span>
                          {isPast && <span className="badge badge-warning">Past Event</span>}
                        </div>
                        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>
                          <Link to={`/events/${event._id}`} style={{ color: 'inherit' }}>
                            {event.title}
                          </Link>
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <FiClock size={13} /> {eventDate.toLocaleDateString()} &middot; {event.startTime || 'TBA'}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <FiMapPin size={13} /> {event.venue || 'Campus Hall'}
                          </span>
                          {event.club && (
                            <span style={{ color: '#818cf8', fontWeight: 600 }}>
                              {event.club.name || 'Organizer Club'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Link to={`/events/${event._id}`} className="btn btn-secondary btn-sm">
                        View Details
                      </Link>
                      {!isPast && (
                        <button
                          type="button"
                          onClick={(e) => handleCancelRegistration(event._id, e)}
                          disabled={cancellingId === event._id}
                          className="btn btn-danger btn-sm"
                        >
                          {cancellingId === event._id ? 'Cancelling...' : 'Cancel Registration'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Joined Clubs */}
      {activeTab === 'clubs' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Clubs You Belong To</h2>
            <Link to="/clubs" className="btn btn-primary btn-sm">
              <FiCompass /> Discover More Clubs
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading joined clubs...
            </div>
          ) : joinedClubs.length === 0 ? (
            <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  color: 'var(--accent)'
                }}
              >
                <FiCompass size={28} />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>You haven't joined any clubs yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                Join student clubs to collaborate on projects, participate in internal workshops, and receive exclusive announcements!
              </p>
              <Link to="/clubs" className="btn btn-primary">
                Explore Student Clubs <FiArrowRight />
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.75rem'
              }}
            >
              {joinedClubs.map((club) => (
                <div key={club._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--grad-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.35rem',
                        fontWeight: 700,
                        color: '#fff',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}
                    >
                      {club.logo ? (
                        <img src={club.logo} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        club.name?.charAt(0) || 'C'
                      )}
                    </div>
                    <div>
                      <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                        {club.category}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', margin: '0.25rem 0 0' }}>
                        <Link to={`/clubs/${club._id}`} style={{ color: 'inherit' }}>
                          {club.name}
                        </Link>
                      </h3>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem', flex: 1 }}>
                    {club.description?.substring(0, 110)}...
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <Link to={`/clubs/${club._id}`} className="btn btn-secondary btn-sm">
                      View Society
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => handleLeaveClub(club._id, club.name, e)}
                      className="btn btn-danger btn-sm"
                    >
                      Leave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Saved / Bookmarked Events */}
      {activeTab === 'saved' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Your Bookmarked Events</h2>
            <Link to="/events" className="btn btn-primary btn-sm">
              <FiCalendar /> Browse Events
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading saved events...
            </div>
          ) : savedEvents.length === 0 ? (
            <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(236, 72, 153, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  color: 'var(--pink)'
                }}
              >
                <FiBookmark size={28} />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>No bookmarked events</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                Click the bookmark icon on any event card to save it here for quick access later!
              </p>
              <Link to="/events" className="btn btn-primary">
                Browse Events <FiArrowRight />
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.75rem'
              }}
            >
              {savedEvents.map((ev) => (
                <div key={ev._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem', position: 'relative' }}>
                    <img
                      src={ev.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'}
                      alt={ev.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <button
                        type="button"
                        onClick={(e) => handleUnsaveEvent(ev._id, e)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        title="Remove bookmark"
                      >
                        <FiBookmark style={{ fill: 'var(--pink)', color: 'var(--pink)' }} /> Remove
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>
                    <Link to={`/events/${ev._id}`} style={{ color: 'inherit' }}>
                      {ev.title}
                    </Link>
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
                    📅 {new Date(ev.date).toLocaleDateString()} {ev.club?.name ? `· ${ev.club.name}` : ''}
                  </div>

                  <Link to={`/events/${ev._id}`} className="btn btn-primary btn-sm" style={{ marginTop: 'auto' }}>
                    View & Register <FiArrowRight />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Recommended Events */}
      {activeTab === 'recommendations' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>AI Recommendations For You</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Matched based on: {user?.interests?.length ? user.interests.join(', ') : 'No interests set'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setInterestModalOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              <FiSliders /> Edit Interests
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Calculating personalized matches...
            </div>
          ) : recommendedEvents.length === 0 ? (
            <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <FiSparkles size={40} style={{ color: 'var(--pink)', marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Update your interests for recommendations</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                Select topics you're curious about to receive content-matched campus events.
              </p>
              <button
                type="button"
                onClick={() => setInterestModalOpen(true)}
                className="btn btn-primary"
              >
                Select Interests
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.75rem'
              }}
            >
              {recommendedEvents.map(({ event, matchPercentage, matchingInterests, reason }) => (
                <EventCard
                  key={event._id}
                  event={event}
                  matchPercentage={matchPercentage}
                  matchingInterests={matchingInterests}
                  recommendationReason={reason}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Notifications */}
      {activeTab === 'notifications' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Alerts & Activity Feed</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Announcements from your joined clubs and event registration receipts.
              </p>
            </div>
            {unreadNotifications > 0 && (
              <button
                type="button"
                onClick={handleMarkAllNotificationsRead}
                className="btn btn-secondary btn-sm"
              >
                <FiCheckCircle /> Mark All as Read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <FiBell size={36} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
              <p>No notifications on record.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {notifications.map((n) => {
                const isRead = n.read || n.isRead;
                return (
                  <div
                    key={n._id}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid',
                      borderColor: isRead ? 'var(--border-subtle)' : 'rgba(99, 102, 241, 0.3)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem'
                    }}
                  >
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: isRead ? 'transparent' : 'var(--primary)',
                        marginTop: '0.45rem',
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: isRead ? 500 : 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                        {new Date(n.createdAt).toLocaleDateString()} at{' '}
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Global Interest Selector Modal */}
      <InterestSelector
        isOpen={interestModalOpen}
        onClose={() => {
          setInterestModalOpen(false);
          fetchDashboardData();
        }}
      />
    </div>
  );
};

export default StudentDashboard;
