import React, { useState } from 'react';
import { StarIcon, HeartIcon, ClockIcon, FilmIcon, PlayIcon, TomatoIcon } from './Icons';

export const MovieCard = ({
  movie,
  isFavorite,
  onToggleFavorite,
  onClick,
  onWatchTrailer,
  viewMode = 'grid'
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(movie.id);
  };

  const handleTrailerClick = (e) => {
    e.stopPropagation();
    if (onWatchTrailer) {
      onWatchTrailer(movie);
    } else {
      onClick();
    }
  };

  // List View Layout
  if (viewMode === 'list') {
    return (
      <article
        className="movie-list-item"
        onClick={onClick}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        aria-label={`View review for ${movie.title}`}
        id={`movie-item-${movie.id}`}
      >
        <div className="list-poster-box">
          {imageError ? (
            <div className="poster-fallback-sm">
              <FilmIcon size={24} />
            </div>
          ) : (
            <img
              src={movie.poster}
              alt={movie.title}
              className="list-poster-img"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}
        </div>

        <div className="list-body">
          <div className="list-header">
            <div>
              <div className="list-title-row">
                <h3 className="list-title">{movie.title}</h3>
                <span className="movie-year-badge">{movie.year}</span>
                {movie.ageRating && <span className="age-rating-pill">{movie.ageRating}</span>}
              </div>
              <p className="list-director">Directed by <strong>{movie.director}</strong></p>
            </div>

            <div className="list-ratings">
              <div className="rating-badge-gold">
                <StarIcon filled size={14} />
                <span>{movie.rating.toFixed(1)}</span>
              </div>
              {movie.rottenTomatoes && (
                <div className="badge-rt-sm">
                  <TomatoIcon size={13} />
                  <span>{movie.rottenTomatoes}</span>
                </div>
              )}
            </div>
          </div>

          <p className="list-synopsis">{movie.synopsis}</p>

          <div className="list-footer">
            <div className="list-genres">
              {movie.genres.map((g) => (
                <span key={g} className="genre-chip">{g}</span>
              ))}
            </div>

            <div className="list-actions">
              {movie.trailerYoutubeId && (
                <button
                  className="list-btn-trailer"
                  onClick={handleTrailerClick}
                  title="Watch Trailer"
                >
                  <PlayIcon size={12} />
                  <span>Trailer</span>
                </button>
              )}
              <button
                className={`favorite-btn-inline ${isFavorite ? 'active' : ''}`}
                onClick={handleFavoriteClick}
                title={isFavorite ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                <HeartIcon filled={isFavorite} size={15} />
              </button>
              <button className="card-view-btn" tabIndex={-1}>
                <span>Critique</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Standard Modern Grid View
  return (
    <article
      className="movie-card"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View critique for ${movie.title}`}
      id={`movie-card-${movie.id}`}
    >
      <div className="movie-poster-box">
        {imageError ? (
          <div className="poster-fallback">
            <FilmIcon size={44} />
            <span className="fallback-title">{movie.title}</span>
            <span className="fallback-year">({movie.year})</span>
          </div>
        ) : (
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            className="movie-poster-img"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        )}

        <div className="poster-gradient-overlay" />

        {/* Top Badges */}
        <div className="poster-top-badges">
          <div className="rating-badge" title={`CineScope: ${movie.rating} / 5`}>
            <StarIcon filled size={14} />
            <span>{movie.rating.toFixed(1)}</span>
          </div>

          {movie.rottenTomatoes && (
            <div className="rotten-badge" title={`Rotten Tomatoes: ${movie.rottenTomatoes}`}>
              <TomatoIcon size={13} />
              <span>{movie.rottenTomatoes}</span>
            </div>
          )}

          {movie.ageRating && (
            <span className="poster-age-rating">{movie.ageRating}</span>
          )}
        </div>

        {/* Floating Watchlist Button */}
        <button
          className={`favorite-btn ${isFavorite ? 'is-fav' : ''}`}
          onClick={handleFavoriteClick}
          title={isFavorite ? "Remove from Watchlist" : "Save to Watchlist"}
          aria-label={isFavorite ? "Remove from Watchlist" : "Add to Watchlist"}
          id={`favorite-btn-${movie.id}`}
        >
          <HeartIcon filled={isFavorite} size={16} />
        </button>

        {/* Quick Trailer Play Button overlay on hover */}
        {movie.trailerYoutubeId && (
          <div className="poster-hover-actions">
            <button
              className="quick-trailer-btn"
              onClick={handleTrailerClick}
              title="Watch Official Trailer"
            >
              <div className="quick-play-icon">
                <PlayIcon size={14} />
              </div>
              <span>Trailer</span>
            </button>
          </div>
        )}
      </div>

      <div className="movie-card-body">
        <div className="movie-card-header">
          <h2 className="movie-card-title">{movie.title}</h2>
          <span className="movie-year-badge">{movie.year}</span>
        </div>

        <div className="movie-director-line">
          <span>Dir. {movie.director}</span>
        </div>

        <div className="movie-meta-chips">
          {movie.genres.slice(0, 3).map((g) => (
            <span key={g} className="genre-chip">{g}</span>
          ))}
        </div>

        <p className="movie-synopsis-snippet">{movie.synopsis}</p>

        {/* Cast snippet if available */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="movie-cast-snippet">
            <span className="cast-label">Cast: </span>
            <span className="cast-names">
              {movie.cast.slice(0, 2).map((c) => (typeof c === 'string' ? c : c.name)).join(', ')}
            </span>
          </div>
        )}

        <div className="movie-card-footer">
          <div className="duration-info">
            <ClockIcon size={14} />
            <span>{movie.duration}</span>
          </div>

          <button className="card-view-btn" aria-hidden="true" tabIndex={-1}>
            <span>Critique & Specs</span>
            <span className="arrow-icon">&rarr;</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default MovieCard;
