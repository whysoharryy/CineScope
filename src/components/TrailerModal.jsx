import React, { useEffect } from 'react';
import { CloseIcon, FilmIcon } from './Icons';

export const TrailerModal = ({ movie, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  if (!movie) return null;

  return (
    <div
      className="trailer-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${movie.title} Official Trailer`}
    >
      <div className="trailer-modal-dialog">
        <div className="trailer-modal-header">
          <div className="trailer-title-wrap">
            <FilmIcon size={18} />
            <span className="trailer-movie-title">{movie.title} ({movie.year})</span>
            <span className="trailer-badge">Official 4K Trailer</span>
          </div>
          <button
            className="trailer-close-btn"
            onClick={onClose}
            title="Close Trailer (Esc)"
            id="close-trailer-modal-btn"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="trailer-video-wrapper">
          {movie.trailerYoutubeId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${movie.trailerYoutubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="trailer-iframe"
            />
          ) : (
            <div className="trailer-fallback">
              <FilmIcon size={48} />
              <p>Official trailer preview stream currently synchronizing with studio catalog.</p>
            </div>
          )}
        </div>

        <div className="trailer-modal-footer">
          <span>Dolby Atmos • 4K Digital Cinema • CineScope Certified</span>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
