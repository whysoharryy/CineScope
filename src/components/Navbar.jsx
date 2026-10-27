import React from 'react';
import { FilmIcon, HeartIcon, AwardIcon, TrendingUpIcon, SparklesIcon } from './Icons';

export const Navbar = ({
  watchlistCount = 0,
  onWatchlistClick,
  onCatalogClick,
  onTopRatedClick,
  onTrendingClick,
  onGenresClick,
  activeTab = 'discover'
}) => {
  return (
    <header className="navbar" id="site-header">
      <div className="container nav-container">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={onCatalogClick} role="button" tabIndex={0} aria-label="CineScope Home">
          <div className="brand-icon-wrapper">
            <FilmIcon size={20} />
          </div>
          <div className="brand-text-col">
            <span className="brand-name">Cine<span className="brand-highlight">Scope</span></span>
            <span className="brand-subtitle">Editorial Cinema Guide</span>
          </div>
        </div>

        {/* Primary Navigation - Modern, realistic, NO devops tab */}
        <nav className="nav-links" aria-label="Main Navigation">
          <button
            className={`nav-link ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={onCatalogClick}
            id="nav-discover-btn"
          >
            <SparklesIcon size={14} />
            <span>Discover</span>
          </button>
          <button
            className={`nav-link ${activeTab === 'top-rated' ? 'active' : ''}`}
            onClick={onTopRatedClick}
            id="nav-top-rated-btn"
          >
            <AwardIcon size={14} />
            <span>Top Rated</span>
          </button>
          <button
            className={`nav-link ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={onTrendingClick}
            id="nav-trending-btn"
          >
            <TrendingUpIcon size={14} />
            <span>Trending</span>
          </button>
          <button
            className={`nav-link ${activeTab === 'genres' ? 'active' : ''}`}
            onClick={onGenresClick}
            id="nav-genres-btn"
          >
            <span>Genres</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="nav-actions">
          <button
            className={`watchlist-btn ${watchlistCount > 0 ? 'has-items' : ''}`}
            onClick={onWatchlistClick}
            title="Open Watchlist"
            id="watchlist-toggle-btn"
            aria-label={`Watchlist with ${watchlistCount} movies`}
          >
            <HeartIcon filled={watchlistCount > 0} size={16} />
            <span className="watchlist-label">Watchlist</span>
            {watchlistCount > 0 && (
              <span className="watchlist-badge">{watchlistCount}</span>
            )}
          </button>

          <button
            className="hero-cta-btn"
            onClick={onCatalogClick}
            id="browse-btn"
          >
            Browse All Films
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
