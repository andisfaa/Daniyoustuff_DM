import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Filter, ArrowRight } from 'lucide-react';
import './Gallery.css';

// Gallery items with gradient-based visual representations
const GALLERY_ITEMS = [
  { id: 1, product: 'Papan Bulat – Pink Soft', event: 'Wisuda UNHAS 2024', gradient: 'linear-gradient(135deg, #FFB6C1, #FF6B9D)', shape: 'round', rating: 5, review: 'Cantik banget! Foto wisudaku jadi super aesthetic 😍' },
  { id: 2, product: 'Papan Kubah – Biru Navy', event: 'Semhas UIN Makassar', gradient: 'linear-gradient(135deg, #1565C0, #42A5F5)', shape: 'dome', rating: 5, review: 'Papernya rapih dan elegan, persis ekspektasi!' },
  { id: 3, product: 'Papan Besar – Pink', event: 'Ulang Tahun ke-21', gradient: 'linear-gradient(135deg, #E91E8C, #FFB6C1)', shape: 'large', rating: 5, review: 'Wajib sewa di sini! Kualitas premium, harga terjangkau' },
  { id: 4, product: 'Papan Bulat – Biru Elektrik', event: 'Wisuda UNM 2024', gradient: 'linear-gradient(135deg, #2979FF, #82B1FF)', shape: 'round', rating: 5, review: 'Pengiriman tepat waktu, papannya bersih dan terawat 👏' },
  { id: 5, product: 'Papan Kubah – Ungu', event: 'Lulus SNBP 2024', gradient: 'linear-gradient(135deg, #9C27B0, #E1BEE7)', shape: 'dome', rating: 5, review: 'Recommended! Desain customnya sesuai banget' },
  { id: 6, product: 'Flowerbox – Biru Pink', event: 'Anniversary ke-3', gradient: 'linear-gradient(135deg, #4FC3F7, #FF6B9D)', shape: 'box', rating: 5, review: 'Bunganya segar dan cantik. Bisa dijadikan kenangan!' },
  { id: 7, product: 'Papan Besar – Biru Navy', event: 'Semhas UIN 2024', gradient: 'linear-gradient(135deg, #0D47A1, #42A5F5)', shape: 'large', rating: 5, review: 'Ukurannya besar dan eye-catching banget di aula!' },
  { id: 8, product: 'Papan Bulat – Kuning', event: 'Wisuda UIN 2024', gradient: 'linear-gradient(135deg, #FFD700, #FFF0A0)', shape: 'round', rating: 5, review: 'Warnanya cerah dan ceria, cocok untuk foto outdoor!' },
  { id: 9, product: 'Papan Kubah – Pink', event: 'Baby Shower', gradient: 'linear-gradient(135deg, #E91E8C, #FFB6C1)', shape: 'dome', rating: 5, review: 'Perfect untuk baby shower! Semua tamu suka foto disini' },
  { id: 10, product: 'Papan Bulat – Biru Hijau', event: 'Wisuda STIKES', gradient: 'linear-gradient(135deg, #26C6DA, #4DB6AC)', shape: 'round', rating: 5, review: 'Gradasi warnanya indah banget di foto!' },
  { id: 11, product: 'Papan Kubah – Pink Biru', event: 'Pernikahan', gradient: 'linear-gradient(135deg, #FF6B9D, #C77DFF, #4FC3F7)', shape: 'dome', rating: 5, review: 'Sangat sesuai untuk tema pernikahan kami ❤️' },
  { id: 12, product: 'Papan Besar – Biru Pink', event: 'Wisuda UNHAS 2024', gradient: 'linear-gradient(135deg, #4FC3F7, #C77DFF, #FF6B9D)', shape: 'large', rating: 5, review: 'Papan terbesar dan paling instagramable!' },
];

const EVENT_FILTERS = ['Semua', 'Wisuda', 'Semhas', 'Ulang Tahun', 'Pernikahan', 'Lainnya'];

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [hovered, setHovered] = useState(null);

  const filtered = GALLERY_ITEMS.filter((item) => {
    if (activeFilter === 'Semua') return true;
    if (activeFilter === 'Lainnya') return !['Wisuda', 'Semhas', 'Ulang Tahun', 'Pernikahan'].some((e) => item.event.includes(e));
    return item.event.toLowerCase().includes(activeFilter.toLowerCase());
  });

  return (
    <div className="gallery page-enter">
      <div className="gallery__header">
        <div className="gallery__header-orb-1" />
        <div className="gallery__header-orb-2" />
        <div className="container">
          <div className="section-label" style={{ justifyContent: 'flex-start', marginBottom: 'var(--space-md)' }}>
            Lookbook & Portofolio
          </div>
          <h1 className="gallery__title">
            Koleksi <span className="text-gradient">Foto Aesthetic</span>
          </h1>
          <p className="gallery__subtitle">
            Inspirasi tampilan papan akrilik di berbagai momen istimewa pelanggan kami
          </p>

          {/* Stats */}
          <div className="gallery__stats">
            <div className="gallery__stat"><strong>500+</strong><span>Pelanggan Puas</span></div>
            <div className="gallery__stat"><strong>1200+</strong><span>Foto Aesthetic</span></div>
            <div className="gallery__stat"><strong>4.9 ⭐</strong><span>Rating Rata-rata</span></div>
          </div>
        </div>
      </div>

      <div className="container gallery__body">
        {/* Filters */}
        <div className="gallery__filters">
          <Filter size={16} className="gallery__filter-icon" />
          {EVENT_FILTERS.map((f) => (
            <button
              key={f}
              className={`gallery__filter-btn ${activeFilter === f ? 'gallery__filter-btn--active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="gallery__grid">
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className={`gallery__item gallery__item--${i % 3 === 1 ? 'tall' : 'normal'}`}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Board Visual */}
              <div
                className={`gallery__board gallery__board--${item.shape}`}
                style={{ background: item.gradient }}
              >
                <div className="gallery__board-shine" />
                <div className="gallery__board-dots" />
                <div className="gallery__board-text">
                  <span>✦ {item.product.split('–')[0].trim()} ✦</span>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className={`gallery__overlay ${hovered === item.id ? 'gallery__overlay--visible' : ''}`}>
                <div className="gallery__overlay-content">
                  <div className="gallery__overlay-product">{item.product}</div>
                  <div className="gallery__overlay-event">🎓 {item.event}</div>
                  <div className="gallery__overlay-stars">
                    {Array.from({ length: item.rating }).map((_, si) => (
                      <Star key={si} size={14} fill="#FFD166" color="#FFD166" />
                    ))}
                  </div>
                  <div className="gallery__overlay-review">"{item.review}"</div>
                </div>
              </div>

              {/* Info Tag */}
              <div className="gallery__item-tag">
                <span className="gallery__item-event">{item.event}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="gallery__cta">
          <div className="gallery__cta-inner card">
            <div className="gallery__cta-orb" />
            <h2 className="gallery__cta-title">
              Ingin Momen Kamu di Sini?
            </h2>
            <p className="gallery__cta-desc">
              Sewa papan akrilik premium kami dan abadikan momenmu bersama Daniyou Stuff.
              Tag kami di Instagram untuk tampil di galeri ini!
            </p>
            <div className="gallery__cta-actions">
              <Link to="/catalog" className="btn btn-primary btn-lg">
                Sewa Sekarang
                <ArrowRight size={18} />
              </Link>
              <a
                href="https://www.instagram.com/daniyoustuff.co"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                📸 @daniyoustuff.co
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
