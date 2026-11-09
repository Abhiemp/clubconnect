import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recommendationAPI } from '../services/api';
import EventCard from '../components/EventCard';
import InterestSelector from '../components/InterestSelector';
import { HiSparkles as FiSparkles } from 'react-icons/hi2';
import {
  FiSliders,
  FiInfo,
  FiCheckCircle,
  FiArrowRight,
  FiTag,
  FiAlertCircle
} from 'react-icons/fi';

const RecommendationsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState('');

  const fetchRecommendations = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await recommendationAPI.getEvents();
      if (res.data?.success) {
        setRecommendations(res.data.events || []);
        if (res.data.message) {
          setEmptyMessage(res.data.message);
        }
      }
    } catch (err) {
      console.error('Error fetching recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [isAuthenticated, user?.interests]);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.12) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          marginBottom: '3rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '780px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', background: 'rgba(236, 72, 153, 0.18)', border: '1px solid rgba(236, 72, 153, 0.4)', color: '#f472b6', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
            <FiSparkles /> AI Content-Based Engine
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Recommended <span className="gradient-text">For You</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            Events dynamically matched to your declared interests. The matching engine cross-references event categories, tags, and titles against your profile topics to compute personalized match scores.
          </p>

          {/* Active Interest Chips */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Your Topics:
              </span>
              {user?.interests && user.interests.length > 0 ? (
                user.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(99, 102, 241, 0.2)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      color: '#c7d2fe',
                      fontSize: '0.82rem',
                      fontWeight: 600
                    }}
                  >
                    <FiTag size={12} /> {interest}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.85rem', color: '#fbbf24' }}>
                  No interests selected yet!
                </span>
              )}

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setInterestModalOpen(true)}
                style={{ marginLeft: '0.5rem' }}
              >
                <FiSliders size={14} /> Customize Interests
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/login" className="btn btn-primary">
                Log In to Personalize
              </Link>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Select your topics to unlock tailored recommendations!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {!isAuthenticated ? (
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
          <FiSparkles size={48} style={{ color: 'var(--pink)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Sign In to See Recommendations</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            ClubConnect analyzes your selected technical, cultural, and sports interests to calculate match ratings for every upcoming event.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/login" className="btn btn-primary">
              Log In Now
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <FiSparkles className="spin" size={32} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
          <div>Computing your tailored event recommendations...</div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
          <FiAlertCircle size={44} style={{ color: '#fbbf24', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Matches Found Yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            {emptyMessage || 'We couldn\'t find events matching your current selected topics. Try adding broader interests like "Web Development", "AI & Machine Learning", or "Dance"!'}
          </p>
          <button className="btn btn-primary" onClick={() => setInterestModalOpen(true)}>
            <FiSliders /> Update Your Topics Now
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                Matched Events ({recommendations.length})
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Sorted by highest compatibility percentage
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setInterestModalOpen(true)}>
              <FiSliders /> Edit Interests
            </button>
          </div>

          <div className="grid-cards">
            {recommendations.map(({ event, matchPercentage, matchingInterests, reason }) => (
              <EventCard
                key={event._id}
                event={event}
                matchPercentage={matchPercentage}
                matchingInterests={matchingInterests}
                recommendationReason={reason}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <InterestSelector
        isOpen={interestModalOpen}
        onClose={() => setInterestModalOpen(false)}
        onUpdated={() => fetchRecommendations()}
      />
    </div>
  );
};

export default RecommendationsPage;
