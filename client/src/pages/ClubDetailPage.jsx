import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clubAPI, eventAPI, announcementAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import toast from 'react-hot-toast';
import {
  FiUsers,
  FiCalendar,
  FiMail,
  FiGlobe,
  FiCheck,
  FiPlus,
  FiVolume2,
  FiInfo,
  FiArrowLeft
} from 'react-icons/fi';

const ClubDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated, updateUser } = useAuth();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('events');
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);

  useEffect(() => {
    const fetchClubData = async () => {
      setLoading(true);
      try {
        const [clubRes, eventsRes, announcementsRes] = await Promise.allSettled([
          clubAPI.getById(id),
          eventAPI.getClubEvents(id),
          announcementAPI.getAll({ club: id })
        ]);

        if (clubRes.status === 'fulfilled' && clubRes.value?.data?.club) {
          const clubData = clubRes.value.data.club;
          setClub(clubData);
          setIsMember(
            clubData.members?.some(m => (typeof m === 'string' ? m : m?._id || m?.user) === user?._id)
          );
        }
        if (eventsRes.status === 'fulfilled' && eventsRes.value?.data?.events) {
          setEvents(eventsRes.value.data.events);
        }
        if (announcementsRes.status === 'fulfilled' && announcementsRes.value?.data?.announcements) {
          setAnnouncements(announcementsRes.value.data.announcements);
        }
      } catch (err) {
        console.error('Error fetching club details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClubData();
  }, [id, user?._id]);

  const handleJoinLeave = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to join clubs');
      return;
    }
    setMembershipLoading(true);
    try {
      if (isMember) {
        await clubAPI.leave(id);
        setIsMember(false);
        setClub(prev => ({
          ...prev,
          members: (prev.members || []).filter(m => (typeof m === 'string' ? m : m?._id || m?.user) !== user?._id)
        }));
        if (updateUser && user) {
          updateUser({
            joinedClubs: (user.joinedClubs || []).filter(
              cId => (typeof cId === 'string' ? cId : cId?._id) !== id
            )
          });
        }
        toast.success(`You have left ${club.name}`);
      } else {
        await clubAPI.join(id);
        setIsMember(true);
        setClub(prev => ({
          ...prev,
          members: [...(prev.members || []), user?._id]
        }));
        if (updateUser && user) {
          updateUser({
            joinedClubs: [...(user.joinedClubs || []), id]
          });
        }
        toast.success(`Welcome to ${club.name}!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update membership');
    } finally {
      setMembershipLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div>Loading club details...</div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Club Not Found</h2>
        <Link to="/clubs" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Directory
        </Link>
      </div>
    );
  }

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date() && e.status === 'upcoming');
  const pastEvents = events.filter(e => new Date(e.date) < new Date() || e.status === 'completed');

  return (
    <div>
      {/* Back Link */}
      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <Link to="/clubs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          <FiArrowLeft /> Back to all clubs
        </Link>
      </div>

      {/* Banner & Header */}
      <div style={{ position: 'relative', marginTop: '1rem' }}>
        <div
          style={{
            height: '240px',
            width: '100%',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <img
            src={club.banner || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80'}
            alt={club.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
          />
        </div>

        <div className="container" style={{ position: 'relative', marginTop: '-60px', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2rem',
              alignItems: 'flex-end',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <img
                src={club.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={club.name}
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: 'var(--radius-lg)',
                  objectFit: 'cover',
                  border: '4px solid #121829',
                  background: '#121829',
                  boxShadow: 'var(--shadow-lg)'
                }}
              />
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>
                  {club.category}
                </span>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                  {club.name}
                </h1>
                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.4rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FiUsers style={{ color: 'var(--primary)' }} /> {club.members?.length || 0} Members
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FiCalendar style={{ color: 'var(--accent)' }} /> {events.length} Total Events
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleJoinLeave}
                disabled={membershipLoading}
                className={`btn btn-lg ${isMember ? 'btn-secondary' : 'btn-primary'}`}
              >
                {isMember ? (
                  <>
                    <FiCheck style={{ color: 'var(--emerald)' }} /> Member (Click to Leave)
                  </>
                ) : (
                  <>
                    <FiPlus /> Join This Club
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="container">
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '2.5rem'
          }}
        >
          <button
            onClick={() => setActiveTab('events')}
            style={{
              padding: '0.85rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'events' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'events' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            style={{
              padding: '0.85rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'announcements' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'announcements' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            Announcements ({announcements.length})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            style={{
              padding: '0.85rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'about' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'about' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            About & Leadership
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'events' && (
          <div>
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                Upcoming Events ({upcomingEvents.length})
              </h3>
              {upcomingEvents.length === 0 ? (
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No upcoming activities scheduled at this moment. Stay tuned!
                </div>
              ) : (
                <div className="grid-cards">
                  {upcomingEvents.map(event => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              )}
            </div>

            {pastEvents.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-muted)' }}>
                  Past Activities ({pastEvents.length})
                </h3>
                <div className="grid-cards">
                  {pastEvents.map(event => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'announcements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px' }}>
            {announcements.length === 0 ? (
              <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FiVolume2 size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                <p>No club announcements published yet.</p>
              </div>
            ) : (
              announcements.map((a) => (
                <div key={a._id} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{a.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                    {a.content}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>About Our Club</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {club.description}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Leadership & Contact</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <div>
                  <strong style={{ color: '#fff' }}>Club President / Organizer:</strong>
                  <div>{club.admin?.name || 'Club Lead'}</div>
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>Official Email:</strong>
                  <div>{club.email || club.admin?.email || 'contact@club.edu'}</div>
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>Meeting Schedule:</strong>
                  <div>Weekly campus syncs & project rooms</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDetailPage;
