import React, { useState, useEffect } from 'react';
import { clubAPI } from '../services/api';
import ClubCard from '../components/ClubCard';
import { FiSearch, FiCompass, FiFilter } from 'react-icons/fi';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Arts', 'Academic', 'Social'];

const ExploreClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('members');

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (sort) params.sort = sort;

      const res = await clubAPI.getAll(params);
      if (res.data?.success) {
        setClubs(res.data.clubs || []);
      }
    } catch (err) {
      console.error('Error fetching clubs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchClubs, 300);
    return () => clearTimeout(timeout);
  }, [search, category, sort]);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header */}
      <div className="section-header">
        <span className="section-tag">Campus Directory</span>
        <h1 className="section-title">Explore Student Clubs</h1>
        <p className="section-subtitle">
          Find your community. Connect with societies passionate about technology, music, debate, robotics, sports, and social service.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          marginBottom: '2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <FiSearch
            size={18}
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Search clubs by name or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>

        {/* Sort Dropdown */}
        <div style={{ minWidth: '180px' }}>
          <select
            className="form-control"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="members">Most Members</option>
            <option value="name">Alphabetical (A-Z)</option>
            <option value="newest">Recently Formed</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          marginBottom: '2rem'
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Club Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <FiCompass size={36} className="spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <div>Discovering campus clubs...</div>
        </div>
      ) : clubs.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <FiCompass size={40} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Clubs Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            We couldn't find any clubs matching your current search or category filter.
          </p>
        </div>
      ) : (
        <div className="grid-cards">
          {clubs.map((club) => (
            <ClubCard
              key={club._id}
              club={club}
              onMembershipChanged={() => fetchClubs()}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreClubsPage;
