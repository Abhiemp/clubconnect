import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  clubAPI,
  eventAPI,
  announcementAPI,
  registrationAPI
} from '../services/api';
import toast from 'react-hot-toast';
import {
  FiHome, FiCalendar, FiUsers, FiVolume2 as FiMegaphone, FiSettings,
  FiPlus, FiEdit2, FiTrash2, FiEye, FiCheckCircle, FiXCircle,
  FiClock, FiMapPin, FiBarChart2, FiAlertCircle, FiRefreshCw,
  FiX, FiSave, FiChevronDown, FiChevronUp, FiUserX, FiTag
} from 'react-icons/fi';
import { HiSparkles as FiSparkles } from 'react-icons/hi2';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const avatarInitial = (name) => (name?.[0] || '?').toUpperCase();

const avatarStyle = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  background: 'var(--primary)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '0.9rem',
  flexShrink: 0,
};

const statusBadgeStyle = (status) => {
  const map = {
    upcoming:   { background: 'rgba(99,102,241,0.15)',  color: '#6366f1' },
    ongoing:    { background: 'rgba(6,182,212,0.15)',   color: '#06b6d4' },
    completed:  { background: 'rgba(16,185,129,0.15)',  color: '#10b981' },
    cancelled:  { background: 'rgba(244,63,94,0.15)',   color: '#f43f5e' },
    present:    { background: 'rgba(16,185,129,0.15)',  color: '#10b981' },
    absent:     { background: 'rgba(244,63,94,0.15)',   color: '#f43f5e' },
    registered: { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  };
  return {
    ...(map[status] || map.registered),
    borderRadius: '20px',
    padding: '0.25rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    display: 'inline-block',
  };
};

const priorityBadgeStyle = (priority) => {
  const map = {
    low:    { background: 'rgba(148,163,184,0.15)', color: 'var(--text-dim)' },
    normal: { background: 'rgba(99,102,241,0.15)',  color: '#6366f1' },
    high:   { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    urgent: { background: 'rgba(244,63,94,0.15)',   color: '#f43f5e' },
  };
  return {
    ...(map[priority] || map.normal),
    borderRadius: '20px',
    padding: '0.25rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    display: 'inline-block',
    textTransform: 'capitalize',
  };
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'var(--bg-glass)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '10px',
  color: 'var(--text-main)',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.4rem',
  color: 'var(--text-muted)',
  fontSize: '0.85rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '16px',
  padding: '1.5rem',
};

const sectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
};

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
    <div
      style={{
        width: 40,
        height: 40,
        border: '3px solid var(--border-subtle)',
        borderTop: '3px solid var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const EVENT_CATEGORIES = [
  'Technology','AI & Machine Learning','Coding','Robotics','Sports',
  'Music','Dance','Photography','Entrepreneurship','Cultural',
  'Literature','Social Service','Workshop','Hackathon','Seminar',
  'Competition','Meetup','Other',
];

const BLANK_EVENT = {
  title: '',
  description: '',
  category: 'Technology',
  tags: '',
  date: '',
  startTime: '',
  endTime: '',
  venue: '',
  capacity: '',
  registrationDeadline: '',
  image: '',
  eligibility: 'Open to all students',
  status: 'upcoming',
};

const BLANK_ANNOUNCEMENT = {
  title: '',
  content: '',
  priority: 'normal',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClubAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const clubId = user?.managedClub?._id || user?.managedClub;

  const [activeTab, setActiveTab] = useState('overview');

  // ── Overview state
  const [club, setClub]             = useState(null);
  const [clubLoading, setClubLoading] = useState(false);
  const [clubError, setClubError]   = useState('');
  const [showClubEditForm, setShowClubEditForm] = useState(false);
  const [clubForm, setClubForm]     = useState({
    name: '',
    shortDescription: '',
    description: '',
    contactEmail: '',
    tags: '',
    logo: '',
    coverImage: ''
  });
  const [clubSaving, setClubSaving] = useState(false);

  // ── Events state
  const [events, setEvents]           = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent]   = useState(null); // null = create, obj = edit
  const [eventForm, setEventForm]     = useState(BLANK_EVENT);
  const [eventFormErrors, setEventFormErrors] = useState({});
  const [eventSaving, setEventSaving] = useState(false);

  // ── Registrations state
  const [openEventPanel, setOpenEventPanel] = useState(null);
  const [regMap, setRegMap]           = useState({}); // eventId -> { registrations, stats, loading, error }

  // ── Members state
  const [members, setMembers]         = useState([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState('');

  // ── Announcements state
  const [announcements, setAnnouncements]   = useState([]);
  const [annLoading, setAnnLoading]         = useState(false);
  const [annError, setAnnError]             = useState('');
  const [showAnnForm, setShowAnnForm]       = useState(false);
  const [editingAnn, setEditingAnn]         = useState(null);
  const [annForm, setAnnForm]               = useState(BLANK_ANNOUNCEMENT);
  const [annFormErrors, setAnnFormErrors]   = useState({});
  const [annSaving, setAnnSaving]           = useState(false);

  // ─── Auth guard ────────────────────────────────────────────────────────────
  if (!user || (user.role !== 'clubAdmin' && user.role !== 'superAdmin')) {
    return <Navigate to="/" replace />;
  }

  if (!clubId) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...cardStyle, textAlign: 'center', maxWidth: 480 }}>
          <FiAlertCircle size={48} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Club Assigned</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Your account hasn't been assigned to manage any club yet. Please contact a Super Admin.
          </p>
          <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ─── Data Loaders ──────────────────────────────────────────────────────────

  const loadClub = useCallback(async () => {
    setClubLoading(true);
    setClubError('');
    try {
      const res = await clubAPI.getById(clubId);
      setClub(res.data?.club || res.data);
    } catch (err) {
      setClubError(err?.response?.data?.message || 'Failed to load club data.');
    } finally {
      setClubLoading(false);
    }
  }, [clubId]);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError('');
    try {
      const res = await eventAPI.getClubEvents(clubId);
      setEvents(res.data?.events || res.data || []);
    } catch (err) {
      setEventsError(err?.response?.data?.message || 'Failed to load events.');
    } finally {
      setEventsLoading(false);
    }
  }, [clubId]);

  const loadMembers = useCallback(async () => {
    setMembersLoading(true);
    setMembersError('');
    try {
      const res = await clubAPI.getMembers(clubId);
      setMembers(res.data?.members || []);
      setMembersTotal(res.data?.total || res.data?.members?.length || 0);
    } catch (err) {
      setMembersError(err?.response?.data?.message || 'Failed to load members.');
    } finally {
      setMembersLoading(false);
    }
  }, [clubId]);

  const loadAnnouncements = useCallback(async () => {
    setAnnLoading(true);
    setAnnError('');
    try {
      const res = await announcementAPI.getAll({ club: clubId });
      setAnnouncements(res.data?.announcements || res.data || []);
    } catch (err) {
      setAnnError(err?.response?.data?.message || 'Failed to load announcements.');
    } finally {
      setAnnLoading(false);
    }
  }, [clubId]);

  // ─── Tab-triggered loading ─────────────────────────────────────────────────

  useEffect(() => {
    if (activeTab === 'overview') {
      loadClub();
      loadEvents();
    } else if (activeTab === 'events') {
      loadEvents();
    } else if (activeTab === 'registrations') {
      loadEvents();
    } else if (activeTab === 'members') {
      loadMembers();
    } else if (activeTab === 'announcements') {
      loadAnnouncements();
    }
  }, [activeTab]);

  // ─── Club Info Form helpers ────────────────────────────────────────────────

  const openEditClubForm = () => {
    if (club) {
      setClubForm({
        name: club.name || '',
        shortDescription: club.shortDescription || '',
        description: club.description || '',
        contactEmail: club.contactEmail || '',
        tags: Array.isArray(club.tags) ? club.tags.join(', ') : (club.tags || ''),
        logo: club.logo || '',
        coverImage: club.coverImage || club.banner || ''
      });
    }
    setShowClubEditForm(true);
  };

  const closeEditClubForm = () => {
    setShowClubEditForm(false);
  };

  const handleClubSubmit = async (e) => {
    e.preventDefault();
    setClubSaving(true);
    try {
      const payload = {
        ...clubForm,
        tags: clubForm.tags
          ? clubForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : []
      };
      const res = await clubAPI.update(clubId, payload);
      toast.success('Club information updated successfully!');
      setClub(res.data?.club || { ...club, ...payload });
      setShowClubEditForm(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update club information.');
    } finally {
      setClubSaving(false);
    }
  };

  // ─── Event Form helpers ────────────────────────────────────────────────────

  const openCreateEventForm = () => {
    setEditingEvent(null);
    setEventForm(BLANK_EVENT);
    setEventFormErrors({});
    setShowEventForm(true);
  };

  const openEditEventForm = (evt) => {
    setEditingEvent(evt);
    setEventForm({
      title:                evt.title || '',
      description:          evt.description || '',
      category:             evt.category || 'Technology',
      tags:                 Array.isArray(evt.tags) ? evt.tags.join(', ') : (evt.tags || ''),
      date:                 evt.date ? evt.date.split('T')[0] : '',
      startTime:            evt.startTime || '',
      endTime:              evt.endTime || '',
      venue:                evt.venue || '',
      capacity:             evt.capacity || '',
      registrationDeadline: evt.registrationDeadline ? evt.registrationDeadline.split('T')[0] : '',
      image:                evt.image || '',
      eligibility:          evt.eligibility || 'Open to all students',
      status:               evt.status || 'upcoming',
    });
    setEventFormErrors({});
    setShowEventForm(true);
  };

  const closeEventForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    setEventForm(BLANK_EVENT);
    setEventFormErrors({});
  };

  const validateEventForm = () => {
    const errs = {};
    if (!eventForm.title.trim())               errs.title = 'Title is required.';
    if (!eventForm.description.trim())         errs.description = 'Description is required.';
    if (!eventForm.date)                       errs.date = 'Date is required.';
    if (!eventForm.startTime)                  errs.startTime = 'Start time is required.';
    if (!eventForm.endTime)                    errs.endTime = 'End time is required.';
    if (!eventForm.venue.trim())               errs.venue = 'Venue is required.';
    if (!eventForm.capacity || Number(eventForm.capacity) < 1) errs.capacity = 'Capacity must be at least 1.';
    if (!eventForm.registrationDeadline)       errs.registrationDeadline = 'Registration deadline is required.';
    setEventFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (!validateEventForm()) return;
    setEventSaving(true);
    try {
      const payload = {
        ...eventForm,
        club: clubId,
        capacity: Number(eventForm.capacity),
        tags: eventForm.tags
          ? eventForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };
      if (editingEvent) {
        await eventAPI.update(editingEvent._id, payload);
        toast.success('Event updated successfully!');
      } else {
        await eventAPI.create(payload);
        toast.success('Event created successfully!');
      }
      closeEventForm();
      loadEvents();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save event.');
    } finally {
      setEventSaving(false);
    }
  };

  const handleDeleteEvent = async (evt) => {
    if (!window.confirm(`Delete event "${evt.title}"? This cannot be undone.`)) return;
    try {
      await eventAPI.delete(evt._id);
      toast.success('Event deleted.');
      setEvents((prev) => prev.filter((e) => e._id !== evt._id));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete event.');
    }
  };

  // ─── Registrations helpers ─────────────────────────────────────────────────

  const toggleEventPanel = async (eventId) => {
    if (openEventPanel === eventId) {
      setOpenEventPanel(null);
      return;
    }
    setOpenEventPanel(eventId);
    if (!regMap[eventId]) {
      setRegMap((prev) => ({ ...prev, [eventId]: { registrations: [], stats: null, loading: true, error: '' } }));
      try {
        const res = await eventAPI.getRegistrations(eventId);
        setRegMap((prev) => ({
          ...prev,
          [eventId]: {
            registrations: res.data?.registrations || [],
            stats: res.data?.stats || null,
            loading: false,
            error: '',
          },
        }));
      } catch (err) {
        setRegMap((prev) => ({
          ...prev,
          [eventId]: {
            registrations: [],
            stats: null,
            loading: false,
            error: err?.response?.data?.message || 'Failed to load registrations.',
          },
        }));
      }
    }
  };

  const refreshEventRegistrations = async (eventId) => {
    setRegMap((prev) => ({ ...prev, [eventId]: { ...(prev[eventId] || {}), loading: true, error: '' } }));
    try {
      const res = await eventAPI.getRegistrations(eventId);
      setRegMap((prev) => ({
        ...prev,
        [eventId]: {
          registrations: res.data?.registrations || [],
          stats: res.data?.stats || null,
          loading: false,
          error: '',
        },
      }));
    } catch (err) {
      setRegMap((prev) => ({
        ...prev,
        [eventId]: {
          ...(prev[eventId] || {}),
          loading: false,
          error: err?.response?.data?.message || 'Failed to refresh.',
        },
      }));
    }
  };

  const handleMarkAttendance = async (eventId, registrationId, status) => {
    // Optimistic update
    setRegMap((prev) => {
      const current = prev[eventId];
      if (!current) return prev;
      const updatedRegs = current.registrations.map((r) =>
        r._id === registrationId ? { ...r, _prevStatus: r.attendanceStatus, attendanceStatus: status } : r
      );
      return { ...prev, [eventId]: { ...current, registrations: updatedRegs } };
    });

    try {
      await registrationAPI.markAttendance(registrationId, status);
      toast.success(`Marked as ${status}.`);
      // Refresh stats
      refreshEventRegistrations(eventId);
    } catch (err) {
      // Revert optimistic update
      setRegMap((prev) => {
        const current = prev[eventId];
        if (!current) return prev;
        const revertedRegs = current.registrations.map((r) =>
          r._id === registrationId ? { ...r, attendanceStatus: r._prevStatus || 'registered' } : r
        );
        return { ...prev, [eventId]: { ...current, registrations: revertedRegs } };
      });
      toast.error(err?.response?.data?.message || 'Failed to mark attendance.');
    }
  };

  // ─── Members helpers ───────────────────────────────────────────────────────

  const handleRemoveMember = async (member) => {
    const memberId = member.user?._id || member.user;
    if (memberId === user._id) {
      toast.error("You cannot remove yourself from the club.");
      return;
    }
    const memberName = member.user?.name || 'this member';
    if (!window.confirm(`Remove ${memberName} from the club? This action cannot be undone.`)) return;
    try {
      await clubAPI.removeMember(clubId, memberId);
      toast.success(`${memberName} removed from club.`);
      setMembers((prev) => prev.filter((m) => (m.user?._id || m.user) !== memberId));
      setMembersTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove member.');
    }
  };

  // ─── Announcement helpers ──────────────────────────────────────────────────

  const openCreateAnnForm = () => {
    setEditingAnn(null);
    setAnnForm(BLANK_ANNOUNCEMENT);
    setAnnFormErrors({});
    setShowAnnForm(true);
  };

  const openEditAnnForm = (ann) => {
    setEditingAnn(ann);
    setAnnForm({ title: ann.title || '', content: ann.content || '', priority: ann.priority || 'normal' });
    setAnnFormErrors({});
    setShowAnnForm(true);
  };

  const closeAnnForm = () => {
    setShowAnnForm(false);
    setEditingAnn(null);
    setAnnForm(BLANK_ANNOUNCEMENT);
    setAnnFormErrors({});
  };

  const validateAnnForm = () => {
    const errs = {};
    if (!annForm.title.trim())   errs.title = 'Title is required.';
    if (!annForm.content.trim()) errs.content = 'Content is required.';
    setAnnFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAnnSubmit = async (e) => {
    e.preventDefault();
    if (!validateAnnForm()) return;
    setAnnSaving(true);
    try {
      if (editingAnn) {
        const res = await announcementAPI.update(editingAnn._id, { title: annForm.title, content: annForm.content, priority: annForm.priority });
        toast.success('Announcement updated!');
        setAnnouncements((prev) => prev.map((a) => a._id === editingAnn._id ? (res.data?.announcement || res.data) : a));
      } else {
        const res = await announcementAPI.create({ club: clubId, title: annForm.title, content: annForm.content, priority: annForm.priority });
        toast.success('Announcement created!');
        setAnnouncements((prev) => [res.data?.announcement || res.data, ...prev]);
      }
      closeAnnForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save announcement.');
    } finally {
      setAnnSaving(false);
    }
  };

  const handleDeleteAnn = async (ann) => {
    if (!window.confirm(`Delete announcement "${ann.title}"?`)) return;
    try {
      await announcementAPI.delete(ann._id);
      toast.success('Announcement deleted.');
      setAnnouncements((prev) => prev.filter((a) => a._id !== ann._id));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete announcement.');
    }
  };

  // ─── Derived data ──────────────────────────────────────────────────────────

  const upcomingEvents = events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing');
  const totalRegistered = events.reduce((acc, e) => acc + (e.registeredCount || e.registrations?.length || 0), 0);
  const recentEvents = [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  // ─── TABS config ───────────────────────────────────────────────────────────

  const tabs = [
    { id: 'overview',       label: 'Overview',       icon: <FiHome size={15} /> },
    { id: 'events',         label: 'Events',         icon: <FiCalendar size={15} /> },
    { id: 'registrations',  label: 'Registrations',  icon: <FiBarChart2 size={15} /> },
    { id: 'members',        label: 'Members',        icon: <FiUsers size={15} /> },
    { id: 'announcements',  label: 'Announcements',  icon: <FiMegaphone size={15} /> },
  ];

  // ─── Render helpers ────────────────────────────────────────────────────────

  const renderEventForm = () => (
    <div style={{ ...cardStyle, marginBottom: '1.5rem', border: '1px solid var(--primary)' }}>
      <div style={{ ...sectionHeaderStyle, marginBottom: '1.25rem' }}>
        <h3 style={{ color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {editingEvent ? <FiEdit2 size={18} /> : <FiPlus size={18} />}
          {editingEvent ? 'Edit Event' : 'Create New Event'}
        </h3>
        <button
          onClick={closeEventForm}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <FiX size={20} />
        </button>
      </div>

      <form onSubmit={handleEventSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {/* Title */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Title *</label>
            <input
              style={inputStyle}
              type="text"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              placeholder="Event title"
            />
            {eventFormErrors.title && <span style={{ color: '#f43f5e', fontSize: '0.8rem' }}>{eventFormErrors.title}</span>}
          </div>

          {/* Description */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Description *</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
              rows={3}
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              placeholder="Describe your event..."
            />
            {eventFormErrors.description && <span style={{ color: '#f43f5e', fontSize: '0.8rem' }}>{eventFormErrors.description}</span>}
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Category</label>
            <select
              style={inputStyle}
              value={eventForm.category}
              onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
            >
              {EVENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input
              style={inputStyle}
              type="text"
              value={eventForm.tags}
              onChange={(e) => setEventForm({ ...eventForm, tags: e.target.value })}
              placeholder="e.g. AI, Python, Workshop"
            />
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>Date *</label>
            <input
              style={inputStyle}
              type="date"
              value={eventForm.date}
              onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
            />
            {eventFormErrors.date && <span style={{ color: '#f43f5e', fontSize: '0.8rem' }}>{eventFormErrors.date}</span>}
          </div>

          {/* Start Time */}
          <div>
            <label style={labelStyle}>Start Time *</label>
            <input
              style={inputStyle}
              type="time"
              value={eventForm.startTime}
              onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
            />
            {eventFormErrors.startTime && <span style={{ color: '#f43f5e', fontSize: '0.8rem' }}>{eventFormErrors.startTime}</span>}
          </div>

          {/* End Time */}
          <div>
            <label style={labelStyle}>End Time *</label>
            <input
              style={inputStyle}
              type="time"
              value={eventForm.endTime}
              onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
            />
            {eventFormErrors.endTime && <span style={{ color: '#f43f5e', fontSize: '0.8rem' }}>{eventFormErrors.endTime}</span>}
          </div>

          {/* Venue */}
          <div>
            <label style={labelStyle}>Venue *</label>
            <input
              style={inputStyle}
              type="text"
              value={eventForm.venue}
              onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
              placeholder="Location / Room"
            />
            {eventFormErrors.venue && <span style={{ color: '#f43f5e', fontSize: '0.8rem' }}>{eventFormErrors.venue}</span>}
          </div>

          {/* Capacity */}
          <div>
            <label style={labelStyle}>Capacity *</label>
            <input
              style={inputStyle}
              type="number"
              min="1"
              value={eventForm.capacity}
              onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })}
              placeholder="Max participants"
            />
            {eventFormErrors.capacity && <span style={{ color: '#f43f5e', fontSize: '0.8rem' }}>{eventFormErrors.capacity}</span>}
          </div>

          {/* Registration Deadline */}
          <div>
            <label style={labelStyle}>Registration Deadline *</label>
            <input
              style={inputStyle}
              type="date"
              value={eventForm.registrationDeadline}
              onChange={(e) => setEventForm({ ...eventForm, registrationDeadline: e.target.value })}
            />
            {eventFormErrors.registrationDeadline && <span style={{ color: '#f43f5e', fontSize: '0.8rem' }}>{eventFormErrors.registrationDeadline}</span>}
          </div>

          {/* Image URL */}
          <div>
            <label style={labelStyle}>Image URL (optional)</label>
            <input
              style={inputStyle}
              type="text"
              value={eventForm.image}
              onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {/* Eligibility */}
          <div>
            <label style={labelStyle}>Eligibility</label>
            <input
              style={inputStyle}
              type="text"
              value={eventForm.eligibility}
              onChange={(e) => setEventForm({ ...eventForm, eligibility: e.target.value })}
              placeholder="Open to all students"
            />
          </div>

          {/* Status — edit only */}
          {editingEvent && (
            <div>
              <label style={labelStyle}>Status</label>
              <select
                style={inputStyle}
                value={eventForm.status}
                onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
              >
                {['upcoming', 'ongoing', 'completed', 'cancelled'].map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={closeEventForm} disabled={eventSaving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={eventSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {eventSaving ? <><FiRefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><FiSave size={14} /> {editingEvent ? 'Update Event' : 'Create Event'}</>}
          </button>
        </div>
      </form>
    </div>
  );

  const renderAnnForm = () => (
    <div style={{ ...cardStyle, marginBottom: '1.5rem', border: '1px solid var(--primary)' }}>
      <div style={{ ...sectionHeaderStyle, marginBottom: '1.25rem' }}>
        <h3 style={{ color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {editingAnn ? <FiEdit2 size={18} /> : <FiPlus size={18} />}
          {editingAnn ? 'Edit Announcement' : 'New Announcement'}
        </h3>
        <button
          onClick={closeAnnForm}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <FiX size={20} />
        </button>
      </div>

      <form onSubmit={handleAnnSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input
              style={inputStyle}
              type="text"
              value={annForm.title}
              onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
              placeholder="Announcement title"
            />
            {annFormErrors.title && <span style={{ color: '#f43f5e', fontSize: '0.8rem' }}>{annFormErrors.title}</span>}
          </div>

          <div>
            <label style={labelStyle}>Content *</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 110 }}
              rows={4}
              value={annForm.content}
              onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
              placeholder="Write your announcement..."
            />
            {annFormErrors.content && <span style={{ color: '#f43f5e', fontSize: '0.8rem' }}>{annFormErrors.content}</span>}
          </div>

          <div style={{ maxWidth: 220 }}>
            <label style={labelStyle}>Priority</label>
            <select
              style={inputStyle}
              value={annForm.priority}
              onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value })}
            >
              {['low', 'normal', 'high', 'urgent'].map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={closeAnnForm} disabled={annSaving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={annSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {annSaving ? <><FiRefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><FiSave size={14} /> {editingAnn ? 'Update' : 'Post Announcement'}</>}
          </button>
        </div>
      </form>
    </div>
  );

  const renderClubEditForm = () => (
    <div style={{ ...cardStyle, marginBottom: '1.5rem', border: '1px solid var(--primary)' }}>
      <div style={{ ...sectionHeaderStyle, marginBottom: '1.25rem' }}>
        <h3 style={{ color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiSettings size={18} /> Manage Club Information
        </h3>
        <button
          onClick={closeEditClubForm}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <FiX size={20} />
        </button>
      </div>

      <form onSubmit={handleClubSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Club Name *</label>
            <input
              style={inputStyle}
              type="text"
              required
              value={clubForm.name}
              onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>Contact Email</label>
            <input
              style={inputStyle}
              type="email"
              value={clubForm.contactEmail}
              onChange={(e) => setClubForm({ ...clubForm, contactEmail: e.target.value })}
              placeholder="club@college.edu"
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Short Description</label>
            <input
              style={inputStyle}
              type="text"
              value={clubForm.shortDescription}
              onChange={(e) => setClubForm({ ...clubForm, shortDescription: e.target.value })}
              placeholder="Brief tagline for your club"
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Full Description *</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
              rows={3}
              required
              value={clubForm.description}
              onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>Logo URL</label>
            <input
              style={inputStyle}
              type="text"
              value={clubForm.logo}
              onChange={(e) => setClubForm({ ...clubForm, logo: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <label style={labelStyle}>Cover Image URL</label>
            <input
              style={inputStyle}
              type="text"
              value={clubForm.coverImage}
              onChange={(e) => setClubForm({ ...clubForm, coverImage: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input
              style={inputStyle}
              type="text"
              value={clubForm.tags}
              onChange={(e) => setClubForm({ ...clubForm, tags: e.target.value })}
              placeholder="e.g. Coding, Web Development, Hackathon"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={closeEditClubForm} disabled={clubSaving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={clubSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {clubSaving ? <><FiRefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><FiSave size={14} /> Save Club Info</>}
          </button>
        </div>
      </form>
    </div>
  );

  // ─── TAB: OVERVIEW ─────────────────────────────────────────────────────────

  const renderOverview = () => {
    if (clubLoading) return <Spinner />;
    if (clubError) return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <FiAlertCircle size={36} style={{ color: '#f43f5e', marginBottom: '0.75rem' }} />
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{clubError}</p>
        <button className="btn btn-secondary" onClick={loadClub}><FiRefreshCw size={14} style={{ marginRight: '0.4rem' }} />Retry</button>
      </div>
    );

    return (
      <div>
        {showClubEditForm && renderClubEditForm()}

        {/* Club Banner */}
        {club && (
          <div style={{ ...cardStyle, marginBottom: '1.5rem', background: 'var(--grad-primary)', border: 'none', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', borderRadius: 'inherit' }} />
            {(club.coverImage || club.banner) && (
              <img
                src={club.coverImage || club.banner}
                alt="Club Banner"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit', opacity: 0.35 }}
              />
            )}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {club.logo ? (
                <img src={club.logo} alt={club.name} style={{ width: 72, height: 72, borderRadius: '16px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: '16px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiSparkles size={32} color="#fff" />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.6rem', fontFamily: 'var(--font-heading)' }}>{club.name}</h2>
                <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>
                  {club.category} &nbsp;·&nbsp; Managed by {user.name}
                </p>
                {club.description && (
                  <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', maxWidth: 520 }}>
                    {club.description.slice(0, 140)}{club.description.length > 140 ? '…' : ''}
                  </p>
                )}
              </div>
              <div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}
                  onClick={openEditClubForm}
                >
                  <FiEdit2 size={13} /> Edit Club Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Members',   value: club?.members?.length ?? membersTotal ?? members.length ?? 0, icon: <FiUsers size={22} />, color: '#6366f1' },
            { label: 'Total Events',    value: events.length,                               icon: <FiCalendar size={22} />, color: '#06b6d4' },
            { label: 'Upcoming Events', value: upcomingEvents.length,                       icon: <FiClock size={22} />, color: '#10b981' },
            { label: 'Total Registered',value: totalRegistered,                              icon: <FiBarChart2 size={22} />, color: '#f59e0b' },
          ].map((stat) => (
            <div key={stat.label} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: stat.color, background: `${stat.color}22`, padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>{stat.icon}</span>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-main)', marginTop: 0, marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => { setActiveTab('events'); setTimeout(openCreateEventForm, 100); }}
            >
              <FiPlus size={15} /> Create Event
            </button>
            <button
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => { setActiveTab('announcements'); setTimeout(openCreateAnnForm, 100); }}
            >
              <FiMegaphone size={15} /> New Announcement
            </button>
            <button
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => setActiveTab('members')}
            >
              <FiUsers size={15} /> View Members
            </button>
            <button
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={openEditClubForm}
            >
              <FiSettings size={15} /> Edit Club Info
            </button>
          </div>
        </div>

        {/* Recent Events */}
        <div style={cardStyle}>
          <h3 style={{ color: 'var(--text-main)', marginTop: 0, marginBottom: '1rem' }}>Recent Events</h3>
          {eventsLoading ? <Spinner /> : recentEvents.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>No events yet. Create your first event!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentEvents.map((evt) => (
                <div key={evt._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-glass)', borderRadius: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{evt.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <FiCalendar size={12} /> {fmtDate(evt.date)}
                      {evt.venue && <><FiMapPin size={12} style={{ marginLeft: '0.5rem' }} /> {evt.venue}</>}
                    </div>
                  </div>
                  <span style={statusBadgeStyle(evt.status)}>{evt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── TAB: EVENTS ───────────────────────────────────────────────────────────

  const renderEvents = () => (
    <div>
      <div style={sectionHeaderStyle}>
        <h2 style={{ margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiCalendar size={20} /> Event Management
        </h2>
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          onClick={showEventForm ? closeEventForm : openCreateEventForm}
        >
          {showEventForm ? <><FiX size={14} /> Cancel</> : <><FiPlus size={14} /> Create New Event</>}
        </button>
      </div>

      {showEventForm && renderEventForm()}

      {eventsLoading ? <Spinner /> : eventsError ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <FiAlertCircle size={36} style={{ color: '#f43f5e', marginBottom: '0.75rem' }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{eventsError}</p>
          <button className="btn btn-secondary" onClick={loadEvents}><FiRefreshCw size={14} style={{ marginRight: '0.4rem' }} />Retry</button>
        </div>
      ) : events.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <FiCalendar size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Events Yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Create your first event to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map((evt) => (
            <div key={evt._id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {evt.image && (
                <img src={evt.image} alt={evt.title} style={{ width: 64, height: 64, borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1rem' }}>{evt.title}</span>
                  <span style={statusBadgeStyle(evt.status)}>{evt.status}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.9rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiCalendar size={12} />{fmtDate(evt.date)}</span>
                  {evt.venue && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiMapPin size={12} />{evt.venue}</span>}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FiUsers size={12} />
                    {evt.registeredCount ?? evt.registrations?.length ?? 0} / {evt.capacity ?? '?'} seats
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.45rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem' }}
                  onClick={() => { openEditEventForm(evt); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <FiEdit2 size={13} /> Edit
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.45rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem' }}
                  onClick={() => { setActiveTab('registrations'); setTimeout(() => toggleEventPanel(evt._id), 150); }}
                >
                  <FiEye size={13} /> Registrations
                </button>
                <button
                  className="btn btn-danger"
                  style={{ padding: '0.45rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem' }}
                  onClick={() => handleDeleteEvent(evt)}
                >
                  <FiTrash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── TAB: REGISTRATIONS ────────────────────────────────────────────────────

  const renderRegistrations = () => (
    <div>
      <div style={{ ...sectionHeaderStyle }}>
        <h2 style={{ margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiBarChart2 size={20} /> Registration Management
        </h2>
      </div>

      {eventsLoading ? <Spinner /> : events.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <FiBarChart2 size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>No events available. Create an event first.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map((evt) => {
            const panel = regMap[evt._id];
            const isOpen = openEventPanel === evt._id;
            return (
              <div key={evt._id} style={cardStyle}>
                {/* Accordion Header */}
                <button
                  onClick={() => toggleEventPanel(evt._id)}
                  style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1rem' }}>{evt.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                        <span><FiCalendar size={11} /> {fmtDate(evt.date)}</span>
                        {evt.venue && <span><FiMapPin size={11} /> {evt.venue}</span>}
                        <span><FiUsers size={11} /> {evt.registeredCount ?? evt.registrations?.length ?? 0} / {evt.capacity ?? '?'} seats</span>
                      </div>
                    </div>
                    <span style={statusBadgeStyle(evt.status)}>{evt.status}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '1rem' }}>
                    {isOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                  </span>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                    {panel?.loading ? <Spinner /> : panel?.error ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                        <FiAlertCircle size={28} style={{ color: '#f43f5e', marginBottom: '0.5rem' }} />
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{panel.error}</p>
                        <button className="btn btn-secondary" onClick={() => refreshEventRegistrations(evt._id)}>
                          <FiRefreshCw size={13} style={{ marginRight: '0.4rem' }} /> Retry
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Stats row */}
                        {panel?.stats && (
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                            {[
                              { label: 'Registered', value: panel.stats.totalRegistered ?? 0, color: '#f59e0b' },
                              { label: 'Present',    value: panel.stats.totalPresent ?? 0,    color: '#10b981' },
                              { label: 'Absent',     value: panel.stats.totalAbsent ?? 0,     color: '#f43f5e' },
                              { label: 'Attendance', value: `${panel.stats.attendanceRate ?? 0}%`, color: '#6366f1' },
                            ].map((s) => (
                              <div key={s.label} style={{ background: 'var(--bg-glass)', borderRadius: '12px', padding: '0.75rem 1.25rem', textAlign: 'center', minWidth: 110 }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.label}</div>
                              </div>
                            ))}
                            <button
                              onClick={() => refreshEventRegistrations(evt._id)}
                              className="btn btn-secondary"
                              style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                            >
                              <FiRefreshCw size={13} /> Refresh
                            </button>
                          </div>
                        )}

                        {/* Registration table */}
                        {!panel?.registrations?.length ? (
                          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>No registrations for this event yet.</p>
                        ) : (
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                              <thead>
                                <tr>
                                  {['Student', 'Email', 'Registered On', 'Status', 'Actions'].map((h) => (
                                    <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid var(--border-subtle)', letterSpacing: '0.04em' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {panel.registrations.map((reg) => {
                                  const studentName = reg.user?.name || reg.student?.name || 'Unknown';
                                  const studentEmail = reg.user?.email || reg.student?.email || '—';
                                  const attStatus = reg.attendanceStatus || 'registered';
                                  return (
                                    <tr key={reg._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                      <td style={{ padding: '0.7rem 0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                          <div style={avatarStyle}>{avatarInitial(studentName)}</div>
                                          <span style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem' }}>{studentName}</span>
                                        </div>
                                      </td>
                                      <td style={{ padding: '0.7rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{studentEmail}</td>
                                      <td style={{ padding: '0.7rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{fmtDate(reg.createdAt || reg.registeredAt)}</td>
                                      <td style={{ padding: '0.7rem 0.75rem' }}>
                                        <span style={statusBadgeStyle(attStatus)}>{attStatus}</span>
                                      </td>
                                      <td style={{ padding: '0.7rem 0.75rem' }}>
                                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                          <button
                                            disabled={attStatus === 'present'}
                                            onClick={() => handleMarkAttendance(evt._id, reg._id, 'present')}
                                            style={{ background: attStatus === 'present' ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '0.3rem 0.65rem', cursor: attStatus === 'present' ? 'default' : 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                          >
                                            <FiCheckCircle size={12} /> Present
                                          </button>
                                          <button
                                            disabled={attStatus === 'absent'}
                                            onClick={() => handleMarkAttendance(evt._id, reg._id, 'absent')}
                                            style={{ background: attStatus === 'absent' ? 'rgba(244,63,94,0.25)' : 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', padding: '0.3rem 0.65rem', cursor: attStatus === 'absent' ? 'default' : 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                          >
                                            <FiXCircle size={12} /> Absent
                                          </button>
                                          <button
                                            disabled={attStatus === 'registered'}
                                            onClick={() => handleMarkAttendance(evt._id, reg._id, 'registered')}
                                            style={{ background: attStatus === 'registered' ? 'rgba(148,163,184,0.25)' : 'rgba(148,163,184,0.1)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.3rem 0.65rem', cursor: attStatus === 'registered' ? 'default' : 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                          >
                                            <FiRefreshCw size={12} /> Reset
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ─── TAB: MEMBERS ──────────────────────────────────────────────────────────

  const renderMembers = () => (
    <div>
      <div style={sectionHeaderStyle}>
        <h2 style={{ margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiUsers size={20} /> Member Management
        </h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {membersTotal} member{membersTotal !== 1 ? 's' : ''}
        </span>
      </div>

      {membersLoading ? <Spinner /> : membersError ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <FiAlertCircle size={36} style={{ color: '#f43f5e', marginBottom: '0.75rem' }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{membersError}</p>
          <button className="btn btn-secondary" onClick={loadMembers}><FiRefreshCw size={14} style={{ marginRight: '0.4rem' }} />Retry</button>
        </div>
      ) : members.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <FiUsers size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Members Yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Students who join the club will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {members.map((member, idx) => {
            const memberUser = member.user || member;
            const memberId = memberUser?._id;
            const isYou = memberId === user._id;
            return (
              <div key={memberId || idx} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '1rem 1.25rem' }}>
                <div style={{ ...avatarStyle, width: 46, height: 46, fontSize: '1.1rem', flexShrink: 0 }}>
                  {memberUser?.avatar
                    ? <img src={memberUser.avatar} alt={memberUser.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : avatarInitial(memberUser?.name)
                  }
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ color: 'var(--text-main)', fontWeight: 700 }}>
                    {memberUser?.name || 'Unknown'}
                    {isYou && <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', background: 'rgba(99,102,241,0.15)', color: '#6366f1', borderRadius: '8px', padding: '0.1rem 0.45rem', fontWeight: 600 }}>You (Admin)</span>}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginTop: '0.15rem' }}>{memberUser?.email || '—'}</div>
                  {member.joinedAt && (
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.77rem', marginTop: '0.15rem' }}>
                      Joined {fmtDate(member.joinedAt)}
                    </div>
                  )}
                </div>
                {!isYou && (
                  <button
                    className="btn btn-danger"
                    style={{ padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}
                    onClick={() => handleRemoveMember(member)}
                  >
                    <FiUserX size={13} /> Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ─── TAB: ANNOUNCEMENTS ────────────────────────────────────────────────────

  const renderAnnouncements = () => (
    <div>
      <div style={sectionHeaderStyle}>
        <h2 style={{ margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiMegaphone size={20} /> Announcements
        </h2>
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          onClick={showAnnForm ? closeAnnForm : openCreateAnnForm}
        >
          {showAnnForm ? <><FiX size={14} /> Cancel</> : <><FiPlus size={14} /> New Announcement</>}
        </button>
      </div>

      {showAnnForm && renderAnnForm()}

      {annLoading ? <Spinner /> : annError ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <FiAlertCircle size={36} style={{ color: '#f43f5e', marginBottom: '0.75rem' }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{annError}</p>
          <button className="btn btn-secondary" onClick={loadAnnouncements}><FiRefreshCw size={14} style={{ marginRight: '0.4rem' }} />Retry</button>
        </div>
      ) : announcements.length === 0 && !showAnnForm ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <FiMegaphone size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Announcements</h3>
          <p style={{ color: 'var(--text-muted)' }}>Post an announcement to keep your members informed.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {announcements.map((ann) => (
            <div key={ann._id} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1rem' }}>{ann.title}</span>
                    <span style={priorityBadgeStyle(ann.priority)}>{ann.priority}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 0.5rem', lineHeight: 1.55 }}>
                    {ann.content?.slice(0, 150)}{ann.content?.length > 150 ? '…' : ''}
                  </p>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.77rem' }}>
                    <FiClock size={11} style={{ marginRight: '0.3rem' }} />
                    {fmtDate(ann.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem' }}
                    onClick={() => { openEditAnnForm(ann); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >
                    <FiEdit2 size={13} /> Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem' }}
                    onClick={() => handleDeleteAnn(ann)}
                  >
                    <FiTrash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0f0f1a)', fontFamily: 'var(--font-body)' }}>
      {/* Page Header */}
      <div style={{ background: 'var(--bg-glass)', borderBottom: '1px solid var(--border-subtle)', padding: '1.25rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiSparkles size={22} style={{ color: 'var(--primary)' }} />
              Club Admin Dashboard
            </h1>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Welcome back, <strong style={{ color: 'var(--text-main)' }}>{user.name}</strong>
            </p>
          </div>
          <Link to="/" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <FiHome size={14} /> Back to Home
          </Link>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem', maxWidth: 1200 }}>
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={
                activeTab === tab.id
                  ? { background: 'var(--primary)', color: '#fff', borderRadius: '10px', padding: '0.55rem 1.1rem', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', transition: 'all 0.2s' }
                  : { background: 'transparent', color: 'var(--text-muted)', borderRadius: '10px', padding: '0.55rem 1.1rem', border: '1px solid transparent', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', transition: 'all 0.2s' }
              }
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview'       && renderOverview()}
          {activeTab === 'events'         && renderEvents()}
          {activeTab === 'registrations'  && renderRegistrations()}
          {activeTab === 'members'        && renderMembers()}
          {activeTab === 'announcements'  && renderAnnouncements()}
        </div>
      </div>
    </div>
  );
}
