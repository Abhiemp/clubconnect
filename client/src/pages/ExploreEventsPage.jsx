import React, { useState, useEffect } from 'react';
import { eventAPI, clubAPI } from '../services/api';
import EventCard from '../components/EventCard';
import {
  FiSearch,
  FiCalendar,
  FiFilter,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiX
} from 'react-icons/fi';

const CATEGORIES = [
  'All',
  'Technology',
  'AI & Machine Learning',
  'Coding',
  'Robotics',
  'Workshop',
  'Hackathon',
  'Cultural',
  'Music',
  'Dance',
  'Photography',
  'Sports',
  'Entrepreneurship',
  'Literature',
  'Social Service'
];

const ExploreEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [clubFilter, setClubFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('upcoming');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState('date');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Fetch clubs for the filter dropdown
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await clubAPI.getAll({ limit: 100 });
        if (res.data?.success && res.data.clubs) {
          setClubs(res.data.clubs);
        }
      } catch (err) {
        console.error('Failed to load clubs list for filter', err);
      }
    };
    fetchClubs();
  }, []);

  // Fetch events based on active filters
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 12,
        sort
      };

      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (clubFilter !== 'All') params.club = clubFilter;
      if (dateFilter !== 'all') params.date = dateFilter;
      if (onlyAvailable) params.availability = 'available';

      const res = await eventAPI.getAll(params);
      if (res.data?.success) {
        setEvents(res.data.events || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      } else {
        setError('Failed to retrieve events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Error loading events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timeout);
  }, [search, category, clubFilter, dateFilter, onlyAvailable, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setClubFilter('All');
    setDateFilter('upcoming');
    setOnlyAvailable(false);
    setSort('date');
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    category !== 'All' ||
    clubFilter !== 'All' ||
    dateFilter !== 'upcoming' ||
    onlyAvailable ||
    sort !== 'date';

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header */}
      <div className="section-header">
        <span className="section-tag">Campus Life</span>
        <h1 className="section-title">Explore Campus Events</h1>
        <p className="section-subtitle">
          Discover hackathons, workshops, guest lectures, cultural fests, and competitions. Register early to secure your spot.
        </p>
      </div>

      {/* Main Search and Control Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <FiSearch
              size={18}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)'
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search events by title, description, or keyword..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: '2.75rem', paddingRight: search ? '2.5rem' : '1rem' }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          {/* Date Timeline Tabs */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(10, 13, 20, 0.7)',
              borderRadius: 'var(--radius-md)',
              padding: '0.3rem',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {[
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'all', label: 'All Dates' },
              { id: 'past', label: 'Past Events' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setDateFilter(t.id);
                  setPage(1);
                }}
                style={{
                  border: 'none',
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  background: dateFilter === t.id ? 'var(--grad-primary)' : 'transparent',
                  color: dateFilter === t.id ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Club Filter Selector */}
          <div style={{ minWidth: '180px', flex: '0 1 200px' }}>
            <select
              className="form-control"
              value={clubFilter}
              onChange={(e) => {
                setClubFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Clubs</option>
              {clubs.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div style={{ minWidth: '160px', flex: '0 1 180px' }}>
            <select
              className="form-control"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="date">Sort by Event Date</option>
              <option value="popular">Most Popular</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Secondary Row: Available Seats Toggle and Reset */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => {
                setOnlyAvailable(e.target.checked);
                setPage(1);
              }}
              style={{
                accentColor: 'var(--primary)',
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
            <span>Show only events with open seats available</span>
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              <FiRefreshCw size={13} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Slider */}
      <div
        style={{
          display: 'flex',
          gap: '0.55rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '2rem',
          scrollbarWidth: 'thin'
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setCategory(cat);
              setPage(1);
            }}
            style={{
              whiteSpace: 'nowrap',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              transition: 'var(--transition)',
              background: category === cat ? 'var(--primary-light)' : 'var(--bg-glass-strong)',
              borderColor: category === cat ? 'var(--primary)' : 'var(--border-subtle)',
              color: category === cat ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active Count & Meta */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          color: 'var(--text-dim)',
          fontSize: '0.9rem'
        }}
      >
        <span>
          Showing{' '}
          <strong style={{ color: 'var(--text-main)' }}>{events.length}</strong>{' '}
          {events.length === 1 ? 'event' : 'events'}
          {pagination.total > 0 && ` of ${pagination.total} total`}
        </span>
      </div>

      {/* Content Rendering: Loading / Error / Empty / Grid */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '350px',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              border: '3px solid rgba(99, 102, 241, 0.2)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Loading events...</p>
        </div>
      ) : error ? (
        <div
          className="glass-card"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '2rem auto'
          }}
        >
          <FiAlertCircle size={44} style={{ color: 'var(--rose)', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Unable to Load Events</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <button type="button" onClick={fetchEvents} className="btn btn-primary">
            <FiRefreshCw /> Try Again
          </button>
        </div>
      ) : events.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: '550px',
            margin: '2rem auto'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
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
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.35rem' }}>No events found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {hasActiveFilters
              ? 'No events match your current filter selection. Try adjusting your search keywords, category, or date range.'
              : 'There are currently no events scheduled on the campus calendar.'}
          </p>
          {hasActiveFilters && (
            <button type="button" onClick={handleResetFilters} className="btn btn-secondary">
              <FiRefreshCw /> Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '3.5rem'
              }}
            >
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', padding: '0 0.75rem' }}>
                Page {page} of {pagination.pages}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExploreEventsPage;

