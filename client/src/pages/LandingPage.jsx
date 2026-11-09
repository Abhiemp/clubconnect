import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clubAPI, eventAPI, statsAPI } from '../services/api';
import EventCard from '../components/EventCard';
import ClubCard from '../components/ClubCard';
import { HiSparkles as FiSparkles } from 'react-icons/hi2';
import {
  FiCompass,
  FiCalendar,
  FiUsers,
  FiAward,
  FiArrowRight,
  FiCheckCircle,
  FiZap,
  FiLayers
} from 'react-icons/fi';

const LandingPage = () => {
  const [stats, setStats] = useState({
    totalClubs: 12,
    totalEvents: 24,
    totalUsers: 340,
    totalRegistrations: 520
  });
  const [featuredClubs, setFeaturedClubs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, clubsRes, eventsRes] = await Promise.allSettled([
          statsAPI.getPublic(),
          clubAPI.getAll({ limit: 3, sort: 'members' }),
          eventAPI.getAll({ date: 'upcoming', limit: 3, sort: 'date' })
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value?.data?.stats) {
          setStats(statsRes.value.data.stats);
        }
        if (clubsRes.status === 'fulfilled' && clubsRes.value?.data?.clubs) {
          setFeaturedClubs(clubsRes.value.data.clubs);
        }
        if (eventsRes.status === 'fulfilled' && eventsRes.value?.data?.events) {
          setUpcomingEvents(eventsRes.value.data.events);
        }
      } catch (err) {
        console.error('Error loading landing page data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '4.5rem 0 5.5rem',
          textAlign: 'center',
          overflow: 'hidden'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Tagline Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 1.1rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginBottom: '1.75rem',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)'
            }}
          >
            <FiSparkles style={{ color: '#818cf8' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c7d2fe' }}>
              The Next-Gen Campus Activity Hub
            </span>
          </div>

          {/* Main Hero Title */}
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '1.5rem',
              maxWidth: '900px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            Discover. Connect.{' '}
            <span className="gradient-text">Participate.</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.2rem',
              color: 'var(--text-muted)',
              maxWidth: '680px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.6
            }}
          >
            Stop missing out on hackathons, club drives, cultural fests, and workshops.
            ClubConnect brings every student community and AI-tailored event right to your fingertips.
          </p>

          {/* CTA Group */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '3.5rem'
            }}
          >
            <Link to="/events" className="btn btn-primary btn-lg">
              <FiCalendar /> Explore Upcoming Events
            </Link>
            <Link to="/recommendations" className="btn btn-secondary btn-lg" style={{ borderColor: 'rgba(236, 72, 153, 0.4)' }}>
              <FiSparkles style={{ color: 'var(--pink)' }} /> Try AI Matcher
            </Link>
          </div>

          {/* Live Platform Stats Strip */}
          <div
            style={{
              maxWidth: '880px',
              margin: '0 auto',
              background: 'var(--bg-card)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem 2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '2rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                {stats.totalClubs}+
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Campus Clubs</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)' }}>
                {stats.totalEvents}+
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Events Scheduled</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--pink)' }}>
                {stats.totalRegistrations}+
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Event Registrations</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--emerald)' }}>
                {stats.totalUsers}+
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Student Members</div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiating Feature Callout: Content-Based Event Recommendations */}
      <section style={{ padding: '4.5rem 0', background: 'rgba(255, 255, 255, 0.015)' }}>
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(236, 72, 153, 0.08) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem 2.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center'
            }}
          >
            <div>
              <span className="badge badge-match" style={{ marginBottom: '1rem' }}>
                <FiSparkles /> Differentiating Core Feature
              </span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.25 }}>
                Personalized Event Matcher <br />
                <span className="gradient-text">Powered by Your Interests</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Never scroll through irrelevant lists again. Select your topics—whether it's Artificial Intelligence, Robotics, Photography, Dance, or Competitive Coding—and our content-based matching engine scores every event to surface what fits you best.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#cbd5e1' }}>
                  <FiCheckCircle style={{ color: 'var(--emerald)' }} />
                  <span>Real-time match scoring (0 - 100%) based on category & tag taxonomy</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#cbd5e1' }}>
                  <FiCheckCircle style={{ color: 'var(--emerald)' }} />
                  <span>Transparent explanations: "Recommended because of your interest in Web Dev"</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#cbd5e1' }}>
                  <FiCheckCircle style={{ color: 'var(--emerald)' }} />
                  <span>Instant 1-click registration with live capacity indicators</span>
                </div>
              </div>
              <Link to="/recommendations" className="btn btn-primary">
                View My Recommendations <FiArrowRight />
              </Link>
            </div>

            {/* Visual Teaser Mockup */}
            <div
              style={{
                background: '#121829',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                  Recommendation Engine Sample
                </span>
                <span className="badge badge-match">96% High Match</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                National Hackathon 2026: GenAI & Web3
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Hosted by Coding & Algorithmic Club
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                <span className="badge badge-primary">AI & Machine Learning</span>
                <span className="badge badge-secondary">Web Development</span>
                <span className="badge badge-accent">Hackathon</span>
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: '#f472b6',
                  background: 'rgba(236, 72, 153, 0.1)',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid #ec4899'
                }}
              >
                Why this was picked: Direct match with your active interests in "AI & Machine Learning" and "Web Development".
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Clubs Showcase */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div className="section-header" style={{ marginBottom: 0 }}>
              <span className="section-tag">Campus Communities</span>
              <h2 className="section-title">Explore Active Clubs</h2>
              <p className="section-subtitle">
                Join passionate student communities across technology, arts, sports, and entrepreneurship.
              </p>
            </div>
            <Link to="/clubs" className="btn btn-secondary" style={{ display: 'none', md: 'inline-flex' }}>
              View All Clubs <FiArrowRight />
            </Link>
          </div>

          <div className="grid-cards">
            {featuredClubs.length > 0 ? (
              featuredClubs.map(club => <ClubCard key={club._id} club={club} />)
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>Loading campus clubs...</div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/clubs" className="btn btn-secondary">
              Browse All Clubs <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events Grid */}
      <section style={{ padding: '4.5rem 0', background: 'rgba(255, 255, 255, 0.015)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div className="section-header" style={{ marginBottom: 0 }}>
              <span className="section-tag">Don't Miss Out</span>
              <h2 className="section-title">Upcoming Activities</h2>
              <p className="section-subtitle">
                Workshops, competitions, guest lectures, and club meetups happening soon.
              </p>
            </div>
            <Link to="/events" className="btn btn-secondary">
              View All Events <FiArrowRight />
            </Link>
          </div>

          <div className="grid-cards">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => <EventCard key={event._id} event={event} />)
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>Loading upcoming events...</div>
            )}
          </div>
        </div>
      </section>

      {/* Why ClubConnect Feature Pillars */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Built For Students & Clubs</span>
            <h2 className="section-title">Why Campus Uses ClubConnect</h2>
            <p className="section-subtitle">
              Solving fragmented WhatsApp groups, missed deadlines, and lost spreadsheets with a single intuitive platform.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}
          >
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  color: 'var(--primary)'
                }}
              >
                <FiCompass size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>Unified Discovery</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Find all official clubs in one central directory. Filter by technical, cultural, sports, and academic societies.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(236, 72, 153, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  color: 'var(--pink)'
                }}
              >
                <FiSparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>AI Recommendations</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Select your preferred topics and receive event matches tailored specifically to your career and hobbies.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  color: 'var(--accent)'
                }}
              >
                <FiZap size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>Instant Registrations</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Register in one click without redundant Google Forms. Keep track of all your event tickets in your dashboard.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  color: 'var(--emerald)'
                }}
              >
                <FiAward size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>Organizer Management</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Club presidents can schedule events, track RSVPs, mark digital attendance, and broadcast announcements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section style={{ padding: '4rem 0 2rem' }}>
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.25) 50%, rgba(236, 72, 153, 0.25) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 'var(--radius-lg)',
              padding: '3.5rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '1rem' }}>
              Ready to immerse in campus life?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              Join hundreds of fellow students, discover exciting events, and build lifelong memories with ClubConnect.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Student Account
              </Link>
              <Link to="/clubs" className="btn btn-secondary btn-lg">
                Browse Campus Clubs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
