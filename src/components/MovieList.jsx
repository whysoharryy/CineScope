import React from 'react';
import { MovieCard } from './MovieCard';
import { FilmIcon, SparklesIcon } from './Icons';

export const MovieList = ({
  movies,
  favorites,
  onToggleFavorite,
  onSelectMovie,
  onWatchTrailer,
  onResetFilters,
  viewMode = 'grid'
}) => {
  if (movies.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon-wrap">
          <FilmIcon size={52} />
        </div>
        <h3 className="empty-title">No Cinematic Matches Found</h3>
        <p className="empty-desc">
          We couldn't locate any films matching your search terms or genre filter. Try searching for a director (e.g. "Nolan", "Villeneuve"), or clear all active filters.
        </p>
        <button
          className="btn-primary"
          onClick={onResetFilters}
          id="reset-filters-btn"
        >
          <SparklesIcon size={16} />
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className={viewMode === 'list' ? 'movies-list-container' : 'movies-grid'} id="movies-container">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isFavorite={favorites.includes(movie.id)}
          onToggleFavorite={onToggleFavorite}
          onClick={() => onSelectMovie(movie)}
          onWatchTrailer={onWatchTrailer}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};

export default MovieList;
