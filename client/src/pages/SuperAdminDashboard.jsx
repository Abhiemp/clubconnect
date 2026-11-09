import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  adminAPI,
  clubAPI,
  eventAPI,
  announcementAPI
} from '../services/api';
import toast from 'react-hot-toast';
import {
  FiShield, FiUsers, FiCompass, FiCalendar, FiVolume2 as FiMegaphone,
  FiHome, FiPlus, FiEdit2, FiTrash2, FiEye, FiCheckCircle, FiXCircle,
  FiClock, FiMapPin, FiBarChart2, FiAlertCircle, FiRefreshCw, FiSearch,
  FiFilter, FiX, FiSave, FiChevronDown, FiChevronUp, FiTag, FiStar,
  FiLock, FiUnlock, FiUserCheck, FiUserX
} from 'react-icons/fi';
import { HiSparkles as FiSparkles } from 'react-icons/hi2';

// ─── Helpers & Styles ──────────────────────────────────────────────────────────

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '—';
  }
};

const fmtDateTime = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '—';
  }
};

const avatarInitial = (name) => (name?.[0] || '?').toUpperCase();

const avatarStyle = (bg = 'var(--primary)') => ({
  width: 38,
  height: 38,
  borderRadius: '50%',
  background: bg,
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '0.9rem',
  flexShrink: 0,
});

const statusBadgeStyle = (status) => {
  const map = {
    active:     { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
    inactive:   { background: 'rgba(244,63,94,0.15)',  color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)' },
    pending:    { background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
    upcoming:   { background: 'rgba(99,102,241,0.15)',  color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' },
    ongoing:    { background: 'rgba(6,182,212,0.15)',   color: '#22d3ee', border: '1px solid rgba(6,182,212,0.3)' },
    completed:  { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' },
    cancelled:  { background: 'rgba(244,63,94,0.15)',  color: '#fb7185', border: '1px solid rgba(244,63,94,0.3)' },
    present:    { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
    absent:     { background: 'rgba(244,63,94,0.15)',  color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)' },
    registered: { background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
  };
  return {
    ...(map[status] || map.registered),
    borderRadius: '20px',
    padding: '0.25rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    textTransform: 'capitalize',
  };
};

const priorityBadgeStyle = (priority) => {
  const map = {
    low:    { background: 'rgba(148,163,184,0.15)', color: 'var(--text-dim)', border: '1px solid rgba(148,163,184,0.25)' },
    normal: { background: 'rgba(99,102,241,0.15)',  color: '#818cf8',         border: '1px solid rgba(99,102,241,0.3)' },
    high:   { background: 'rgba(245,158,11,0.15)', color: '#fbbf24',         border: '1px solid rgba(245,158,11,0.3)' },
    urgent: { background: 'rgba(244,63,94,0.15)',   color: '#fb7185',         border: '1px solid rgba(244,63,94,0.3)' },
  };
  return {
    ...(map[priority] || map.normal),
    borderRadius: '20px',
    padding: '0.2rem 0.7rem',
    fontSize: '0.72rem',
    fontWeight: 700,
    display: 'inline-block',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  };
};

const roleBadgeStyle = (role) => {
  const map = {
    superAdmin: { background: 'rgba(244,63,94,0.18)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.35)' },
    clubAdmin:  { background: 'rgba(6,182,212,0.18)',  color: '#22d3ee', border: '1px solid rgba(6,182,212,0.35)' },
    student:    { background: 'rgba(99,102,241,0.18)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.35)' },
  };
  return {
    ...(map[role] || map.student),
    borderRadius: '12px',
    padding: '0.25rem 0.65rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    textTransform: 'capitalize'
  };
};

const inputStyle = {
  width: '100%',
  padding: '0.7rem 0.95rem',
  background: 'var(--bg-glass)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '10px',
  color: 'var(--text-main)',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.4rem',
  color: 'var(--text-muted)',
  fontSize: '0.8rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '16px',
  padding: '1.5rem',
  backdropFilter: 'blur(12px)',
};

const CLUB_CATEGORIES = [
  'Technology', 'AI & Machine Learning', 'Coding', 'Robotics',
  'Sports', 'Music', 'Dance', 'Photography',
  'Entrepreneurship', 'Cultural', 'Literature', 'Social Service'
];

const Spinner = ({ size = 36, text = '' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem 1rem', gap: '0.85rem' }}>
    <div
      style={{
        width: size,
        height: size,
        border: '3px solid var(--border-subtle)',
        borderTop: '3px solid var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    {text && <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{text}</span>}
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const EmptyState = ({ icon: Icon = FiAlertCircle, title = 'No data found', message = '', actionLabel = '', onAction = null }) => (
  <div
    style={{
      ...cardStyle,
      textAlign: 'center',
      padding: '3.5rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderStyle: 'dashed',
    }}
  >
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'rgba(99,102,241,0.1)',
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem',
      }}
    >
      <Icon size={26} />
    </div>
    <h3 style={{ margin: '0 0 0.4rem', color: 'var(--text-main)', fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>
      {title}
    </h3>
    {message && (
      <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 420 }}>
        {message}
      </p>
    )}
    {actionLabel && onAction && (
      <button onClick={onAction} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <FiPlus size={14} /> {actionLabel}
      </button>
    )}
  </div>
);

const ErrorState = ({ message = 'Failed to load content.', onRetry = null }) => (
  <div
    style={{
      ...cardStyle,
      textAlign: 'center',
      padding: '2.5rem 1.5rem',
      background: 'rgba(244,63,94,0.06)',
      borderColor: 'rgba(244,63,94,0.25)',
    }}
  >
    <FiAlertCircle size={32} style={{ color: '#f43f5e', marginBottom: '0.75rem' }} />
    <h4 style={{ margin: '0 0 0.35rem', color: '#fb7185' }}>Something went wrong</h4>
    <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <FiRefreshCw size={13} /> Try Again
      </button>
    )}
  </div>
);

// ─── Main Super Admin Dashboard Component ────────────────────────────────────

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Security guard: Only superAdmin role allowed
  if (!user || user.role !== 'superAdmin') {
    return <Navigate to="/" replace />;
  }

  // Active Tab state: 'overview' | 'users' | 'clubs' | 'events' | 'announcements'
  const [activeTab, setActiveTab] = useState('overview');

  // Shared clubs cache for assign modal & announcement targeting
  const [allClubsList, setAllClubsList] = useState([]);

  // ── Tab 1: Overview State
  const [stats, setStats] = useState(null);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState('');

  // ── Tab 2: Users State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  // Club assignment modal state
  const [assignUserModal, setAssignUserModal] = useState(null); // user object or null
  const [assignSelectedClub, setAssignSelectedClub] = useState('');
  const [assignRoleTarget, setAssignRoleTarget] = useState('clubAdmin');
  const [assignSaving, setAssignSaving] = useState(false);

  // ── Tab 3: Clubs State
  const [clubs, setClubs] = useState([]);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [clubsError, setClubsError] = useState('');
  const [clubSearch, setClubSearch] = useState('');
  const [clubStatusFilter, setClubStatusFilter] = useState('all');
  const [clubCategoryFilter, setClubCategoryFilter] = useState('all');
  // Club edit modal
  const [editingClub, setEditingClub] = useState(null);
  const [clubForm, setClubForm] = useState({
    name: '',
    shortDescription: '',
    description: '',
    category: 'Technology',
    contactEmail: '',
    logo: '',
    coverImage: ''
  });
  const [clubSaving, setClubSaving] = useState(false);

  // ── Tab 4: Events State
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState('all');
  // Registrations accordion toggle & data map: eventId -> { loading, data, stats, error }
  const [openEventPanel, setOpenEventPanel] = useState(null);
  const [eventRegMap, setEventRegMap] = useState({});

  // ── Tab 5: Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [annLoading, setAnnLoading] = useState(false);
  const [annError, setAnnError] = useState('');
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  const [annForm, setAnnForm] = useState({
    title: '',
    content: '',
    priority: 'normal',
    isGlobal: true,
    club: ''
  });
  const [annSaving, setAnnSaving] = useState(false);

  // ─── Fetch Shared Clubs List (for dropdowns) ───────────────────────────────

  const loadAllClubsList = useCallback(async () => {
    try {
      const res = await clubAPI.getAll({ status: 'all', limit: 100 });
      const clubItems = res.data?.clubs || res.data || [];
      setAllClubsList(clubItems);
    } catch {
      // Non-blocking fallback
    }
  }, []);

  useEffect(() => {
    loadAllClubsList();
  }, [loadAllClubsList]);

  // ─── Tab Data Loaders ──────────────────────────────────────────────────────

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    setOverviewError('');
    try {
      const [statsRes, regsRes, annsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getRegistrations({ limit: 8 }),
        adminAPI.getAnnouncements({ limit: 8 })
      ]);

      setStats(statsRes.data?.stats || null);
      setRecentRegistrations(regsRes.data?.registrations || []);
      setRecentAnnouncements(annsRes.data?.announcements || []);
    } catch (err) {
      setOverviewError(err?.response?.data?.message || 'Failed to load platform overview metrics.');
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const params = {
        page: userPage,
        limit: 15,
        search: userSearch.trim() || undefined,
        role: userRoleFilter !== 'all' ? userRoleFilter : undefined
      };
      const res = await adminAPI.getUsers(params);
      setUsers(res.data?.users || []);
      if (res.data?.pagination) {
        setUserPagination(res.data.pagination);
      }
    } catch (err) {
      setUsersError(err?.response?.data?.message || 'Failed to load users.');
    } finally {
      setUsersLoading(false);
    }
  }, [userPage, userSearch, userRoleFilter]);

  const loadClubs = useCallback(async () => {
    setClubsLoading(true);
    setClubsError('');
    try {
      const params = {
        limit: 50,
        status: clubStatusFilter !== 'all' ? clubStatusFilter : 'all',
        search: clubSearch.trim() || undefined,
        category: clubCategoryFilter !== 'all' ? clubCategoryFilter : undefined
      };
      const res = await clubAPI.getAll(params);
      const list = res.data?.clubs || res.data || [];
      setClubs(list);
    } catch (err) {
      setClubsError(err?.response?.data?.message || 'Failed to load clubs.');
    } finally {
      setClubsLoading(false);
    }
  }, [clubSearch, clubStatusFilter, clubCategoryFilter]);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError('');
    try {
      const params = {
        limit: 50,
        search: eventSearch.trim() || undefined,
        status: eventStatusFilter !== 'all' ? eventStatusFilter : undefined
      };
      const res = await eventAPI.getAll(params);
      setEvents(res.data?.events || res.data || []);
    } catch (err) {
      setEventsError(err?.response?.data?.message || 'Failed to load events.');
    } finally {
      setEventsLoading(false);
    }
  }, [eventSearch, eventStatusFilter]);

  const loadAnnouncements = useCallback(async () => {
    setAnnLoading(true);
    setAnnError('');
    try {
      const res = await adminAPI.getAnnouncements({ limit: 50 });
      setAnnouncements(res.data?.announcements || res.data || []);
    } catch (err) {
      setAnnError(err?.response?.data?.message || 'Failed to load announcements.');
    } finally {
      setAnnLoading(false);
    }
  }, []);

  // Trigger loads based on active tab
  useEffect(() => {
    if (activeTab === 'overview') loadOverview();
    else if (activeTab === 'users') loadUsers();
    else if (activeTab === 'clubs') loadClubs();
    else if (activeTab === 'events') loadEvents();
    else if (activeTab === 'announcements') loadAnnouncements();
  }, [activeTab, loadOverview, loadUsers, loadClubs, loadEvents, loadAnnouncements]);

  // ─── User Management Handlers ──────────────────────────────────────────────

  const handleToggleUserActive = async (targetUser) => {
    if (targetUser._id === user._id) {
      toast.error('You cannot deactivate your own Super Admin account.');
      return;
    }
    const newStatus = !targetUser.isActive;
    try {
      await adminAPI.updateUser(targetUser._id, { isActive: newStatus });
      toast.success(`User ${targetUser.name} ${newStatus ? 'activated' : 'deactivated'}.`);
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, isActive: newStatus } : u))
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser._id === user._id) {
      toast.error('You cannot delete your own account.');
      return;
    }
    if (!window.confirm(`Permanently delete user "${targetUser.name}" (${targetUser.email})? This action cannot be undone.`)) {
      return;
    }
    try {
      await adminAPI.deleteUser(targetUser._id);
      toast.success(`User ${targetUser.name} deleted.`);
      setUsers((prev) => prev.filter((u) => u._id !== targetUser._id));
      if (stats) {
        setStats((prev) => ({ ...prev, totalUsers: Math.max(0, (prev?.totalUsers || 1) - 1) }));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleDemoteToStudent = async (targetUser) => {
    if (!window.confirm(`Demote "${targetUser.name}" from Club Admin to regular student?`)) {
      return;
    }
    try {
      await adminAPI.updateUser(targetUser._id, { role: 'student', managedClub: null });
      toast.success(`${targetUser.name} is now a student.`);
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, role: 'student', managedClub: null } : u))
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to demote user.');
    }
  };

  const openAssignClubModal = (targetUser, forceRole = null) => {
    setAssignUserModal(targetUser);
    setAssignRoleTarget(forceRole || targetUser.role || 'clubAdmin');
    setAssignSelectedClub(targetUser.managedClub?._id || targetUser.managedClub || '');
  };

  const handleSaveUserAssignment = async (e) => {
    e.preventDefault();
    if (!assignUserModal) return;
    setAssignSaving(true);
    try {
      const payload = {
        role: assignRoleTarget,
        managedClub: assignSelectedClub ? assignSelectedClub : null
      };
      const res = await adminAPI.updateUser(assignUserModal._id, payload);
      toast.success(`User updated successfully!`);
      const updatedUser = res.data?.user || { ...assignUserModal, ...payload };
      setUsers((prev) =>
        prev.map((u) => (u._id === assignUserModal._id ? updatedUser : u))
      );
      setAssignUserModal(null);
      loadAllClubsList();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update user.');
    } finally {
      setAssignSaving(false);
    }
  };

  // ─── Club Management Handlers ──────────────────────────────────────────────

  const handleUpdateClubStatus = async (clubId, newStatus) => {
    try {
      await adminAPI.updateClub(clubId, { status: newStatus });
      toast.success(`Club status changed to ${newStatus}.`);
      setClubs((prev) =>
        prev.map((c) => (c._id === clubId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update club status.');
    }
  };

  const handleToggleClubFeatured = async (club) => {
    const nextFeatured = !club.featured;
    try {
      await adminAPI.updateClub(club._id, { featured: nextFeatured });
      toast.success(nextFeatured ? `"${club.name}" featured!` : `"${club.name}" unfeatured.`);
      setClubs((prev) =>
        prev.map((c) => (c._id === club._id ? { ...c, featured: nextFeatured } : c))
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update featured flag.');
    }
  };

  const handleDeleteClub = async (club) => {
    if (!window.confirm(`Are you sure you want to delete club "${club.name}"? All associated events and data may be affected.`)) {
      return;
    }
    try {
      await clubAPI.delete(club._id);
      toast.success(`Club "${club.name}" deleted.`);
      setClubs((prev) => prev.filter((c) => c._id !== club._id));
      loadAllClubsList();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete club.');
    }
  };

  const openEditClubModal = (club) => {
    setEditingClub(club);
    setClubForm({
      name: club.name || '',
      shortDescription: club.shortDescription || '',
      description: club.description || '',
      category: club.category || 'Technology',
      contactEmail: club.contactEmail || '',
      logo: club.logo || '',
      coverImage: club.coverImage || club.banner || ''
    });
  };

  const handleSaveClubDetails = async (e) => {
    e.preventDefault();
    if (!editingClub) return;
    if (!clubForm.name.trim()) {
      toast.error('Club name is required.');
      return;
    }
    setClubSaving(true);
    try {
      const res = await clubAPI.update(editingClub._id, clubForm);
      toast.success('Club details updated successfully!');
      const updated = res.data?.club || { ...editingClub, ...clubForm };
      setClubs((prev) =>
        prev.map((c) => (c._id === editingClub._id ? updated : c))
      );
      setEditingClub(null);
      loadAllClubsList();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update club.');
    } finally {
      setClubSaving(false);
    }
  };

  // ─── Event Monitoring Handlers ─────────────────────────────────────────────

  const toggleEventRegistrations = async (eventId) => {
    if (openEventPanel === eventId) {
      setOpenEventPanel(null);
      return;
    }
    setOpenEventPanel(eventId);
    if (!eventRegMap[eventId]) {
      setEventRegMap((prev) => ({
        ...prev,
        [eventId]: { loading: true, registrations: [], stats: null, error: '' }
      }));
      try {
        const res = await eventAPI.getRegistrations(eventId);
        setEventRegMap((prev) => ({
          ...prev,
          [eventId]: {
            loading: false,
            registrations: res.data?.registrations || [],
            stats: res.data?.stats || null,
            error: ''
          }
        }));
      } catch (err) {
        setEventRegMap((prev) => ({
          ...prev,
          [eventId]: {
            loading: false,
            registrations: [],
            stats: null,
            error: err?.response?.data?.message || 'Failed to load attendees.'
          }
        }));
      }
    }
  };

  const handleDeleteEvent = async (eventItem) => {
    if (!window.confirm(`Delete / cancel event "${eventItem.title}"? Registered students will be notified.`)) {
      return;
    }
    try {
      await eventAPI.delete(eventItem._id);
      toast.success(`Event "${eventItem.title}" cancelled & deleted.`);
      setEvents((prev) => prev.filter((e) => e._id !== eventItem._id));
      if (openEventPanel === eventItem._id) {
        setOpenEventPanel(null);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete event.');
    }
  };

  // ─── Announcement Handlers ─────────────────────────────────────────────────

  const openCreateAnnouncementForm = () => {
    setEditingAnn(null);
    setAnnForm({
      title: '',
      content: '',
      priority: 'normal',
      isGlobal: true,
      club: ''
    });
    setShowAnnForm(true);
  };

  const openEditAnnouncementForm = (ann) => {
    setEditingAnn(ann);
    setAnnForm({
      title: ann.title || '',
      content: ann.content || '',
      priority: ann.priority || 'normal',
      isGlobal: ann.isGlobal || !ann.club,
      club: ann.club?._id || ann.club || ''
    });
    setShowAnnForm(true);
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!annForm.title.trim() || !annForm.content.trim()) {
      toast.error('Title and content are required.');
      return;
    }
    if (!annForm.isGlobal && !annForm.club) {
      toast.error('Please select a target club or mark as Global announcement.');
      return;
    }
    setAnnSaving(true);
    try {
      const payload = {
        title: annForm.title.trim(),
        content: annForm.content.trim(),
        priority: annForm.priority,
        isGlobal: annForm.isGlobal,
        club: annForm.isGlobal ? null : annForm.club
      };

      if (editingAnn) {
        const res = await announcementAPI.update(editingAnn._id, payload);
        toast.success('Announcement updated successfully!');
        const updated = res.data?.announcement || { ...editingAnn, ...payload };
        setAnnouncements((prev) =>
          prev.map((a) => (a._id === editingAnn._id ? updated : a))
        );
      } else {
        const res = await announcementAPI.create(payload);
        toast.success('Announcement broadcast successfully!');
        const created = res.data?.announcement || res.data;
        setAnnouncements((prev) => [created, ...prev]);
      }
      setShowAnnForm(false);
      setEditingAnn(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save announcement.');
    } finally {
      setAnnSaving(false);
    }
  };

  const handleDeleteAnnouncement = async (ann) => {
    if (!window.confirm(`Delete announcement "${ann.title}"?`)) return;
    try {
      await announcementAPI.delete(ann._id);
      toast.success('Announcement deleted.');
      setAnnouncements((prev) => prev.filter((a) => a._id !== ann._id));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete announcement.');
    }
  };

  // ─── Render Sub-Views ──────────────────────────────────────────────────────

  // 1. Overview Tab
  const renderOverview = () => {
    if (overviewLoading) return <Spinner text="Loading system metrics & recent activity..." />;
    if (overviewError) return <ErrorState message={overviewError} onRetry={loadOverview} />;

    const statCards = [
      {
        title: 'Total Users',
        val: stats?.totalUsers ?? '—',
        icon: FiUsers,
        color: '#6366f1',
        bg: 'rgba(99,102,241,0.12)',
        sub: `${stats?.totalStudents ?? 0} Students · ${stats?.totalClubAdmins ?? 0} Club Admins`,
        onClick: () => setActiveTab('users')
      },
      {
        title: 'Total Clubs',
        val: stats?.totalClubs ?? '—',
        icon: FiCompass,
        color: '#10b981',
        bg: 'rgba(16,185,129,0.12)',
        sub: `${stats?.activeClubs ?? 0} Active · ${stats?.inactiveClubs ?? 0} Inactive / Pending`,
        onClick: () => setActiveTab('clubs')
      },
      {
        title: 'Total Events',
        val: stats?.totalEvents ?? '—',
        icon: FiCalendar,
        color: '#06b6d4',
        bg: 'rgba(6,182,212,0.12)',
        sub: `${stats?.upcomingEvents ?? 0} Upcoming events scheduled`,
        onClick: () => setActiveTab('events')
      },
      {
        title: 'Registrations',
        val: stats?.totalRegistrations ?? '—',
        icon: FiCheckCircle,
        color: '#ec4899',
        bg: 'rgba(236,72,153,0.12)',
        sub: 'Across all club events & workshops',
        onClick: () => setActiveTab('events')
      }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Metric Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {statCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                onClick={c.onClick}
                style={{
                  ...cardStyle,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = c.color;
                  e.currentTarget.style.boxShadow = `0 8px 24px ${c.bg}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {c.title}
                    </span>
                    <h2 style={{ margin: '0.35rem 0 0', fontSize: '2.1rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                      {c.val}
                    </h2>
                  </div>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: c.bg,
                      color: c.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={22} />
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                  {c.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions Panel */}
        <div
          style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.05) 100%)',
            borderColor: 'rgba(99,102,241,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiSparkles style={{ color: 'var(--primary)' }} />
                Administrative Quick Actions
              </h3>
              <p style={{ margin: '0.3rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Instant shortcuts to perform platform-wide governance tasks
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              <button
                onClick={() => {
                  setActiveTab('announcements');
                  openCreateAnnouncementForm();
                }}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <FiMegaphone size={14} /> New Global Announcement
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <FiUsers size={14} /> Manage Users
              </button>
              <button
                onClick={() => setActiveTab('clubs')}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <FiCompass size={14} /> Manage Clubs
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <FiCalendar size={14} /> Monitor Events
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity: Registrations & Announcements split */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
          {/* Recent Registrations */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiClock style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>
                  Recent Registrations
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('events')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
              >
                View Events
              </button>
            </div>

            {recentRegistrations.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', textAlign: 'center', padding: '2rem 0' }}>
                No recent event registrations found.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentRegistrations.slice(0, 6).map((reg) => (
                  <div
                    key={reg._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.85rem',
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      gap: '0.75rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                      <div style={avatarStyle('rgba(99,102,241,0.2)')}>
                        {avatarInitial(reg.student?.name)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: 'var(--text-main)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {reg.student?.name || 'Student'}
                        </div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Registered for: <strong style={{ color: 'var(--text-muted)' }}>{reg.event?.title || 'Event'}</strong>
                          {reg.event?.club?.name && ` (${reg.event.club.name})`}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={statusBadgeStyle(reg.attendanceStatus || 'registered')}>
                        {reg.attendanceStatus || 'registered'}
                      </span>
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem', marginTop: '0.25rem' }}>
                        {fmtDate(reg.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Global Announcements */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiMegaphone style={{ color: 'var(--accent)' }} />
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>
                  Recent Broadcasts
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('announcements')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
              >
                All Announcements
              </button>
            </div>

            {recentAnnouncements.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', textAlign: 'center', padding: '2rem 0' }}>
                No announcements published yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentAnnouncements.slice(0, 6).map((ann) => (
                  <div
                    key={ann._id}
                    style={{
                      padding: '0.8rem 0.9rem',
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {ann.isGlobal || !ann.club ? (
                          <span style={{ fontSize: '0.72rem', background: 'rgba(236,72,153,0.15)', color: '#f472b6', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 600 }}>
                            🌐 Global
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', background: 'rgba(6,182,212,0.15)', color: '#22d3ee', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 600 }}>
                            {ann.club?.name || 'Club'}
                          </span>
                        )}
                        <span style={priorityBadgeStyle(ann.priority || 'normal')}>
                          {ann.priority || 'normal'}
                        </span>
                      </div>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                        {fmtDate(ann.createdAt)}
                      </span>
                    </div>

                    <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                      {ann.title}
                    </div>

                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {ann.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 2. Users Tab
  const renderUsers = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Filter / Search Bar */}
        <div
          style={{
            ...cardStyle,
            padding: '1.2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 280 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
              <FiSearch
                size={16}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                style={{ ...inputStyle, paddingLeft: '2.4rem' }}
              />
            </div>

            {/* Role Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiFilter size={15} style={{ color: 'var(--text-dim)' }} />
              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setUserPage(1);
                }}
                style={{ ...inputStyle, width: 'auto', minWidth: 140, cursor: 'pointer' }}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="clubAdmin">Club Admins</option>
                <option value="superAdmin">Super Admins</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              Total: <strong style={{ color: 'var(--text-main)' }}>{userPagination.total || users.length}</strong> users
            </span>
            <button
              onClick={loadUsers}
              className="btn btn-secondary btn-sm"
              title="Refresh list"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FiRefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {/* Users Table / List */}
        {usersLoading ? (
          <Spinner text="Loading users..." />
        ) : usersError ? (
          <ErrorState message={usersError} onRetry={loadUsers} />
        ) : users.length === 0 ? (
          <EmptyState
            icon={FiUsers}
            title="No users found"
            message={userSearch || userRoleFilter !== 'all' ? 'Try adjusting your search criteria or role filters.' : 'No users currently registered in the database.'}
          />
        ) : (
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                      User
                    </th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                      Role
                    </th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                      Managed Club
                    </th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                      Status
                    </th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                      Joined
                    </th>
                    <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', textAlign: 'right' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u._id === user._id;
                    const clubName = u.managedClub?.name || (typeof u.managedClub === 'string' ? 'Assigned' : '—');

                    return (
                      <tr
                        key={u._id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {/* Name + Email + Avatar */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={avatarStyle(u.role === 'superAdmin' ? '#f43f5e' : u.role === 'clubAdmin' ? '#06b6d4' : 'var(--primary)')}>
                              {avatarInitial(u.name)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                {u.name}
                                {isSelf && (
                                  <span style={{ fontSize: '0.7rem', background: 'rgba(99,102,241,0.2)', color: '#818cf8', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                    You
                                  </span>
                                )}
                              </div>
                              <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td style={{ padding: '1rem' }}>
                          <span style={roleBadgeStyle(u.role)}>
                            {u.role === 'superAdmin' && <FiShield size={12} />}
                            {u.role === 'clubAdmin' && <FiCompass size={12} />}
                            {u.role === 'student' && <FiUsers size={12} />}
                            {u.role === 'superAdmin' ? 'Super Admin' : u.role === 'clubAdmin' ? 'Club Admin' : 'Student'}
                          </span>
                        </td>

                        {/* Managed Club */}
                        <td style={{ padding: '1rem' }}>
                          {u.role === 'clubAdmin' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ color: u.managedClub ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: u.managedClub ? 600 : 400 }}>
                                {clubName}
                              </span>
                              <button
                                onClick={() => openAssignClubModal(u)}
                                className="btn btn-secondary btn-sm"
                                title="Change assigned club"
                                style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                              >
                                <FiEdit2 size={11} />
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-dim)' }}>—</span>
                          )}
                        </td>

                        {/* Status (Active / Inactive) */}
                        <td style={{ padding: '1rem' }}>
                          <span style={statusBadgeStyle(u.isActive !== false ? 'active' : 'inactive')}>
                            {u.isActive !== false ? <FiCheckCircle size={11} /> : <FiXCircle size={11} />}
                            {u.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Joined Date */}
                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {fmtDate(u.createdAt)}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                            {/* Role management button */}
                            {u.role === 'student' && (
                              <button
                                onClick={() => openAssignClubModal(u, 'clubAdmin')}
                                className="btn btn-secondary btn-sm"
                                title="Promote to Club Admin"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#22d3ee' }}
                              >
                                <FiUserCheck size={13} /> Promote
                              </button>
                            )}

                            {u.role === 'clubAdmin' && (
                              <button
                                onClick={() => handleDemoteToStudent(u)}
                                className="btn btn-secondary btn-sm"
                                title="Demote to Student"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}
                              >
                                <FiUserX size={13} /> Demote
                              </button>
                            )}

                            {/* Activate / Deactivate button */}
                            <button
                              onClick={() => handleToggleUserActive(u)}
                              disabled={isSelf}
                              className="btn btn-secondary btn-sm"
                              title={isSelf ? 'Cannot deactivate self' : u.isActive !== false ? 'Deactivate user' : 'Activate user'}
                              style={{
                                opacity: isSelf ? 0.4 : 1,
                                cursor: isSelf ? 'not-allowed' : 'pointer',
                                color: u.isActive !== false ? '#fb7185' : '#34d399'
                              }}
                            >
                              {u.isActive !== false ? <FiLock size={13} /> : <FiUnlock size={13} />}
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={isSelf}
                              className="btn btn-danger btn-sm"
                              title={isSelf ? 'Cannot delete self' : 'Permanently delete user'}
                              style={{
                                opacity: isSelf ? 0.4 : 1,
                                cursor: isSelf ? 'not-allowed' : 'pointer',
                                padding: '0.35rem 0.55rem'
                              }}
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {userPagination.pages > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderTop: '1px solid var(--border-subtle)',
                  background: 'rgba(255,255,255,0.01)'
                }}
              >
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                  Page {userPagination.page} of {userPagination.pages} ({userPagination.total} total)
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    disabled={userPage <= 1}
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    className="btn btn-secondary btn-sm"
                    style={{ opacity: userPage <= 1 ? 0.5 : 1 }}
                  >
                    Previous
                  </button>
                  <button
                    disabled={userPage >= userPagination.pages}
                    onClick={() => setUserPage((p) => Math.min(userPagination.pages, p + 1))}
                    className="btn btn-secondary btn-sm"
                    style={{ opacity: userPage >= userPagination.pages ? 0.5 : 1 }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Club Assignment Modal */}
        {assignUserModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(6px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              style={{
                ...cardStyle,
                width: '100%',
                maxWidth: 480,
                background: '#121727',
                border: '1px solid var(--border-hover)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                  Assign Club to User
                </h3>
                <button
                  onClick={() => setAssignUserModal(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                >
                  <FiX size={20} />
                </button>
              </div>

              <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: 'var(--bg-glass)', borderRadius: '10px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{assignUserModal.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{assignUserModal.email}</div>
              </div>

              <form onSubmit={handleSaveUserAssignment}>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>Target Role</label>
                  <select
                    value={assignRoleTarget}
                    onChange={(e) => setAssignRoleTarget(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="clubAdmin">Club Admin (can manage assigned club)</option>
                    <option value="student">Student (demote to regular student)</option>
                  </select>
                </div>

                {assignRoleTarget === 'clubAdmin' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>Select Club to Manage</label>
                    <select
                      value={assignSelectedClub}
                      onChange={(e) => setAssignSelectedClub(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">-- No Club Assigned (Floating Admin) --</option>
                      {allClubsList.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} ({c.category})
                        </option>
                      ))}
                    </select>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      Assigning a club grants this user full admin privileges over that club's events and details.
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setAssignUserModal(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assignSaving}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <FiSave size={14} /> {assignSaving ? 'Saving...' : 'Save Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 3. Clubs Tab
  const renderClubs = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Filter / Search Bar */}
        <div
          style={{
            ...cardStyle,
            padding: '1.2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 280 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
              <FiSearch
                size={16}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              />
              <input
                type="text"
                placeholder="Search clubs by name..."
                value={clubSearch}
                onChange={(e) => setClubSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '2.4rem' }}
              />
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <select
                value={clubStatusFilter}
                onChange={(e) => setClubStatusFilter(e.target.value)}
                style={{ ...inputStyle, width: 'auto', minWidth: 130, cursor: 'pointer' }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <select
                value={clubCategoryFilter}
                onChange={(e) => setClubCategoryFilter(e.target.value)}
                style={{ ...inputStyle, width: 'auto', minWidth: 140, cursor: 'pointer' }}
              >
                <option value="all">All Categories</option>
                {CLUB_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              Total: <strong style={{ color: 'var(--text-main)' }}>{clubs.length}</strong> clubs
            </span>
            <button
              onClick={loadClubs}
              className="btn btn-secondary btn-sm"
              title="Refresh list"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FiRefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {/* Clubs Grid */}
        {clubsLoading ? (
          <Spinner text="Loading clubs..." />
        ) : clubsError ? (
          <ErrorState message={clubsError} onRetry={loadClubs} />
        ) : clubs.length === 0 ? (
          <EmptyState
            icon={FiCompass}
            title="No clubs found"
            message={clubSearch || clubStatusFilter !== 'all' ? 'Try adjusting your search or status filter.' : 'No clubs registered yet.'}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {clubs.map((c) => {
              const adminName = c.admin?.name || 'Unassigned';
              const adminEmail = c.admin?.email || '';
              const isFeatured = !!c.featured;

              return (
                <div
                  key={c._id}
                  style={{
                    ...cardStyle,
                    padding: '1.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    position: 'relative',
                  }}
                >
                  {/* Top: Logo + Name + Category + Badges */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {c.logo ? (
                          <img
                            src={c.logo}
                            alt={c.name}
                            style={{ width: 44, height: 44, borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ ...avatarStyle('rgba(6,182,212,0.2)'), color: '#22d3ee', borderRadius: '12px', width: 44, height: 44 }}>
                            {avatarInitial(c.name)}
                          </div>
                        )}
                        <div>
                          <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>
                            {c.name}
                          </h4>
                          <span style={{ fontSize: '0.78rem', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <FiTag size={11} /> {c.category || 'General'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                        <span style={statusBadgeStyle(c.status || 'active')}>
                          {c.status || 'active'}
                        </span>
                        {isFeatured && (
                          <span
                            title="Featured Club"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              background: 'rgba(245,158,11,0.18)',
                              color: '#fbbf24',
                              border: '1px solid rgba(245,158,11,0.3)',
                              borderRadius: '20px',
                              padding: '0.15rem 0.5rem',
                              fontSize: '0.7rem',
                              fontWeight: 700
                            }}
                          >
                            <FiStar size={11} fill="#fbbf24" /> Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, maxHeight: 65, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {c.shortDescription || c.description || 'No description provided.'}
                    </p>

                    {/* Metadata Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'var(--bg-glass)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.8rem', border: '1px solid var(--border-subtle)' }}>
                      <div>
                        <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>LEAD / ADMIN</span>
                        <strong style={{ color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                          {adminName}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>MEMBERS</span>
                        <strong style={{ color: 'var(--text-main)' }}>
                          {c.members?.length || 0} enrolled
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.9rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    {/* Status Management */}
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {c.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateClubStatus(c._id, 'active')}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                        >
                          Approve
                        </button>
                      )}
                      {c.status === 'active' ? (
                        <button
                          onClick={() => handleUpdateClubStatus(c._id, 'inactive')}
                          className="btn btn-secondary btn-sm"
                          title="Deactivate club"
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem', color: '#fb7185' }}
                        >
                          Deactivate
                        </button>
                      ) : c.status === 'inactive' ? (
                        <button
                          onClick={() => handleUpdateClubStatus(c._id, 'active')}
                          className="btn btn-secondary btn-sm"
                          title="Activate club"
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem', color: '#34d399' }}
                        >
                          Activate
                        </button>
                      ) : null}

                      {/* Featured toggle */}
                      <button
                        onClick={() => handleToggleClubFeatured(c)}
                        className="btn btn-secondary btn-sm"
                        title={isFeatured ? 'Unfeature this club' : 'Feature this club'}
                        style={{ padding: '0.3rem 0.55rem', color: isFeatured ? '#fbbf24' : 'var(--text-muted)' }}
                      >
                        <FiStar size={13} fill={isFeatured ? '#fbbf24' : 'none'} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {/* Edit Details */}
                      <button
                        onClick={() => openEditClubModal(c)}
                        className="btn btn-secondary btn-sm"
                        title="Edit club details"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                      >
                        <FiEdit2 size={13} /> Edit
                      </button>

                      {/* Delete Club */}
                      <button
                        onClick={() => handleDeleteClub(c)}
                        className="btn btn-danger btn-sm"
                        title="Delete club"
                        style={{ padding: '0.3rem 0.55rem' }}
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Club Modal */}
        {editingClub && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(6px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              style={{
                ...cardStyle,
                width: '100%',
                maxWidth: 580,
                maxHeight: '90vh',
                overflowY: 'auto',
                background: '#121727',
                border: '1px solid var(--border-hover)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                  Edit Club: {editingClub.name}
                </h3>
                <button
                  onClick={() => setEditingClub(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveClubDetails}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Club Name *</label>
                  <input
                    type="text"
                    required
                    value={clubForm.name}
                    onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select
                      value={clubForm.category}
                      onChange={(e) => setClubForm({ ...clubForm, category: e.target.value })}
                      style={inputStyle}
                    >
                      {CLUB_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Contact Email</label>
                    <input
                      type="email"
                      value={clubForm.contactEmail}
                      onChange={(e) => setClubForm({ ...clubForm, contactEmail: e.target.value })}
                      placeholder="club@campus.edu"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Short Description</label>
                  <input
                    type="text"
                    value={clubForm.shortDescription}
                    onChange={(e) => setClubForm({ ...clubForm, shortDescription: e.target.value })}
                    placeholder="Brief tagline for club cards..."
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Full Description</label>
                  <textarea
                    rows={4}
                    value={clubForm.description}
                    onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                    placeholder="Detailed mission, activities, meeting schedules..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={labelStyle}>Logo URL</label>
                    <input
                      type="text"
                      value={clubForm.logo}
                      onChange={(e) => setClubForm({ ...clubForm, logo: e.target.value })}
                      placeholder="https://..."
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Cover Image URL</label>
                    <input
                      type="text"
                      value={clubForm.coverImage}
                      onChange={(e) => setClubForm({ ...clubForm, coverImage: e.target.value })}
                      placeholder="https://..."
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setEditingClub(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={clubSaving}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <FiSave size={14} /> {clubSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 4. Events Tab
  const renderEvents = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Filter / Search Bar */}
        <div
          style={{
            ...cardStyle,
            padding: '1.2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 280 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
              <FiSearch
                size={16}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              />
              <input
                type="text"
                placeholder="Search events by title..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '2.4rem' }}
              />
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <select
                value={eventStatusFilter}
                onChange={(e) => setEventStatusFilter(e.target.value)}
                style={{ ...inputStyle, width: 'auto', minWidth: 140, cursor: 'pointer' }}
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              Total: <strong style={{ color: 'var(--text-main)' }}>{events.length}</strong> events
            </span>
            <button
              onClick={loadEvents}
              className="btn btn-secondary btn-sm"
              title="Refresh list"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FiRefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {/* Events List */}
        {eventsLoading ? (
          <Spinner text="Loading events..." />
        ) : eventsError ? (
          <ErrorState message={eventsError} onRetry={loadEvents} />
        ) : events.length === 0 ? (
          <EmptyState
            icon={FiCalendar}
            title="No events found"
            message={eventSearch || eventStatusFilter !== 'all' ? 'Try adjusting your search query or filter.' : 'No events scheduled across any club yet.'}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {events.map((evt) => {
              const regCount = evt.registeredCount || 0;
              const cap = evt.capacity || 100;
              const pct = Math.min(100, Math.round((regCount / cap) * 100));
              const isAccordionOpen = openEventPanel === evt._id;
              const regDataState = eventRegMap[evt._id];

              return (
                <div
                  key={evt._id}
                  style={{
                    ...cardStyle,
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    {/* Event Meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 260 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          background: 'rgba(99,102,241,0.15)',
                          color: '#818cf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontWeight: 700
                        }}
                      >
                        <FiCalendar size={22} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>
                            {evt.title}
                          </h4>
                          <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', color: 'var(--accent)', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                            {evt.category || 'General'}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginTop: '0.2rem', display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
                          <span>🏛️ {evt.club?.name || 'Club'}</span>
                          <span><FiClock size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> {fmtDate(evt.date)} ({evt.startTime || 'TBD'})</span>
                          <span><FiMapPin size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> {evt.venue || 'Campus'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress + Status + Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
                      {/* Capacity Progress */}
                      <div style={{ minWidth: 150 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                          <span style={{ color: 'var(--text-dim)' }}>Registered:</span>
                          <strong style={{ color: 'var(--text-main)' }}>{regCount} / {cap}</strong>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: pct > 85 ? 'var(--rose)' : 'var(--grad-primary)',
                              borderRadius: 3,
                              transition: 'width 0.4s'
                            }}
                          />
                        </div>
                      </div>

                      {/* Status */}
                      <span style={statusBadgeStyle(evt.status || 'upcoming')}>
                        {evt.status || 'upcoming'}
                      </span>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => toggleEventRegistrations(evt._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                        >
                          <FiUsers size={13} />
                          Attendees
                          {isAccordionOpen ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
                        </button>

                        <button
                          onClick={() => handleDeleteEvent(evt)}
                          className="btn btn-danger btn-sm"
                          title="Cancel and delete event"
                          style={{ padding: '0.4rem 0.6rem' }}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Accordion Registrations Panel */}
                  {isAccordionOpen && (
                    <div
                      style={{
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '1rem',
                        marginTop: '0.5rem',
                        background: 'rgba(0,0,0,0.15)',
                        borderRadius: '10px',
                        padding: '1rem',
                      }}
                    >
                      {regDataState?.loading ? (
                        <Spinner size={24} text="Loading registered attendees..." />
                      ) : regDataState?.error ? (
                        <p style={{ color: '#fb7185', fontSize: '0.85rem', margin: 0 }}>{regDataState.error}</p>
                      ) : !regDataState?.registrations || regDataState.registrations.length === 0 ? (
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: 0, textAlign: 'center', padding: '1rem 0' }}>
                          No students have registered for this event yet.
                        </p>
                      ) : (
                        <div>
                          {/* Quick Stats banner */}
                          {regDataState.stats && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <span>Total Registered: <strong style={{ color: 'var(--text-main)' }}>{regDataState.stats.totalRegistered}</strong></span>
                              <span>Present: <strong style={{ color: '#34d399' }}>{regDataState.stats.totalPresent}</strong></span>
                              <span>Absent: <strong style={{ color: '#fb7185' }}>{regDataState.stats.totalAbsent}</strong></span>
                              <span>Attendance Rate: <strong style={{ color: 'var(--primary)' }}>{regDataState.stats.attendanceRate}%</strong></span>
                            </div>
                          )}

                          <div style={{ overflowX: 'auto', maxHeight: 300, overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                                  <th style={{ padding: '0.5rem 0.75rem' }}>Student</th>
                                  <th style={{ padding: '0.5rem 0.75rem' }}>Registered At</th>
                                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Attendance</th>
                                </tr>
                              </thead>
                              <tbody>
                                {regDataState.registrations.map((r) => (
                                  <tr key={r._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '0.5rem 0.75rem' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={avatarStyle('rgba(99,102,241,0.2)')}>
                                          {avatarInitial(r.student?.name)}
                                        </div>
                                        <div>
                                          <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{r.student?.name || 'Student'}</div>
                                          <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{r.student?.email}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>
                                      {fmtDateTime(r.createdAt || r.registeredAt)}
                                    </td>
                                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                                      <span style={statusBadgeStyle(r.attendanceStatus || 'registered')}>
                                        {r.attendanceStatus || 'registered'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
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
  };

  // 5. Announcements Tab
  const renderAnnouncements = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header + Create Action */}
        <div
          style={{
            ...cardStyle,
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.2rem', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiMegaphone style={{ color: 'var(--primary)' }} />
              Platform Announcements & Broadcasts
            </h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Broadcast university-wide system notices or target specific club communities.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={loadAnnouncements}
              className="btn btn-secondary btn-sm"
              title="Refresh"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FiRefreshCw size={13} /> Refresh
            </button>
            <button
              onClick={() => {
                if (showAnnForm) {
                  setShowAnnForm(false);
                  setEditingAnn(null);
                } else {
                  openCreateAnnouncementForm();
                }
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              {showAnnForm ? <FiX size={14} /> : <FiPlus size={14} />}
              {showAnnForm ? 'Cancel' : 'Create Announcement'}
            </button>
          </div>
        </div>

        {/* Collapsible Creation/Edit Form Card */}
        {showAnnForm && (
          <div
            style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(236,72,153,0.04) 100%)',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FiSparkles style={{ color: 'var(--primary)' }} />
                {editingAnn ? 'Edit Announcement' : 'Publish New Announcement'}
              </h4>
              <button
                onClick={() => {
                  setShowAnnForm(false);
                  setEditingAnn(null);
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Campus Spring Fest Registration Now Open"
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                {/* Priority */}
                <div>
                  <label style={labelStyle}>Priority Level</label>
                  <select
                    value={annForm.priority}
                    onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="low">Low (General updates)</option>
                    <option value="normal">Normal (Standard news)</option>
                    <option value="high">High (Important alerts)</option>
                    <option value="urgent">Urgent (Crucial broadcasts)</option>
                  </select>
                </div>

                {/* Scope Selection */}
                <div>
                  <label style={labelStyle}>Broadcast Scope</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: 42 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      <input
                        type="checkbox"
                        checked={annForm.isGlobal}
                        onChange={(e) => setAnnForm({ ...annForm, isGlobal: e.target.checked })}
                        style={{ accentColor: 'var(--primary)', width: 16, height: 16 }}
                      />
                      🌐 Global (Broadcast to all students & admins)
                    </label>
                  </div>
                </div>

                {/* Club Dropdown if not Global */}
                {!annForm.isGlobal && (
                  <div>
                    <label style={labelStyle}>Target Specific Club *</label>
                    <select
                      value={annForm.club}
                      required={!annForm.isGlobal}
                      onChange={(e) => setAnnForm({ ...annForm, club: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="">-- Choose Club --</option>
                      {allClubsList.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Announcement Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Compose your message clearly. Markdown or plain text..."
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAnnForm(false);
                    setEditingAnn(null);
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={annSaving}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <FiSave size={14} /> {annSaving ? 'Broadcasting...' : editingAnn ? 'Update Announcement' : 'Publish Broadcast'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcements List */}
        {annLoading ? (
          <Spinner text="Loading announcements..." />
        ) : annError ? (
          <ErrorState message={annError} onRetry={loadAnnouncements} />
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={FiMegaphone}
            title="No announcements published"
            message="Send a broadcast to all university students or specific clubs."
            actionLabel="Create First Announcement"
            onAction={openCreateAnnouncementForm}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {announcements.map((ann) => {
              const isGlobal = ann.isGlobal || !ann.club;
              const authorName = ann.author?.name || 'Administrator';

              return (
                <div
                  key={ann._id}
                  style={{
                    ...cardStyle,
                    padding: '1.35rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {/* Top Bar: Scope badge + Priority + Date */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                      {isGlobal ? (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.65rem',
                            borderRadius: '12px',
                            background: 'rgba(236,72,153,0.15)',
                            color: '#f472b6',
                            border: '1px solid rgba(236,72,153,0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          🌐 Global Broadcast
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.65rem',
                            borderRadius: '12px',
                            background: 'rgba(6,182,212,0.15)',
                            color: '#22d3ee',
                            border: '1px solid rgba(6,182,212,0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          🏛️ Club: {ann.club?.name || 'Target Club'}
                        </span>
                      )}

                      <span style={priorityBadgeStyle(ann.priority || 'normal')}>
                        {ann.priority || 'normal'}
                      </span>
                    </div>

                    <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FiClock size={13} /> {fmtDateTime(ann.createdAt)}
                    </div>
                  </div>

                  {/* Title */}
                  <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>
                    {ann.title}
                  </h4>

                  {/* Content */}
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {ann.content}
                  </p>

                  {/* Footer: Author + Actions */}
                  <div
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.75rem',
                      marginTop: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      fontSize: '0.82rem'
                    }}
                  >
                    <span style={{ color: 'var(--text-dim)' }}>
                      Published by: <strong style={{ color: 'var(--text-main)' }}>{authorName}</strong>
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEditAnnouncementForm(ann)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
                      >
                        <FiEdit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann)}
                        className="btn btn-danger btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', padding: '0.3rem 0.55rem' }}
                      >
                        <FiTrash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ─── Tabs Navigation Definition ────────────────────────────────────────────

  const tabs = [
    { id: 'overview',      label: 'Overview',      icon: <FiBarChart2 size={16} /> },
    { id: 'users',         label: 'Users',         icon: <FiUsers size={16} /> },
    { id: 'clubs',         label: 'Clubs',         icon: <FiCompass size={16} /> },
    { id: 'events',        label: 'Events',        icon: <FiCalendar size={16} /> },
    { id: 'announcements', label: 'Announcements', icon: <FiMegaphone size={16} /> },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-main, #0a0d14)',
        fontFamily: 'var(--font-body)',
        color: 'var(--text-main)',
        paddingBottom: '3rem'
      }}
    >
      {/* Top Header Banner */}
      <div
        style={{
          background: 'var(--bg-glass)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1.25rem 0',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  background: 'rgba(244,63,94,0.18)',
                  color: '#fb7185',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiShield size={18} />
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.45rem',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                Super Admin Console
                <span
                  style={{
                    fontSize: '0.72rem',
                    background: 'rgba(244,63,94,0.15)',
                    color: '#fb7185',
                    border: '1px solid rgba(244,63,94,0.3)',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '20px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Root Access
                </span>
              </h1>
            </div>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Master administration portal for <strong style={{ color: 'var(--text-main)' }}>{user.name}</strong> ({user.email})
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Link
              to="/"
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FiHome size={14} /> Back to Site
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ padding: '2rem 1rem', maxWidth: 1200 }}>
        {/* Navigation Tabs Bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '2rem',
            background: 'var(--bg-card)',
            padding: '0.5rem',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  borderRadius: '10px',
                  padding: '0.55rem 1.15rem',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.88rem',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab View Renderers */}
        <div>
          {activeTab === 'overview'      && renderOverview()}
          {activeTab === 'users'         && renderUsers()}
          {activeTab === 'clubs'         && renderClubs()}
          {activeTab === 'events'        && renderEvents()}
          {activeTab === 'announcements' && renderAnnouncements()}
        </div>
      </div>
    </div>
  );
}
