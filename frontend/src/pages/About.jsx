import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, MapPin, Camera, MessageCircle, Award, Users, Heart, Sparkles, ExternalLink } from 'lucide-react';
import './About.css';

// ── Import semua foto dari folder IMG ──────────────────────────
// Papan Besar
import besarImg1 from '../assets/IMG/Katalog Daniyou/PAPAN BESAR/Besar (1).jpeg';
import besarImg2 from '../assets/IMG/Katalog Daniyou/PAPAN BESAR/Besar (2).jpeg';
import besarImg3 from '../assets/IMG/Katalog Daniyou/PAPAN BESAR/Besar (3).jpeg';
import besarImg4 from '../assets/IMG/Katalog Daniyou/PAPAN BESAR/Besar (4).jpeg';
// Papan Bulat
import bulatImg1 from '../assets/IMG/Katalog Daniyou/PAPAN BULAT/Bulat (1).jpeg';
import bulatImg2 from '../assets/IMG/Katalog Daniyou/PAPAN BULAT/Bulat (2).jpeg';
import bulatImg3 from '../assets/IMG/Katalog Daniyou/PAPAN BULAT/Bulat (3).jpeg';
import bulatImg4 from '../assets/IMG/Katalog Daniyou/PAPAN BULAT/Bulat (4).jpeg';
import bulatImg5 from '../assets/IMG/Katalog Daniyou/PAPAN BULAT/Bulat (5).jpeg';
import bulatImg6 from '../assets/IMG/Katalog Daniyou/PAPAN BULAT/Bulat (6).jpeg';
import bulatImg7 from '../assets/IMG/Katalog Daniyou/PAPAN BULAT/Bulat (7).jpeg';
import bulatImg8 from '../assets/IMG/Katalog Daniyou/PAPAN BULAT/Bulat (8).jpeg';
import bulatImg9 from '../assets/IMG/Katalog Daniyou/PAPAN BULAT/Bulat (9).jpeg';
// Papan Flowerbox
import flowerboxImg1 from '../assets/IMG/Katalog Daniyou/PAPAN FLOWERBOX/Flowerbox (1).jpeg';
import flowerboxImg2 from '../assets/IMG/Katalog Daniyou/PAPAN FLOWERBOX/Flowerbox (2).jpeg';
// Papan Kubah
import kubahImg1 from '../assets/IMG/Katalog Daniyou/PAPAN KUBAH/Kubah (1).jpeg';
import kubahImg2 from '../assets/IMG/Katalog Daniyou/PAPAN KUBAH/Kubah (2).jpeg';
import kubahImg3 from '../assets/IMG/Katalog Daniyou/PAPAN KUBAH/Kubah (3).jpeg';
import kubahImg4 from '../assets/IMG/Katalog Daniyou/PAPAN KUBAH/Kubah (4).jpeg';
import kubahImg5 from '../assets/IMG/Katalog Daniyou/PAPAN KUBAH/Kubah (5).jpeg';
import kubahImg6 from '../assets/IMG/Katalog Daniyou/PAPAN KUBAH/Kubah (6).jpeg';
import kubahImg7 from '../assets/IMG/Katalog Daniyou/PAPAN KUBAH/Kubah (7).jpeg';
import kubahImg8 from '../assets/IMG/Katalog Daniyou/PAPAN KUBAH/Kubah (8).jpeg';
import kubahImg9 from '../assets/IMG/Katalog Daniyou/PAPAN KUBAH/Kubah (9).jpeg';

// ── Data gallery dengan foto nyata ────────────────────────────
const GALLERY_ITEMS = [
  { id: 1,  src: bulatImg1,    category: 'Papan Bulat',     event: 'Wisuda 2024',        label: 'Wisuda' },
  { id: 2,  src: kubahImg1,    category: 'Papan Kubah',     event: 'Semhas UIN',         label: 'Semhas' },
  { id: 3,  src: besarImg1,    category: 'Papan Besar',     event: 'Ulang Tahun',        label: 'Ulang Tahun' },
  { id: 4,  src: bulatImg2,    category: 'Papan Bulat',     event: 'Wisuda UNHAS',       label: 'Wisuda' },
  { id: 5,  src: kubahImg2,    category: 'Papan Kubah',     event: 'Lulus SNBP',         label: 'Lainnya' },
  { id: 6,  src: flowerboxImg1,category: 'Flowerbox',       event: 'Anniversary',        label: 'Lainnya' },
  { id: 7,  src: besarImg2,    category: 'Papan Besar',     event: 'Semhas UNM',         label: 'Semhas' },
  { id: 8,  src: bulatImg3,    category: 'Papan Bulat',     event: 'Wisuda UIN',         label: 'Wisuda' },
  { id: 9,  src: kubahImg3,    category: 'Papan Kubah',     event: 'Baby Shower',        label: 'Lainnya' },
  { id: 10, src: bulatImg4,    category: 'Papan Bulat',     event: 'Wisuda STIKES',      label: 'Wisuda' },
  { id: 11, src: kubahImg4,    category: 'Papan Kubah',     event: 'Pernikahan',         label: 'Pernikahan' },
  { id: 12, src: besarImg3,    category: 'Papan Besar',     event: 'Wisuda UNHAS',       label: 'Wisuda' },
  { id: 13, src: bulatImg5,    category: 'Papan Bulat',     event: 'Semhas UNHAS',       label: 'Semhas' },
  { id: 14, src: kubahImg5,    category: 'Papan Kubah',     event: 'Wisuda UNM',         label: 'Wisuda' },
  { id: 15, src: flowerboxImg2,category: 'Flowerbox',       event: 'Ulang Tahun ke-20',  label: 'Ulang Tahun' },
  { id: 16, src: bulatImg6,    category: 'Papan Bulat',     event: 'Wisuda 2024',        label: 'Wisuda' },
  { id: 17, src: kubahImg6,    category: 'Papan Kubah',     event: 'Wisuda UIN',         label: 'Wisuda' },
  { id: 18, src: besarImg4,    category: 'Papan Besar',     event: 'Pernikahan',         label: 'Pernikahan' },
  { id: 19, src: bulatImg7,    category: 'Papan Bulat',     event: 'Semhas UNM',         label: 'Semhas' },
  { id: 20, src: kubahImg7,    category: 'Papan Kubah',     event: 'Wisuda STIKES',      label: 'Wisuda' },
  { id: 21, src: bulatImg8,    category: 'Papan Bulat',     event: 'Ulang Tahun ke-22',  label: 'Ulang Tahun' },
  { id: 22, src: kubahImg8,    category: 'Papan Kubah',     event: 'Wisuda UNM 2024',    label: 'Wisuda' },
  { id: 23, src: bulatImg9,    category: 'Papan Bulat',     event: 'Semhas UIN 2024',    label: 'Semhas' },
  { id: 24, src: kubahImg9,    category: 'Papan Kubah',     event: 'Anniversary ke-5',   label: 'Lainnya' },
];

const STATS = [
  { icon: Users,  value: '500+',  label: 'Pelanggan Puas' },
  { icon: Camera, value: '1200+', label: 'Foto Aesthetic' },
  { icon: Star,   value: '4.9 ⭐', label: 'Rating Rata-rata' },
  { icon: Award,  value: '2+',    label: 'Tahun Berpengalaman' },
];

const TESTIMONIALS = [
  { id: 1, name: 'Nurul Ain',    role: 'Wisudawan Unhas 2024',  rating: 5, text: 'Papan akriliknya cantik banget! Semua orang selalu tanya sewa di mana. Recommended banget! ✨' },
  { id: 2, name: 'Ahmad Fauzan', role: 'Semhas UIN Makassar',   rating: 5, text: 'Pelayanannya super fast, antarnya tepat waktu, dan papannya bersih serta terawat. Pasti bakal sewa lagi!' },
  { id: 3, name: 'Siti Rahma',   role: 'Ulang Tahun ke-21',     rating: 5, text: 'Custom textnya persis sesuai request. Fotoku jadi super aesthetic! Tim Daniyou Stuff sangat helpful.' },
  { id: 4, name: 'Andi Rizky',   role: 'Wisudawan UNM 2024',    rating: 5, text: 'Harganya terjangkau untuk kualitas yang luar biasa. Papan bulat pink navynya jadi favorit di feed IG!' },
];

const FILTERS = ['Semua', 'Wisuda', 'Semhas', 'Ulang Tahun', 'Pernikahan', 'Lainnya'];

export default function About() {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [lightbox, setLightbox] = useState(null); // { src, event, category }

  const filtered = GALLERY_ITEMS.filter((item) => {
    if (activeFilter === 'Semua') return true;
    return item.label === activeFilter;
  });

  return (
    <div className="about page-enter">
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="about__hero">
        <div className="about__hero-orb about__hero-orb--1" />
        <div className="about__hero-orb about__hero-orb--2" />
        <div className="container about__hero-content">
          <div className="section-label" style={{ justifyContent: 'center' }}>
            <Sparkles size={14} /> Tentang Kami
          </div>
          <h1 className="about__hero-title">
            Dari Makassar,<br />
            untuk <span className="text-gradient">Momen Istimewamu</span>
          </h1>
          <p className="about__hero-desc">
            Daniyou Stuff adalah usaha lokal Makassar &amp; Gowa yang berdedikasi menghadirkan
            papan ucapan akrilik berkualitas premium. Kami memahami betapa pentingnya dokumentasi
            momen wisuda, semhas, dan perayaanmu — karena setiap momen layak diabadikan dengan
            indah.
          </p>

          {/* Stats */}
          <div className="about__stats">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div className="about__stat card" key={s.label}>
                  <div className="about__stat-icon">
                    <Icon size={22} />
                  </div>
                  <div className="about__stat-value">{s.value}</div>
                  <div className="about__stat-label">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STORY ─────────────────────────────────────────────── */}
      <section className="section about__story-section">
        <div className="container">
          <div className="about__story-grid">
            <div className="about__story-text">
              <div className="section-label" style={{ justifyContent: 'flex-start' }}>
                Cerita Kami
              </div>
              <h2 className="about__story-title">
                Dibangun dengan <span className="text-gradient">Cinta</span> untuk Kota Makassar
              </h2>
              <p className="about__story-desc">
                Berawal dari keinginan untuk membantu mahasiswa Makassar mendokumentasikan
                momen wisuda mereka dengan lebih berkesan, Daniyou Stuff hadir pada tahun 2022.
                Kami percaya bahwa setiap wisudawan, setiap pasangan, setiap keluarga
                berhak mendapatkan foto yang indah dan tak terlupakan.
              </p>
              <p className="about__story-desc">
                Dengan koleksi 27+ papan akrilik berbagai bentuk dan warna — dari papan bulat
                yang anggun, kubah yang megah, hingga flowerbox yang romantis — kami terus
                berinovasi untuk menghadirkan produk terbaik bagi pelanggan setia kami.
              </p>
              <div className="about__story-features">
                {[
                  { icon: <MapPin size={18} />, text: 'Layanan di Makassar & Gowa' },
                  { icon: <Heart size={18} />, text: 'Dibuat dengan penuh dedikasi' },
                  { icon: <Award size={18} />, text: 'Kualitas premium, harga terjangkau' },
                  { icon: <Camera size={18} />, text: '1200+ foto aesthetic dihasilkan' },
                ].map((f, i) => (
                  <div key={i} className="about__story-feature">
                    <div className="about__story-feature-icon">{f.icon}</div>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
              <div className="about__story-actions">
                <Link to="/catalog" className="btn btn-primary">
                  Lihat Katalog <ArrowRight size={18} />
                </Link>
                <a
                  href="https://wa.me/6281356942724?text=Halo%20Daniyou%20Stuff!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <MessageCircle size={18} /> WhatsApp Kami
                </a>
              </div>
            </div>
            <div className="about__story-photos">
              <div className="about__story-photo-grid">
                <img src={bulatImg1} alt="Papan Bulat" className="about__story-photo about__story-photo--main" />
                <img src={kubahImg1} alt="Papan Kubah" className="about__story-photo" />
                <img src={besarImg1} alt="Papan Besar" className="about__story-photo" />
                <img src={flowerboxImg1} alt="Flowerbox" className="about__story-photo" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO GALLERY ──────────────────────────────────── */}
      <section className="section about__gallery-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Portofolio Kami</div>
            <h2 className="section-title">
              Koleksi <span className="text-gradient">Foto Asli</span> Pelanggan
            </h2>
            <p className="section-desc">
              Foto-foto nyata dari pelanggan setia Daniyou Stuff di berbagai momen istimewa
            </p>
          </div>

          {/* Filters */}
          <div className="about__filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`about__filter-btn ${activeFilter === f ? 'about__filter-btn--active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Masonry Grid */}
          <div className="about__gallery-grid">
            {filtered.map((item, i) => (
              <div
                key={item.id}
                className={`about__gallery-item ${i % 5 === 2 ? 'about__gallery-item--tall' : ''}`}
                onClick={() => setLightbox(item)}
              >
                <img
                  src={item.src}
                  alt={`${item.category} – ${item.event}`}
                  className="about__gallery-img"
                  loading="lazy"
                />
                <div className="about__gallery-overlay">
                  <div className="about__gallery-overlay-content">
                    <div className="about__gallery-category">{item.category}</div>
                    <div className="about__gallery-event">🎓 {item.event}</div>
                    <div className="about__gallery-stars">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} size={12} fill="#FFD166" color="#FFD166" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="about__gallery-tag">{item.event}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="section about__testi-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Ulasan Pelanggan</div>
            <h2 className="section-title">
              Mereka Sudah <span className="text-gradient">Merasakannya</span>
            </h2>
          </div>
          <div className="about__testi-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="about__testi-card card">
                <div className="about__testi-stars">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="#C49A3C" color="#C49A3C" />
                  ))}
                </div>
                <p className="about__testi-text">"{t.text}"</p>
                <div className="about__testi-author">
                  <div
                    className="about__testi-avatar"
                    style={{ background: `hsl(${(t.id * 60) % 360}, 50%, 70%)` }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="about__testi-name">{t.name}</div>
                    <div className="about__testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="section about__cta-section">
        <div className="container">
          <div className="about__cta card">
            <div className="about__cta-orb" />
            <div className="section-label" style={{ justifyContent: 'center' }}>
              Siap Bersamamu
            </div>
            <h2 className="about__cta-title">
              Ingin Momenmu Ada di Sini?
            </h2>
            <p className="about__cta-desc">
              Sewa papan akrilik premium kami dan abadikan momenmu bersama Daniyou Stuff.
              Tag kami di Instagram untuk tampil di portofolio ini!
            </p>
            <div className="about__cta-actions">
              <Link to="/catalog" className="btn btn-primary btn-lg">
                Sewa Sekarang <ArrowRight size={18} />
              </Link>
              <a
                href="https://www.instagram.com/daniyoustuff.co"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <ExternalLink size={18} /> @daniyoustuff.co
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIGHTBOX ──────────────────────────────────────────── */}
      {lightbox && (
        <div className="about__lightbox" onClick={() => setLightbox(null)}>
          <div className="about__lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="about__lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            <img src={lightbox.src} alt={lightbox.event} className="about__lightbox-img" />
            <div className="about__lightbox-info">
              <div className="about__gallery-category">{lightbox.category}</div>
              <div className="about__lightbox-event">{lightbox.event}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
