import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, Calendar } from 'lucide-react';
import ProductCard from '../components/catalog/ProductCard';
import { products, CATEGORIES, formatPrice } from '../data/products';
import './Catalog.css';

const SORT_OPTIONS = [
  { value: 'default', label: 'Urutan Default' },
  { value: 'price-asc', label: 'Harga: Terendah' },
  { value: 'price-desc', label: 'Harga: Tertinggi' },
  { value: 'name-asc', label: 'Nama: A–Z' },
  { value: 'available', label: 'Tersedia Dulu' },
];

const ALL_DATES = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d.toISOString().split('T')[0];
});

// Simulate some dates being busy
const BUSY_DATES = new Set([ALL_DATES[3], ALL_DATES[7], ALL_DATES[11], ALL_DATES[15]]);

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('default');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    const s = searchParams.get('search');
    const c = searchParams.get('category');
    if (s) setSearch(s);
    if (c) setSelectedCategory(c);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.colorVariant.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (showAvailableOnly) {
      list = list.filter((p) => p.available);
    }

    switch (sortBy) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'name-asc':   list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'available':  list.sort((a, b) => (b.available ? 1 : 0) - (a.available ? 1 : 0)); break;
      default: break;
    }

    return list;
  }, [search, selectedCategory, sortBy, showAvailableOnly]);

  const categoryCount = (cat) =>
    cat === 'all' ? products.length : products.filter((p) => p.category === cat).length;

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const formatMonthYear = (date) =>
    date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const toDateStr = (day) => {
    const d = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    return d.toISOString().split('T')[0];
  };

  const today = new Date().toISOString().split('T')[0];
  const { firstDay, daysInMonth } = getDaysInMonth(calendarMonth);

  const prevMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1));
  const nextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1));

  return (
    <div className="catalog page-enter">
      {/* Header */}
      <div className="catalog__header">
        <div className="catalog__header-orb" />
        <div className="container">
          <div className="section-label" style={{ justifyContent: 'flex-start', marginBottom: 'var(--space-md)' }}>Koleksi Kami</div>
          <h1 className="catalog__title">
            Katalog <span className="text-gradient">Papan Akrilik</span>
          </h1>
          <p className="catalog__subtitle">
            {products.length} koleksi papan akrilik estetik untuk semua momenmu
          </p>
        </div>
      </div>

      <div className="container catalog__body">
        <div className="catalog__layout">
          {/* ── Sidebar ─────────────────────────────────────── */}
          <aside className={`catalog__sidebar ${filterOpen ? 'catalog__sidebar--open' : ''}`}>
            <div className="catalog__sidebar-header">
              <h3>Filter</h3>
              <button className="catalog__sidebar-close" onClick={() => setFilterOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Categories */}
            <div className="filter-section">
              <h4 className="filter-section__title">Kategori</h4>
              <div className="filter-categories">
                <button
                  className={`filter-cat-btn ${selectedCategory === 'all' ? 'filter-cat-btn--active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  Semua <span>{categoryCount('all')}</span>
                </button>
                {Object.values(CATEGORIES).map((cat) => (
                  <button
                    key={cat}
                    className={`filter-cat-btn ${selectedCategory === cat ? 'filter-cat-btn--active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat} <span>{categoryCount(cat)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="filter-section">
              <h4 className="filter-section__title">Ketersediaan</h4>
              <label className="filter-toggle">
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                />
                <div className="filter-toggle__track">
                  <div className="filter-toggle__thumb" />
                </div>
                <span>Tersedia saja</span>
              </label>
            </div>

            {/* Price Range Display */}
            <div className="filter-section">
              <h4 className="filter-section__title">Harga Sewa</h4>
              <div className="filter-price-range">
                <div className="filter-price-item">
                  <span className="filter-price-label">Papan Bulat/Kubah</span>
                  <span className="filter-price-value">Rp60.000/hari</span>
                </div>
                <div className="filter-price-item">
                  <span className="filter-price-label">Flowerbox</span>
                  <span className="filter-price-value">Rp70.000/hari</span>
                </div>
                <div className="filter-price-item">
                  <span className="filter-price-label">Papan Besar</span>
                  <span className="filter-price-value">Rp100.000/hari</span>
                </div>
              </div>
            </div>

            {/* Mini Calendar */}
            <div className="filter-section">
              <h4 className="filter-section__title">
                <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Cek Ketersediaan
              </h4>
              <div className="mini-calendar">
                <div className="mini-calendar__nav">
                  <button onClick={prevMonth}>‹</button>
                  <span>{formatMonthYear(calendarMonth)}</span>
                  <button onClick={nextMonth}>›</button>
                </div>
                <div className="mini-calendar__grid">
                  {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map((d) => (
                    <div key={d} className="mini-calendar__weekday">{d}</div>
                  ))}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const dateStr = toDateStr(day);
                    const isPast = dateStr < today;
                    const isBusy = BUSY_DATES.has(dateStr);
                    const isSelected = calendarDate === dateStr;
                    return (
                      <button
                        key={day}
                        className={`mini-calendar__day ${isPast ? 'past' : ''} ${isBusy ? 'busy' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => !isPast && !isBusy && setCalendarDate(dateStr)}
                        disabled={isPast || isBusy}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <div className="mini-calendar__legend">
                  <span><span className="legend-dot legend-dot--available" /> Tersedia</span>
                  <span><span className="legend-dot legend-dot--busy" /> Penuh</span>
                  <span><span className="legend-dot legend-dot--selected" /> Dipilih</span>
                </div>
                {calendarDate && (
                  <div className="mini-calendar__selected-info">
                    Tanggal dipilih: <strong>{new Date(calendarDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ── Main Content ──────────────────────────────── */}
          <main className="catalog__main">
            {/* Toolbar */}
            <div className="catalog__toolbar">
              <div className="catalog__search">
                <Search size={18} className="catalog__search-icon" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari papan (e.g. Pink Soft, Kubah Navy...)"
                  className="catalog__search-input input-field"
                />
                {search && (
                  <button className="catalog__search-clear" onClick={() => setSearch('')}>
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="catalog__toolbar-right">
                <div className="catalog__sort">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-field"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn btn-ghost catalog__filter-toggle"
                  onClick={() => setFilterOpen(true)}
                >
                  <SlidersHorizontal size={16} />
                  Filter
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory !== 'all' || showAvailableOnly || search) && (
              <div className="catalog__active-filters">
                {selectedCategory !== 'all' && (
                  <span className="active-filter-tag">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory('all')}><X size={12} /></button>
                  </span>
                )}
                {showAvailableOnly && (
                  <span className="active-filter-tag">
                    Tersedia Saja
                    <button onClick={() => setShowAvailableOnly(false)}><X size={12} /></button>
                  </span>
                )}
                {search && (
                  <span className="active-filter-tag">
                    "{search}"
                    <button onClick={() => setSearch('')}><X size={12} /></button>
                  </span>
                )}
                <button className="catalog__clear-all" onClick={() => { setSelectedCategory('all'); setShowAvailableOnly(false); setSearch(''); }}>
                  Hapus Semua
                </button>
              </div>
            )}

            {/* Results count */}
            <div className="catalog__results-count">
              Menampilkan <strong>{filtered.length}</strong> dari {products.length} produk
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
              <div className="catalog__grid">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="catalog__empty">
                <div className="catalog__empty-icon" style={{ marginBottom: '16px' }}><Search size={48} color="var(--clr-border)" /></div>
                <h3>Produk tidak ditemukan</h3>
                <p>Coba ubah kata kunci atau filter pencarianmu.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => { setSearch(''); setSelectedCategory('all'); setShowAvailableOnly(false); }}
                >
                  Reset Pencarian
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {filterOpen && <div className="catalog__overlay" onClick={() => setFilterOpen(false)} />}
    </div>
  );
}
