import React, { useState } from 'react';
import { FilmIcon, SparklesIcon, CheckIcon, StarIcon, AwardIcon } from './Icons';

export const Footer = () => {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="footer" id="site-footer">
      <div className="container">
        {/* Newsletter / Premiere Club Callout */}
        <div className="footer-newsletter-banner">
          <div className="newsletter-text">
            <div className="newsletter-pill">
              <SparklesIcon size={14} />
              <span>CineScope Weekly Dispatch</span>
            </div>
            <h3 className="newsletter-title">Stay Ahead of Modern Cinema</h3>
            <p className="newsletter-desc">
              Get Sunday morning deep critiques, festival prize previews, and private 4K restoration recommendations directly to your inbox.
            </p>
          </div>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            {subscribed ? (
              <div className="subscribed-feedback">
                <CheckIcon size={18} />
                <span>You're on the list! Welcome to the CineScope Society.</span>
              </div>
            ) : (
              <div className="newsletter-input-group">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email for movie newsletter"
                />
                <button type="submit" className="newsletter-btn">
                  Join The Club
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Footer Main Columns */}
        <div className="footer-top">
          {/* Brand Info */}
          <div className="footer-brand-col">
            <div className="brand-logo" style={{ marginBottom: '0.85rem' }}>
              <div className="brand-icon-wrapper">
                <FilmIcon size={20} />
              </div>
              <div className="brand-text-col">
                <span className="brand-name">Cine<span className="brand-highlight">Scope</span></span>
                <span className="brand-subtitle">Editorial Cinema Guide</span>
              </div>
            </div>
            <p className="footer-brand-desc">
              The premier destination for film literacy, critical consensus, and theatrical storytelling.
              Curating iconic cinema with comprehensive technical reviews, high-fidelity metrics, and passionate community dialogue.
            </p>
            <div className="footer-trust-badges">
              <span className="trust-pill"><StarIcon filled size={12} /> Certified Critic Syndicate</span>
              <span className="trust-pill"><AwardIcon size={12} /> Academy Award Coverage</span>
              <span className="trust-pill">Dolby Cinema Audio</span>
            </div>
          </div>

          {/* Column 1: Editorial */}
          <div>
            <h4 className="footer-col-title">CineScope Editorial</h4>
            <ul className="footer-links-list">
              <li><a href="#hero">Featured Film of the Month</a></li>
              <li><a href="#catalog">The 2024 Award Circuit</a></li>
              <li><a href="#catalog">Director Retrospectives</a></li>
              <li><a href="#catalog">Box Office Analytical Radar</a></li>
              <li><a href="#catalog">Soundtrack & Score Archives</a></li>
            </ul>
          </div>

          {/* Column 2: Genres */}
          <div>
            <h4 className="footer-col-title">Iconic Genres</h4>
            <ul className="footer-links-list">
              <li><a href="#catalog">Sci-Fi & Cyberpunk Visions</a></li>
              <li><a href="#catalog">Psychological Thrillers</a></li>
              <li><a href="#catalog">Epic Dramas & Biographies</a></li>
              <li><a href="#catalog">Studio Ghibli & World Animation</a></li>
              <li><a href="#catalog">Modern Masterpiece Noir</a></li>
            </ul>
          </div>

          {/* Column 3: Platform Standards */}
          <div>
            <h4 className="footer-col-title">Platform Standards</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.85rem', lineHeight: '1.5' }}>
              All ratings benchmarked against verified critic screenings, Rotten Tomatoes consensus standards, and IMDb historical records.
            </p>
            <div className="standards-badges">
              <span className="standard-chip">4K UHD Master Quality</span>
              <span className="standard-chip">Zero Advertisement Bias</span>
              <span className="standard-chip">Community Peer Reviewed</span>
              <span className="standard-chip">IMDb Top 250 Sync</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-copy">
            &copy; {new Date().getFullYear()} CineScope Media Guild. All film posters, stills, and trademarks belong to their respective studios.
          </div>
          <div className="footer-legal-links">
            <a href="#privacy">Privacy Statement</a>
            <span className="divider-dot">•</span>
            <a href="#terms">Editorial Standards</a>
            <span className="divider-dot">•</span>
            <a href="#cookies">Cookie Preferences</a>
            <span className="divider-dot">•</span>
            <a href="#api">Media Kit</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
