import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Star, ArrowRight, CheckCircle, Truck, Clock,
  MessageCircle, Award, Users, Camera, ChevronDown
} from 'lucide-react';
import ProductCard from '../components/catalog/ProductCard';
import { products, formatPrice } from '../data/products';
import './Home.css';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Nurul Ain',
    role: 'Wisudawan Unhas 2024',
    rating: 5,
    text: 'Papan akriliknya cantik banget! Semua orang yang lihat foto wisudaku selalu tanya sewa papannya di mana. Recommended banget! ✨',
    color: 'linear-gradient(135deg, #FFB6C1, #FF6B9D)',
  },
  {
    id: 2,
    name: 'Ahmad Fauzan',
    role: 'Semhas UIN Makassar',
    rating: 5,
    text: 'Pelayanannya super fast, antarnya tepat waktu, dan papannya bersih serta terawat. Pasti bakal sewa lagi pas wisuda nanti!',
    color: 'linear-gradient(135deg, #1565C0, #42A5F5)',
  },
  {
    id: 3,
    name: 'Siti Rahma',
    role: 'Ulang Tahun ke-21',
    rating: 5,
    text: 'Custom textnya persis sesuai request. Fotoku jadi super aesthetic! Tim Daniyou Stuff sangat helpful dan ramah.',
    color: 'linear-gradient(135deg, #9C27B0, #E040FB)',
  },
  {
    id: 4,
    name: 'Andi Rizky',
    role: 'Wisudawan UNM 2024',
    rating: 5,
    text: 'Harganya sangat terjangkau untuk kualitas yang luar biasa. Papan bulat pink navynya jadi favorit di feed IG-ku!',
    color: 'linear-gradient(135deg, #00BCD4, #4DB6AC)',
  },
];

const STATS = [
  { icon: Users,  value: '500+', label: 'Pelanggan Puas' },
  { icon: Camera, value: '1200+', label: 'Foto Aesthetic' },
  { icon: Star,   value: '4.9',   label: 'Rating Rata-rata' },
  { icon: Award,  value: '2+',    label: 'Tahun Berpengalaman' },
];

const HIGHLIGHTS = [
  {
    icon: '🎨',
    title: '27+ Pilihan Papan',
    desc: 'Koleksi lengkap papan bulat, kubah, besar, dan flowerbox dengan berbagai kombinasi warna yang trendi.',
  },
  {
    icon: '✏️',
    title: 'Custom Teks Gratis',
    desc: 'Tulis nama, ucapan, atau pesan istimewamu. Tim kami akan mendesain layout terbaik untukmu.',
  },
  {
    icon: '🚀',
    title: 'Antar-Jemput Cepat',
    desc: 'Layanan pengiriman dan penjemputan ke lokasi acaramu di Makassar & Gowa. Tepat waktu dijamin!',
  },
  {
    icon: '📸',
    title: 'Foto-Friendly Design',
    desc: 'Setiap papan dirancang untuk tampil sempurna di foto. Dijamin aesthetic di Instagram dan TikTok!',
  },
];

export default function Home() {
  const featuredProducts = products.filter((p) => p.available).slice(0, 8);
  const heroRef = useRef(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home">
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="hero" ref={heroRef}>
        {/* Background orbs */}
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />

        {/* Floating boards decoration */}
        <div className="hero__boards" aria-hidden="true">
          <div className="hero__board hero__board--1" style={{ background: 'linear-gradient(135deg, #FFB6C1, #FF6B9D)' }}>
            <div className="hero__board-shine" />
            <span>✦ Wisuda ✦</span>
          </div>
          <div className="hero__board hero__board--2" style={{ background: 'linear-gradient(135deg, #1565C0, #42A5F5)' }}>
            <div className="hero__board-shine" />
            <span>✦ Semhas ✦</span>
          </div>
          <div className="hero__board hero__board--3" style={{ background: 'linear-gradient(135deg, #9C27B0, #CE93D8)' }}>
            <div className="hero__board-shine" />
            <span>✦ Spesial ✦</span>
          </div>
        </div>

        <div className="container hero__content">
          <div className="hero__badge">
            <Sparkles size={14} />
            Sewa Papan Akrilik Premium di Makassar & Gowa
          </div>

          <h1 className="hero__title">
            Abadikan Momenmu
            <br />
            <span className="text-gradient">Dengan Papan</span>
            <br />
            <em className="hero__title-italic">Akrilik Aesthetic</em>
          </h1>

          <p className="hero__desc">
            Sewa papan ucapan akrilik cantik untuk wisuda, semhas, ulang tahun, dan momen istimewamu.
            Custom teks, antar-jemput ke lokasi, harga terjangkau mulai{' '}
            <strong style={{ color: 'var(--clr-purple-light)' }}>Rp60.000/hari</strong>.
          </p>

          <div className="hero__actions">
            <Link to="/catalog" className="btn btn-primary btn-lg">
              <Sparkles size={18} />
              Lihat Katalog
              <ArrowRight size={18} />
            </Link>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Daniyou%20Stuff!%20Saya%20mau%20tanya%20tentang%20sewa%20papan%20akrilik"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-lg"
            >
              <MessageCircle size={18} />
              WhatsApp Kami
            </a>
          </div>

          <div className="hero__trust">
            {STATS.map((s) => (
              <div className="hero__stat" key={s.label}>
                <div className="hero__stat-value">{s.value}</div>
                <div className="hero__stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <a href="#highlights" className="hero__scroll-hint">
          <ChevronDown size={20} />
          <span>Scroll untuk eksplorasi</span>
        </a>
      </section>

      {/* ── HIGHLIGHTS ────────────────────────────────────────── */}
      <section id="highlights" className="section highlights-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Keunggulan Kami</div>
            <h2 className="section-title">
              Kenapa Pilih <span className="text-gradient">Daniyou Stuff</span>?
            </h2>
            <p className="section-desc">
              Kami hadir untuk membuat setiap momenmu lebih berkesan dengan papan akrilik berkualitas tinggi.
            </p>
          </div>

          <div className="highlights-grid">
            {HIGHLIGHTS.map((h, i) => (
              <div className="highlight-card card" key={i} style={{ '--delay': `${i * 0.1}s` }}>
                <div className="highlight-card__icon">{h.icon}</div>
                <h3 className="highlight-card__title">{h.title}</h3>
                <p className="highlight-card__desc">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────── */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Koleksi Terbaik</div>
            <h2 className="section-title">
              Papan <span className="text-gradient">Paling Populer</span>
            </h2>
            <p className="section-desc">
              Pilihan favorit pelanggan kami yang paling banyak disewa dan tampil di feed Instagram.
            </p>
          </div>

          <div className="featured-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="featured-cta">
            <Link to="/catalog" className="btn btn-secondary btn-lg">
              Lihat Semua 27 Koleksi
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="section how-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Cara Sewa</div>
            <h2 className="section-title">
              Mudah, Cepat, <span className="text-gradient">Aesthetic!</span>
            </h2>
          </div>

          <div className="how-steps">
            {[
              { step: '01', icon: '🔍', title: 'Pilih Papan', desc: 'Browse koleksi kami dan pilih papan yang paling cocok untuk momenmu.' },
              { step: '02', icon: '✏️', title: 'Kustomisasi', desc: 'Input nama, ucapan, tanggal acara, dan detail lainnya sesuai keinginanmu.' },
              { step: '03', icon: '📅', title: 'Jadwalkan', desc: 'Pilih tanggal sewa, durasi, dan opsi pengiriman (antar-jemput tersedia).' },
              { step: '04', icon: '💳', title: 'Bayar & Konfirmasi', desc: 'Bayar via QRIS/Transfer, lalu konfirmasi via WhatsApp. Selesai!' },
            ].map((s, i) => (
              <div className="how-step" key={i}>
                <div className="how-step__number">{s.step}</div>
                <div className="how-step__icon">{s.icon}</div>
                <h4 className="how-step__title">{s.title}</h4>
                <p className="how-step__desc">{s.desc}</p>
                {i < 3 && <div className="how-step__arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Ulasan Pelanggan</div>
            <h2 className="section-title">
              Mereka Sudah <span className="text-gradient">Merasakannya</span>
            </h2>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.id}
                className={`testimonial-card card ${i === activeTestimonial ? 'testimonial-card--active' : ''}`}
              >
                <div className="testimonial-card__header">
                  <div className="testimonial-card__avatar" style={{ background: t.color }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="testimonial-card__name">{t.name}</div>
                    <div className="testimonial-card__role">{t.role}</div>
                  </div>
                  <div className="testimonial-card__stars">
                    {Array.from({ length: t.rating }).map((_, si) => (
                      <Star key={si} size={14} fill="#FFD166" color="#FFD166" />
                    ))}
                  </div>
                </div>
                <p className="testimonial-card__text">"{t.text}"</p>
              </div>
            ))}
          </div>

          <div className="testimonials-dots">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                className={`testimonial-dot ${i === activeTestimonial ? 'testimonial-dot--active' : ''}`}
                onClick={() => setActiveTestimonial(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND INFO BANNER ─────────────────────────────────── */}
      <section className="section brand-section">
        <div className="container">
          <div className="brand-banner card">
            <div className="brand-banner__orb" />
            <div className="brand-banner__content">
              <div className="section-label" style={{ justifyContent: 'flex-start' }}>Tentang Kami</div>
              <h2 className="brand-banner__title">
                Dari Makassar,<br />
                untuk <span className="text-gradient">Momen Istimewamu</span>
              </h2>
              <p className="brand-banner__desc">
                Daniyou Stuff adalah usaha lokal Makassar & Gowa yang berdedikasi menghadirkan papan
                ucapan akrilik berkualitas premium dengan harga yang terjangkau. Kami memahami betapa
                pentingnya dokumentasi momen wisuda, semhas, dan perayaanmu.
              </p>
              <div className="brand-banner__features">
                {['Harga mulai Rp60.000/hari', 'Antar-jemput ke lokasi', 'Custom teks gratis', '100% produk lokal Makassar'].map((f) => (
                  <div key={f} className="brand-banner__feature">
                    <CheckCircle size={16} className="brand-banner__feature-icon" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="brand-banner__actions">
                <Link to="/catalog" className="btn btn-primary">Mulai Sewa Sekarang</Link>
                <Link to="/gallery" className="btn btn-ghost">Lihat Portofolio</Link>
              </div>
            </div>
            <div className="brand-banner__boards">
              {[
                'linear-gradient(135deg, #FFB6C1, #FF6B9D)',
                'linear-gradient(135deg, #C77DFF, #9D4EDD)',
                'linear-gradient(135deg, #1565C0, #42A5F5)',
              ].map((g, i) => (
                <div key={i} className={`brand-mini-board brand-mini-board--${i + 1}`} style={{ background: g }}>
                  <div className="brand-mini-board__shine" />
                  <span>✦</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
