import React, { useState } from 'react';
import { StarIcon, SparklesIcon, CalendarIcon, ClockIcon, PlayIcon, HeartIcon, AwardIcon, TomatoIcon } from './Icons';

export const Hero = ({
  featuredMovies = [],
  currentMovie,
  onSelectMovie,
  onReadReview,
  onWatchTrailer,
  onBrowseClick,
  isFavorite = false,
  onToggleFavorite
}) => {
  const [activeIdx, setActiveIdx] = useState(0);

  const movie = featuredMovies[activeIdx] || currentMovie;
  if (!movie) return null;

  const handleSelectFeatured = (idx) => {
    setActiveIdx(idx);
    if (onSelectMovie && featuredMovies[idx]) {
      onSelectMovie(featuredMovies[idx]);
    }
  };

  return (
    <section className="hero-section" id="hero">
      {/* Background Cinematic Artwork with subtle vignette and blur fade */}
      <div className="hero-backdrop-container">
        <img
          key={movie.id}
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          className="hero-backdrop"
          loading="eager"
        />
        <div className="hero-overlay-radial" />
        <div className="hero-overlay-bottom" />
        <div className="hero-overlay-left" />
      </div>

      <div className="container hero-container">
        <div className="hero-content">
          {/* Spotlight Tag */}
          <div className="hero-pill-row">
            <div className="hero-pill">
              <SparklesIcon size={14} />
              <span>CineScope Spotlight • Film of the Month</span>
            </div>

            {movie.ageRating && (
              <span className="age-rating-badge">{movie.ageRating}</span>
            )}

            <span className="format-badge">IMAX® Experience</span>
          </div>

          {/* Main Title & Tagline */}
          <h1 className="hero-title">{movie.title}</h1>
          <p className="hero-tagline">"{movie.tagline}"</p>

          {/* Realistic Ratings & Metadata Strip */}
          <div className="hero-meta-row">
            {/* CineScope Rating */}
            <div className="hero-rating-box" title="CineScope Editorial Score">
              <StarIcon filled size={16} />
              <span className="rating-num">{movie.rating.toFixed(1)}</span>
              <span className="rating-max">/ 5.0</span>
            </div>

            {/* Rotten Tomatoes */}
            {movie.rottenTomatoes && (
              <div className="hero-external-rating rt" title="Rotten Tomatoes Certified Fresh">
                <TomatoIcon size={15} />
                <span>{movie.rottenTomatoes}</span>
              </div>
            )}

            {/* IMDb Rating */}
            {movie.imdbRating && (
              <div className="hero-external-rating imdb" title="IMDb User Rating">
                <span className="imdb-text">IMDb</span>
                <span>{movie.imdbRating}</span>
              </div>
            )}

            {/* Metascore */}
            {movie.metascore && (
              <div className="hero-external-rating meta" title="Metacritic Metascore">
                <span className="meta-badge">{movie.metascore}</span>
                <span className="meta-label">Metascore</span>
              </div>
            )}

            {/* Year & Runtime */}
            <div className="hero-meta-detail">
              <CalendarIcon size={14} />
              <span>{movie.year}</span>
            </div>

            <div className="hero-meta-detail">
              <ClockIcon size={14} />
              <span>{movie.duration}</span>
            </div>
          </div>

          {/* Genres Chips */}
          <div className="hero-genre-tags">
            {movie.genres.map((g) => (
              <span key={g} className="genre-tag-sm">{g}</span>
            ))}
            <span className="director-tag">Directed by {movie.director}</span>
          </div>

          {/* Synopsis */}
          <p className="hero-synopsis">{movie.synopsis}</p>

          {/* Critic Consensus Snippet */}
          {movie.criticConsensus && (
            <div className="hero-critic-snippet">
              <span className="critic-quote">“{movie.criticConsensus}”</span>
              <span className="critic-author">— {movie.criticSource}</span>
            </div>
          )}

          {/* Action Button Row */}
          <div className="hero-btn-group">
            <button
              className="btn-primary"
              onClick={() => onReadReview(movie)}
              id="hero-read-review-btn"
            >
              <StarIcon filled size={18} />
              <span>Read Full Critique</span>
            </button>

            {movie.trailerYoutubeId && (
              <button
                className="btn-trailer"
                onClick={() => onWatchTrailer(movie)}
                id="hero-watch-trailer-btn"
              >
                <div className="play-icon-circle">
                  <PlayIcon size={14} />
                </div>
                <span>Watch Trailer</span>
              </button>
            )}

            <button
              className={`btn-hero-watchlist ${isFavorite ? 'active' : ''}`}
              onClick={() => onToggleFavorite(movie.id)}
              id="hero-watchlist-toggle-btn"
              title={isFavorite ? "In Watchlist" : "Add to Watchlist"}
            >
              <HeartIcon filled={isFavorite} size={18} />
              <span>{isFavorite ? 'In Watchlist' : 'Add to Watchlist'}</span>
            </button>
          </div>
        </div>

        {/* Featured Film Switcher (Carousel selector for realism) */}
        {featuredMovies.length > 1 && (
          <div className="hero-carousel-nav">
            <div className="carousel-label">Featured Premieres</div>
            <div className="carousel-thumbs">
              {featuredMovies.map((item, idx) => (
                <button
                  key={item.id}
                  className={`carousel-thumb-btn ${idx === activeIdx ? 'active' : ''}`}
                  onClick={() => handleSelectFeatured(idx)}
                  title={`Switch to ${item.title}`}
                >
                  <img src={item.poster} alt={item.title} className="thumb-img" />
                  <div className="thumb-info">
                    <span className="thumb-title">{item.title}</span>
                    <span className="thumb-rating">★ {item.rating.toFixed(1)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
