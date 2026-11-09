import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import InterestSelector from './InterestSelector';
import { HiSparkles as FiSparkles } from 'react-icons/hi2';
import {
  FiCompass,
  FiCalendar,
  FiVolume2,
  FiUser,
  FiLogOut,
  FiGrid,
  FiBookmark,
  FiMenu,
  FiX,
  FiShield,
  FiCheckCircle,
  FiSliders
} from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, logout, login } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDemoLogin = async (role) => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    if (role === 'student') {
      await login('student@college.edu', 'Student@123');
      navigate('/dashboard');
    } else if (role === 'clubAdmin') {
      await login('coding@college.edu', 'ClubAdmin@123');
      navigate('/club-admin');
    } else if (role === 'superAdmin') {
      await login('admin@college.edu', 'Admin@123');
      navigate('/admin');
    }
  };

  const getDashboardRoute = () => {
    if (user?.role === 'superAdmin') return '/admin';
    if (user?.role === 'clubAdmin') return '/club-admin';
    return '/dashboard';
  };

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '75px',
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          transition: 'var(--transition)',
          background: scrolled
            ? 'rgba(10, 13, 20, 0.88)'
            : 'rgba(10, 13, 20, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div className="container" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Brand Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: 800,
              fontSize: '1.35rem',
              letterSpacing: '-0.02em'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--grad-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)'
              }}
            >
              <FiSparkles color="#fff" size={20} />
            </div>
            <span>
              Club<span className="gradient-text">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem'
            }}
            className="desktop-nav"
          >
            {isAuthenticated && (
              <NavLink
                to={getDashboardRoute()}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: isActive ? '#ffffff' : 'var(--text-muted)'
                })}
              >
                <FiGrid /> Dashboard
              </NavLink>
            )}

            <NavLink
              to="/clubs"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: isActive ? '#ffffff' : 'var(--text-muted)'
              })}
            >
              <FiCompass /> Clubs
            </NavLink>

            <NavLink
              to="/events"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: isActive ? '#ffffff' : 'var(--text-muted)'
              })}
            >
              <FiCalendar /> Events
            </NavLink>

            <NavLink
              to="/recommendations"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: isActive ? '#f472b6' : '#cbd5e1',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(236, 72, 153, 0.1)',
                border: '1px solid rgba(236, 72, 153, 0.25)'
              })}
            >
              <FiSparkles style={{ color: '#ec4899' }} /> For You
            </NavLink>

            <NavLink
              to="/announcements"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: isActive ? '#ffffff' : 'var(--text-muted)'
              })}
            >
              <FiVolume2 /> News
            </NavLink>
          </nav>

          {/* Right Action Icons & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            {isAuthenticated ? (
              <>
                <button
                  className="btn-icon"
                  title="Customize Interests"
                  onClick={() => setInterestModalOpen(true)}
                >
                  <FiSliders size={18} />
                </button>

                <NotificationDropdown />

                {/* User Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      background: 'var(--bg-glass-strong)',
                      border: '1px solid var(--border-subtle)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      cursor: 'pointer',
                      color: 'var(--text-main)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--grad-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#fff'
                      }}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: 0,
                        width: '250px',
                        background: '#121829',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '0.75rem',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 1000,
                        animation: 'slideUp 0.15s ease-out'
                      }}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{user?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user?.email}
                        </div>
                        <span
                          className={`badge ${
                            user?.role === 'superAdmin'
                              ? 'badge-danger'
                              : user?.role === 'clubAdmin'
                              ? 'badge-accent'
                              : 'badge-primary'
                          }`}
                          style={{ marginTop: '0.4rem', fontSize: '0.65rem' }}
                        >
                          {user?.role === 'superAdmin'
                            ? 'Super Admin'
                            : user?.role === 'clubAdmin'
                            ? 'Club Admin'
                            : 'Student'}
                        </span>
                      </div>

                      <Link
                        to={getDashboardRoute()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.55rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.88rem',
                          color: 'var(--text-main)'
                        }}
                      >
                        <FiGrid /> Dashboard
                      </Link>

                      <Link
                        to="/profile"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.55rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.88rem',
                          color: 'var(--text-main)'
                        }}
                      >
                        <FiUser /> Profile & Interests
                      </Link>

                      {user?.role === 'student' && (
                        <Link
                          to="/saved-events"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.55rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.88rem',
                            color: 'var(--text-main)'
                          }}
                        >
                          <FiBookmark /> Saved Events
                        </Link>
                      )}

                      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.45rem 0' }} />

                      <div style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Switch Role Demo:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3rem', padding: '0 0.5rem 0.5rem' }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDemoLogin('student'); }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.2rem' }}
                        >
                          Student
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDemoLogin('clubAdmin'); }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.2rem' }}
                        >
                          Organizer
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDemoLogin('superAdmin'); }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.2rem' }}
                        >
                          Admin
                        </button>
                      </div>

                      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.35rem 0' }} />

                      <button
                        onClick={logout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.55rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.88rem',
                          color: '#fb7185',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <FiLogOut /> Log out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="btn-icon mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '75px',
              left: 0,
              right: 0,
              background: '#0a0d14',
              borderBottom: '1px solid var(--border-subtle)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 999
            }}
          >
            {isAuthenticated && (
              <Link
                to={getDashboardRoute()}
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-main)' }}
              >
                <FiGrid /> Dashboard
              </Link>
            )}
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-main)' }}
            >
              <FiCalendar /> Explore Events
            </Link>
            <Link
              to="/clubs"
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-main)' }}
            >
              <FiCompass /> Clubs
            </Link>
            <Link
              to="/recommendations"
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#f472b6' }}
            >
              <FiSparkles /> For You
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-main)' }}
                >
                  <FiUser /> Profile & Interests
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fb7185',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: 0,
                    fontWeight: 600,
                    textAlign: 'left'
                  }}
                >
                  <FiLogOut /> Log out
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Global Interest Selector Modal */}
      <InterestSelector
        isOpen={interestModalOpen}
        onClose={() => setInterestModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
