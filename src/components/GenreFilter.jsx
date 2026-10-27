import React from 'react';
import { GENRE_LIST } from '../data/movies';

export const GenreFilter = ({ selectedGenre, onSelectGenre, count, totalCount, onResetAll }) => {
  return (
    <div className="genre-filter-wrapper">
      <div className="genre-filter-row" role="tablist" aria-label="Filter by genre">
        {GENRE_LIST.map((genre) => (
          <button
            key={genre}
            className={`genre-pill ${selectedGenre === genre ? 'active' : ''}`}
            onClick={() => onSelectGenre(genre)}
            id={`genre-btn-${genre.toLowerCase()}`}
            role="tab"
            aria-selected={selectedGenre === genre}
          >
            <span className="genre-name">{genre}</span>
          </button>
        ))}
      </div>

      <div className="results-stats-row">
        <div className="stats-indicator">
          <span>Catalog Index:</span>
          <span className="active-filter-badge">{count}</span>
          <span>of {totalCount} films</span>
          {selectedGenre !== 'All' && (
            <span className="filtered-subtext">
              filtered by <strong style={{ color: '#fbbf24' }}>{selectedGenre}</strong>
              <button className="inline-reset-btn" onClick={onResetAll}>Clear</button>
            </span>
          )}
        </div>
        <div className="stats-tip">
          <span>✨ Click any film for critic breakdown & 4K trailer</span>
        </div>
      </div>
    </div>
  );
};

export default GenreFilter;
