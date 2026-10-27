import React, { useState, useEffect } from 'react';
import {
  CloseIcon,
  StarIcon,
  CalendarIcon,
  ClockIcon,
  QuoteIcon,
  FilmIcon,
  HeartIcon,
  PlayIcon,
  TomatoIcon,
  CheckIcon,
  ShareIcon
} from './Icons';

export const MovieModal = ({
  movie,
  onClose,
  onAddUserReview,
  onWatchTrailer,
  isFavorite = false,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'cast' | 'reviews' | 'specs'
  const [userName, setUserName] = useState('');
  const [userRating, setUserRating] = useState('5');
  const [userComment, setUserComment] = useState('');
  const [posterError, setPosterError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent background body scroll while modal is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!movie) return null;

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!userName.trim() || !userComment.trim()) return;

    onAddUserReview(movie.id, {
      id: Date.now(),
      user: userName.trim(),
      rating: parseFloat(userRating),
      date: 'Just now',
      comment: userComment.trim()
    });

    setUserName('');
    setUserComment('');
    setUserRating('5');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + '#' + movie.id);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-movie-title"
    >
      <div className="modal-container">
        {/* Floating Close Button */}
        <button
          className="modal-close-btn"
          onClick={onClose}
          title="Close review modal (ESC)"
          id="modal-close-button"
        >
          <CloseIcon size={20} />
        </button>

        <div className="modal-scrollable">
          {/* Header Banner Backdrop with Film Grain and Vignette */}
          <div className="modal-banner">
            <img
              src={movie.backdrop || movie.poster}
              alt={movie.title}
              className="modal-banner-img"
            />
            <div className="modal-banner-overlay" />

            {/* Quick Trailer Button floating in the backdrop banner */}
            {movie.trailerYoutubeId && (
              <button
                className="banner-trailer-btn"
                onClick={() => onWatchTrailer && onWatchTrailer(movie)}
                title="Play 4K Trailer"
              >
                <div className="banner-play-icon">
                  <PlayIcon size={16} />
                </div>
                <span>Play 4K Trailer</span>
              </button>
            )}
          </div>

          <div className="modal-body">
            {/* Header Layout */}
            <div className="modal-header-layout">
              <div className="modal-poster-wrapper">
                {posterError ? (
                  <div className="poster-fallback">
                    <FilmIcon size={40} />
                    <span style={{ fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>{movie.title}</span>
                  </div>
                ) : (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="modal-poster-img"
                    onError={() => setPosterError(true)}
                  />
                )}
              </div>

              <div className="modal-header-info">
                <div className="modal-top-badges">
                  {movie.ageRating && <span className="modal-age-badge">{movie.ageRating}</span>}
                  {movie.badges && movie.badges.map((b) => (
                    <span key={b} className="modal-honor-badge">{b}</span>
                  ))}
                </div>

                <h2 className="modal-title" id="modal-movie-title">{movie.title}</h2>
                <p className="modal-tagline">"{movie.tagline}"</p>

                <div className="modal-specs-row">
                  <div className="spec-item">
                    <CalendarIcon size={15} />
                    <span>{movie.year}</span>
                  </div>
                  <div className="spec-item">
                    <ClockIcon size={15} />
                    <span>{movie.duration}</span>
                  </div>
                  <div className="hero-genre-tags">
                    {movie.genres.map((g) => (
                      <span key={g} className="genre-tag-sm">{g}</span>
                    ))}
                  </div>
                </div>

                {/* Real-World Ratings Bar */}
                <div className="modal-ratings-strip">
                  <div className="rating-chip cinescope">
                    <StarIcon filled size={16} />
                    <div className="rating-col">
                      <span className="rating-chip-label">CineScope Score</span>
                      <span className="rating-chip-value gold">{movie.rating.toFixed(1)} <small>/ 5.0</small></span>
                    </div>
                  </div>

                  {movie.rottenTomatoes && (
                    <div className="rating-chip rt">
                      <TomatoIcon size={16} />
                      <div className="rating-col">
                        <span className="rating-chip-label">Rotten Tomatoes</span>
                        <span className="rating-chip-value red">{movie.rottenTomatoes}</span>
                      </div>
                    </div>
                  )}

                  {movie.imdbRating && (
                    <div className="rating-chip imdb">
                      <span className="imdb-box">IMDb</span>
                      <div className="rating-col">
                        <span className="rating-chip-label">Audience Score</span>
                        <span className="rating-chip-value yellow">{movie.imdbRating}</span>
                      </div>
                    </div>
                  )}

                  {movie.metascore && (
                    <div className="rating-chip meta">
                      <span className="meta-box">{movie.metascore}</span>
                      <div className="rating-col">
                        <span className="rating-chip-label">Metascore</span>
                        <span className="rating-chip-value green">{movie.metascore}/100</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Action Bar */}
                <div className="modal-actions-bar">
                  <button
                    className={`modal-watchlist-btn ${isFavorite ? 'active' : ''}`}
                    onClick={() => onToggleFavorite && onToggleFavorite(movie.id)}
                  >
                    <HeartIcon filled={isFavorite} size={16} />
                    <span>{isFavorite ? 'In Your Watchlist' : 'Add to Watchlist'}</span>
                  </button>

                  <button className="modal-share-btn" onClick={handleShare} title="Share Film Link">
                    {copiedLink ? <CheckIcon size={15} /> : <ShareIcon size={15} />}
                    <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Interactive Navigation Tabs */}
            <div className="modal-tabs-nav">
              <button
                className={`modal-tab-btn ${activeTab === 'review' ? 'active' : ''}`}
                onClick={() => setActiveTab('review')}
              >
                Critic Review & Verdict
              </button>
              <button
                className={`modal-tab-btn ${activeTab === 'cast' ? 'active' : ''}`}
                onClick={() => setActiveTab('cast')}
              >
                Cast & Production
              </button>
              <button
                className={`modal-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Audience Reviews ({movie.userReviews ? movie.userReviews.length : 0})
              </button>
              <button
                className={`modal-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                onClick={() => setActiveTab('specs')}
              >
                Technical & Box Office
              </button>
            </div>

            {/* TAB 1: CRITIC REVIEW & VERDICT */}
            {activeTab === 'review' && (
              <div className="modal-tab-content">
                {/* Synopsis */}
                <div className="modal-section">
                  <h3 className="modal-section-title">The Story</h3>
                  <p className="modal-synopsis-text">{movie.synopsis}</p>
                </div>

                {/* Critic Review */}
                <div className="modal-section">
                  <div className="critic-header-row">
                    <h3 className="modal-section-title">Editorial Critique</h3>
                    {movie.criticSource && (
                      <span className="critic-syndicate-tag">Syndicated via {movie.criticSource}</span>
                    )}
                  </div>
                  <div className="critic-review-card">
                    <p className="critic-text">"{movie.fullReview}"</p>
                    <div className="critic-verdict">
                      <QuoteIcon size={20} />
                      <span><strong>The Verdict:</strong> {movie.verdict}</span>
                    </div>
                  </div>
                </div>

                {/* Technical Score Breakdown Meters */}
                {movie.scoreBreakdown && (
                  <div className="modal-section">
                    <h3 className="modal-section-title">Cinematic Craft Breakdown</h3>
                    <div className="score-breakdown-grid">
                      <div className="score-meter-card">
                        <div className="meter-label-row">
                          <span>Direction & Pacing</span>
                          <strong>{movie.scoreBreakdown.direction} / 10</strong>
                        </div>
                        <div className="meter-track">
                          <div
                            className="meter-fill"
                            style={{ width: `${movie.scoreBreakdown.direction * 10}%` }}
                          />
                        </div>
                      </div>

                      <div className="score-meter-card">
                        <div className="meter-label-row">
                          <span>Screenplay & Theme</span>
                          <strong>{movie.scoreBreakdown.screenplay} / 10</strong>
                        </div>
                        <div className="meter-track">
                          <div
                            className="meter-fill"
                            style={{ width: `${movie.scoreBreakdown.screenplay * 10}%` }}
                          />
                        </div>
                      </div>

                      <div className="score-meter-card">
                        <div className="meter-label-row">
                          <span>Performances & Chemistry</span>
                          <strong>{movie.scoreBreakdown.acting} / 10</strong>
                        </div>
                        <div className="meter-track">
                          <div
                            className="meter-fill"
                            style={{ width: `${movie.scoreBreakdown.acting * 10}%` }}
                          />
                        </div>
                      </div>

                      <div className="score-meter-card">
                        <div className="meter-label-row">
                          <span>Cinematography & Framing</span>
                          <strong>{movie.scoreBreakdown.cinematography} / 10</strong>
                        </div>
                        <div className="meter-track">
                          <div
                            className="meter-fill"
                            style={{ width: `${movie.scoreBreakdown.cinematography * 10}%` }}
                          />
                        </div>
                      </div>

                      <div className="score-meter-card">
                        <div className="meter-label-row">
                          <span>Sound Design & Original Score</span>
                          <strong>{movie.scoreBreakdown.soundScore} / 10</strong>
                        </div>
                        <div className="meter-track">
                          <div
                            className="meter-fill"
                            style={{ width: `${movie.scoreBreakdown.soundScore * 10}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CAST & PRODUCTION */}
            {activeTab === 'cast' && (
              <div className="modal-tab-content">
                <div className="modal-section">
                  <h3 className="modal-section-title">Principal Cast & Characters</h3>
                  <div className="cast-character-grid">
                    {movie.cast && movie.cast.map((item, idx) => {
                      const actorName = typeof item === 'string' ? item : item.name;
                      const roleName = typeof item === 'string' ? 'Lead Character' : item.role;
                      return (
                        <div key={idx} className="cast-character-card">
                          <div className="cast-avatar">
                            {actorName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div className="cast-text">
                            <span className="cast-actor-name">{actorName}</span>
                            <span className="cast-role-name">{roleName}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="modal-section">
                  <h3 className="modal-section-title">Key Creative Crew</h3>
                  <div className="crew-grid">
                    <div className="crew-item">
                      <span className="crew-role">Director</span>
                      <strong className="crew-name">{movie.director}</strong>
                    </div>
                    {movie.cinematography && (
                      <div className="crew-item">
                        <span className="crew-role">Director of Photography</span>
                        <strong className="crew-name">{movie.cinematography}</strong>
                      </div>
                    )}
                    {movie.music && (
                      <div className="crew-item">
                        <span className="crew-role">Original Music Composer</span>
                        <strong className="crew-name">{movie.music}</strong>
                      </div>
                    )}
                    {movie.studio && (
                      <div className="crew-item">
                        <span className="crew-role">Production Studio</span>
                        <strong className="crew-name">{movie.studio}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AUDIENCE REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="modal-tab-content">
                <div className="modal-section">
                  <h3 className="modal-section-title">
                    Audience Reviews ({movie.userReviews ? movie.userReviews.length : 0})
                  </h3>

                  <div className="user-reviews-list">
                    {movie.userReviews && movie.userReviews.map((rev) => (
                      <div key={rev.id} className="user-review-item">
                        <div className="review-author-row">
                          <div className="reviewer-meta">
                            <div className="reviewer-avatar">
                              {rev.user.slice(0, 1).toUpperCase()}
                            </div>
                            <span className="reviewer-name">{rev.user}</span>
                            <span className="verified-badge">✓ Verified Filmgoer</span>
                          </div>

                          <div className="review-rating-date">
                            <div className="review-star-rating">
                              <StarIcon filled size={13} />
                              <span>{rev.rating}</span>
                            </div>
                            <span className="reviewer-date">{rev.date}</span>
                          </div>
                        </div>
                        <p className="review-comment">{rev.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Add Review Form */}
                  <div className="add-review-box">
                    <h4 className="add-review-title">Submit Your Critique</h4>
                    <p className="add-review-subtitle">Contribute to the CineScope community consensus score.</p>
                    <form onSubmit={handleSubmitReview}>
                      <div className="review-input-row">
                        <input
                          type="text"
                          className="review-input"
                          placeholder="Your Name or Critic Handle"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          required
                        />
                        <select
                          className="review-rating-select"
                          value={userRating}
                          onChange={(e) => setUserRating(e.target.value)}
                        >
                          <option value="5">5.0 ★ Masterpiece</option>
                          <option value="4.8">4.8 ★ Exceptional</option>
                          <option value="4.5">4.5 ★ Highly Recommended</option>
                          <option value="4.0">4.0 ★ Great</option>
                          <option value="3.5">3.5 ★ Good</option>
                          <option value="3.0">3.0 ★ Average</option>
                          <option value="2.0">2.0 ★ Weak</option>
                          <option value="1.0">1.0 ★ Skip It</option>
                        </select>
                      </div>

                      <textarea
                        className="review-textarea"
                        placeholder="Write your review... What stood out in the direction, sound design, or performances?"
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        required
                        rows={3}
                      />

                      <button type="submit" className="submit-review-btn" id="submit-review-btn">
                        Publish Community Review
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TECHNICAL & BOX OFFICE */}
            {activeTab === 'specs' && (
              <div className="modal-tab-content">
                <div className="modal-section">
                  <h3 className="modal-section-title">Theatrical & Commercial Performance</h3>
                  <div className="specs-card-grid">
                    <div className="spec-stat-card">
                      <span className="stat-label">Worldwide Box Office</span>
                      <strong className="stat-value">{movie.boxOffice || 'N/A'}</strong>
                    </div>
                    <div className="spec-stat-card">
                      <span className="stat-label">Production Budget</span>
                      <strong className="stat-value">{movie.budget || 'Confidential'}</strong>
                    </div>
                    <div className="spec-stat-card">
                      <span className="stat-label">Official Runtime</span>
                      <strong className="stat-value">{movie.duration}</strong>
                    </div>
                    <div className="spec-stat-card">
                      <span className="stat-label">Release Year</span>
                      <strong className="stat-value">{movie.year}</strong>
                    </div>
                    <div className="spec-stat-card">
                      <span className="stat-label">Color & Aspect Ratio</span>
                      <strong className="stat-value">2.39:1 / IMAX 1.43:1</strong>
                    </div>
                    <div className="spec-stat-card">
                      <span className="stat-label">Sound Master</span>
                      <strong className="stat-value">Dolby Atmos / 12-Track IMAX</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
