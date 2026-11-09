import React from 'react';
import { Link } from 'react-router-dom';
import { HiSparkles as FiSparkles } from 'react-icons/hi2';
import { FiHeart, FiGithub, FiGlobe, FiMail } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer
      style={{
        background: '#080a10',
        borderTop: '1px solid var(--border-subtle)',
        padding: '4rem 0 2rem',
        marginTop: '6rem',
        position: 'relative'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '3rem',
            marginBottom: '3rem'
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'var(--grad-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiSparkles color="#fff" size={18} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                Club<span className="gradient-text">Connect</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Discover. Connect. Participate. The centralized campus hub unifying student activities, club memberships, and AI-powered event recommendations.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href="#github" className="btn-icon" aria-label="GitHub"><FiGithub size={16} /></a>
              <a href="#web" className="btn-icon" aria-label="Website"><FiGlobe size={16} /></a>
              <a href="mailto:support@clubconnect.edu" className="btn-icon" aria-label="Email"><FiMail size={16} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', color: '#ffffff' }}>
              Explore Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li><Link to="/clubs" style={{ transition: 'var(--transition)' }}>Browse Campus Clubs</Link></li>
              <li><Link to="/events" style={{ transition: 'var(--transition)' }}>Upcoming Events & Hackathons</Link></li>
              <li><Link to="/recommendations" style={{ transition: 'var(--transition)' }}>AI Event Matcher</Link></li>
              <li><Link to="/announcements" style={{ transition: 'var(--transition)' }}>Campus Announcements</Link></li>
            </ul>
          </div>

          {/* For Organizers */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', color: '#ffffff' }}>
              For Club Leaders
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li><Link to="/club-admin" style={{ transition: 'var(--transition)' }}>Organizer Portal</Link></li>
              <li><Link to="/events" style={{ transition: 'var(--transition)' }}>Manage Registrations</Link></li>
              <li><Link to="/announcements" style={{ transition: 'var(--transition)' }}>Publish News</Link></li>
              <li><Link to="/login" style={{ transition: 'var(--transition)' }}>Leader Sign In</Link></li>
            </ul>
          </div>

          {/* Quick Demo Credentials for Assignment Evaluation */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--accent)' }}>
              Demo Evaluator Logins
            </h4>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ marginBottom: '0.4rem' }}>
                <strong style={{ color: '#fff' }}>Student:</strong> student@college.edu / Student@123
              </div>
              <div style={{ marginBottom: '0.4rem' }}>
                <strong style={{ color: '#fff' }}>Organizer:</strong> coding@college.edu / ClubAdmin@123
              </div>
              <div>
                <strong style={{ color: '#fff' }}>Admin:</strong> admin@college.edu / Admin@123
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            color: 'var(--text-dim)',
            fontSize: '0.85rem'
          }}
        >
          <div>&copy; {new Date().getFullYear()} ClubConnect. Built for College CIA 02 Full-Stack Web App.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Crafted with <FiHeart style={{ color: 'var(--pink)' }} /> for campus innovators
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
