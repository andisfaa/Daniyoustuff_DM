import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Sparkles, Search } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/',        label: 'Beranda' },
  { to: '/catalog', label: 'Katalog' },
  { to: '/gallery', label: 'Portofolio' },
  { to: '/track',   label: 'Lacak Pesanan' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner container">
          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <div className="navbar__logo-icon">
              <Sparkles size={18} />
            </div>
            <div className="navbar__logo-text">
              <span className="navbar__logo-brand">Daniyou</span>
              <span className="navbar__logo-sub">Stuff.co</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <ul className="navbar__links">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`navbar__link ${location.pathname === link.to ? 'navbar__link--active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop Actions */}
          <div className="navbar__actions">
            <button
              className="navbar__icon-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <Link to="/cart" className="navbar__cart" aria-label="Cart">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="navbar__cart-badge">{itemCount}</span>
              )}
            </Link>

            <Link to="/catalog" className="btn btn-primary btn-sm">
              Sewa Sekarang
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="navbar__mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="navbar__search-bar container">
            <form onSubmit={handleSearch} className="navbar__search-form">
              <Search size={18} className="navbar__search-icon" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari papan akrilik... (e.g. Pink Soft, Kubah, Navy)"
                className="navbar__search-input"
              />
              <button type="submit" className="btn btn-primary btn-sm">Cari</button>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      <div className={`navbar__mobile-menu ${mobileOpen ? 'navbar__mobile-menu--open' : ''}`}>
        <ul className="navbar__mobile-links">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`navbar__mobile-link ${location.pathname === link.to ? 'navbar__mobile-link--active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/cart" className="navbar__mobile-link">
              <ShoppingBag size={18} /> Keranjang
              {itemCount > 0 && <span className="badge badge-purple">{itemCount}</span>}
            </Link>
          </li>
          <li>
            <Link to="/catalog" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Sewa Sekarang
            </Link>
          </li>
        </ul>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="navbar__overlay" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
