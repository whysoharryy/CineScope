import React, { useState, useMemo } from 'react';
import { SAMPLE_MOVIES } from './data/movies';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchBar } from './components/SearchBar';
import { GenreFilter } from './components/GenreFilter';
import { MovieList } from './components/MovieList';
import { MovieModal } from './components/MovieModal';
import { TrailerModal } from './components/TrailerModal';
import { Footer } from './components/Footer';
import { HeartIcon } from './components/Icons';

export function App() {
  const [moviesList, setMoviesList] = useState(SAMPLE_MOVIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('rating-desc');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [quickFilter, setQuickFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [activeNavTab, setActiveNavTab] = useState('discover');

  // Modal States
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerMovie, setTrailerMovie] = useState(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  };

  // Initialize favorites from localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('cinescope_favorites');
      return saved ? JSON.parse(saved) : ['oppenheimer-2023', 'interstellar-2014', 'dune-part-two-2024'];
    } catch {
      return ['oppenheimer-2023', 'interstellar-2014', 'dune-part-two-2024'];
    }
  });

  const toggleFavorite = (movieId) => {
    const targetMovie = moviesList.find((m) => m.id === movieId);
    const movieTitle = targetMovie ? targetMovie.title : 'Movie';

    setFavorites((prev) => {
      const isAlreadyFav = prev.includes(movieId);
      const next = isAlreadyFav
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId];
      try {
        localStorage.setItem('cinescope_favorites', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save to localStorage', err);
      }
      showToast(isAlreadyFav ? `Removed "${movieTitle}" from Watchlist` : `Saved "${movieTitle}" to your Watchlist ♥`);
      return next;
    });
  };

  const handleAddUserReview = (movieId, newReview) => {
    setMoviesList((prevList) =>
      prevList.map((m) => {
        if (m.id === movieId) {
          const updatedReviews = [newReview, ...(m.userReviews || [])];
          return {
            ...m,
            userReviews: updatedReviews
          };
        }
        return m;
      })
    );

    // Also update current modal if open
    setSelectedMovie((prev) => {
      if (prev && prev.id === movieId) {
        return {
          ...prev,
          userReviews: [newReview, ...(prev.userReviews || [])]
        };
      }
      return prev;
    });

    showToast('Your critique was published to CineScope!');
  };

  // Top 4 curated films for Hero carousel
  const featuredMovies = useMemo(() => {
    return moviesList.filter((m) => m.featured || m.rating >= 4.9).slice(0, 4);
  }, [moviesList]);

  // Filter & Sort Pipeline
  const filteredMovies = useMemo(() => {
    return moviesList
      .filter((movie) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = movie.title.toLowerCase().includes(q);
          const matchDirector = movie.director.toLowerCase().includes(q);
          const matchCast = movie.cast.some((actor) =>
            (typeof actor === 'string' ? actor : actor.name).toLowerCase().includes(q)
          );
          const matchSynopsis = movie.synopsis.toLowerCase().includes(q);
          const matchGenre = movie.genres.some((g) => g.toLowerCase().includes(q));
          if (!matchTitle && !matchDirector && !matchCast && !matchSynopsis && !matchGenre) {
            return false;
          }
        }

        // Genre filter
        if (selectedGenre !== 'All') {
          if (!movie.genres.includes(selectedGenre)) {
            return false;
          }
        }

        // Quick pill filter
        if (quickFilter === 'top-rated') {
          if (movie.rating < 4.8) return false;
        } else if (quickFilter === 'oscars') {
          if (!movie.badges?.some((b) => b.toLowerCase().includes('oscar') || b.toLowerCase().includes('palme'))) {
            return false;
          }
        } else if (quickFilter === 'blockbusters') {
          if (movie.year < 2017) return false;
        }

        // Watchlist only filter
        if (favoritesOnly) {
          if (!favorites.includes(movie.id)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'rating-desc':
            return b.rating - a.rating;
          case 'year-desc':
            return b.year - a.year;
          case 'year-asc':
            return a.year - b.year;
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'boxoffice-desc': {
            // Sort by numerical value in string or fallback
            const parseVal = (str) => {
              if (!str) return 0;
              const num = parseFloat(str.replace(/[^0-9.]/g, ''));
              return str.includes('Billion') ? num * 1000 : num;
            };
            return parseVal(b.boxOffice) - parseVal(a.boxOffice);
          }
          default:
            return 0;
        }
      });
  }, [moviesList, searchQuery, selectedGenre, quickFilter, sortBy, favoritesOnly, favorites]);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setQuickFilter('all');
    setFavoritesOnly(false);
    setSortBy('rating-desc');
    setActiveNavTab('discover');
  };

  const handleDiscoverClick = () => {
    resetFilters();
    setActiveNavTab('discover');
    scrollToCatalog();
  };

  const handleTopRatedNav = () => {
    setSelectedGenre('All');
    setQuickFilter('top-rated');
    setSortBy('rating-desc');
    setFavoritesOnly(false);
    setActiveNavTab('top-rated');
    scrollToCatalog();
  };

  const handleTrendingNav = () => {
    setSelectedGenre('All');
    setQuickFilter('blockbusters');
    setSortBy('year-desc');
    setFavoritesOnly(false);
    setActiveNavTab('trending');
    scrollToCatalog();
  };

  const handleGenresNav = () => {
    setActiveNavTab('genres');
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWatchlistNav = () => {
    setFavoritesOnly((prev) => !prev);
    scrollToCatalog();
  };

  return (
    <div className="app-wrapper">
      <div className="ambient-bg" />

      {/* Modern Navigation without DevOps Tab */}
      <Navbar
        watchlistCount={favorites.length}
        onWatchlistClick={handleWatchlistNav}
        onCatalogClick={handleDiscoverClick}
        onTopRatedClick={handleTopRatedNav}
        onTrendingClick={handleTrendingNav}
        onGenresClick={handleGenresNav}
        activeTab={activeNavTab}
      />

      <main>
        {/* Cinematic Multi-Featured Hero */}
        <Hero
          featuredMovies={featuredMovies}
          currentMovie={featuredMovies[0]}
          onReadReview={(m) => setSelectedMovie(m)}
          onWatchTrailer={(m) => setTrailerMovie(m)}
          onBrowseClick={scrollToCatalog}
          isFavorite={featuredMovies[0] ? favorites.includes(featuredMovies[0].id) : false}
          onToggleFavorite={toggleFavorite}
        />

        {/* Catalog & Filter Section */}
        <section className="catalog-section" id="catalog">
          <div className="container">
            {/* Header Title for Catalog */}
            <div className="catalog-header-bar">
              <div>
                <h2 className="catalog-section-heading">Curated Film Library</h2>
                <p className="catalog-section-sub">
                  Explore masterworks across genres with comprehensive critic breakdowns, box office stats, and 4K trailers.
                </p>
              </div>

              {favoritesOnly && (
                <div className="watchlist-banner-pill">
                  <HeartIcon filled size={16} />
                  <span>Showing Your Saved Watchlist ({favorites.length})</span>
                  <button onClick={() => setFavoritesOnly(false)} className="exit-watchlist-btn">
                    Show All Films
                  </button>
                </div>
              )}
            </div>

            <div className="toolbar-wrapper">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                quickFilter={quickFilter}
                onQuickFilterChange={setQuickFilter}
              />

              <GenreFilter
                selectedGenre={selectedGenre}
                onSelectGenre={(genre) => {
                  setSelectedGenre(genre);
                  setFavoritesOnly(false);
                }}
                count={filteredMovies.length}
                totalCount={moviesList.length}
                onResetAll={resetFilters}
              />
            </div>

            {/* Movies Grid / List */}
            <MovieList
              movies={filteredMovies}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onSelectMovie={(movie) => setSelectedMovie(movie)}
              onWatchTrailer={(movie) => setTrailerMovie(movie)}
              onResetFilters={resetFilters}
              viewMode={viewMode}
            />
          </div>
        </section>
      </main>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onAddUserReview={handleAddUserReview}
          onWatchTrailer={(m) => setTrailerMovie(m)}
          isFavorite={favorites.includes(selectedMovie.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* 4K Official Trailer Modal */}
      {trailerMovie && (
        <TrailerModal
          movie={trailerMovie}
          onClose={() => setTrailerMovie(null)}
        />
      )}

      {/* Modern Toast Notification */}
      {toastMessage && (
        <div className="cinescope-toast" role="status" aria-live="polite">
          <div className="toast-glow-spot" />
          <span className="toast-text">{toastMessage}</span>
        </div>
      )}

      {/* Modern Editorial Footer (Zero DevOps Clutter) */}
      <Footer />
    </div>
  );
}

export default App;
