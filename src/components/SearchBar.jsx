import React, { useEffect, useRef } from 'react';
import { SearchIcon, CloseIcon, GridIcon, ListIcon } from './Icons';
import { SORT_OPTIONS } from '../data/movies';

export const SearchBar = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode = 'grid',
  onViewModeChange,
  quickFilter,
  onQuickFilterChange
}) => {
  const inputRef = useRef(null);

  // Keyboard shortcut: Press "/" or "Ctrl+K" to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') ||
          (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="search-control-center">
      {/* Top Quick Filters row */}
      <div className="quick-filter-strip">
        <button
          className={`quick-pill ${quickFilter === 'all' ? 'active' : ''}`}
          onClick={() => onQuickFilterChange('all')}
        >
          All Premieres
        </button>
        <button
          className={`quick-pill ${quickFilter === 'top-rated' ? 'active' : ''}`}
          onClick={() => onQuickFilterChange('top-rated')}
        >
          ★ 4.8+ Masterpieces
        </button>
        <button
          className={`quick-pill ${quickFilter === 'oscars' ? 'active' : ''}`}
          onClick={() => onQuickFilterChange('oscars')}
        >
          🏆 Oscar Winners
        </button>
        <button
          className={`quick-pill ${quickFilter === 'blockbusters' ? 'active' : ''}`}
          onClick={() => onQuickFilterChange('blockbusters')}
        >
          🔥 Modern Epics
        </button>
      </div>

      {/* Main Search & Sort Bar */}
      <div className="search-sort-row">
        <div className="search-input-box">
          <span className="search-icon-inside">
            <SearchIcon size={18} />
          </span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search by title, director (Nolan, Denis), cast, or themes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            id="movie-search-input"
            aria-label="Search movies"
          />
          <div className="search-input-tools">
            {searchQuery ? (
              <button
                className="search-clear-btn"
                onClick={() => {
                  onSearchChange('');
                  inputRef.current?.focus();
                }}
                title="Clear search"
                id="clear-search-btn"
                aria-label="Clear search input"
              >
                <CloseIcon size={16} />
              </button>
            ) : (
              <kbd className="search-kbd-hint" title="Press / to search">/</kbd>
            )}
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="sort-select-box">
          <label htmlFor="movie-sort" className="sort-label">Sort:</label>
          <div className="sort-dropdown-wrap">
            <select
              id="movie-sort"
              className="sort-dropdown"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle (Grid vs Detailed List) */}
        {onViewModeChange && (
          <div className="view-toggle-box">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
              title="Poster Grid View"
              aria-label="Grid view"
            >
              <GridIcon size={18} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange('list')}
              title="Detailed List View"
              aria-label="Detailed list view"
            >
              <ListIcon size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
