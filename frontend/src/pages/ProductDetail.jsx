import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ShoppingBag, CheckCircle, Star, Ruler, Tag,
  Clock, ChevronDown, ChevronUp, MessageCircle, Heart,
  Search, Sparkles, Palette
} from 'lucide-react';
import { getProductById, THEMES, formatPrice, getGradient, getBoardColor } from '../data/products';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getProductById(id);
  const { dispatch, items } = useCart();


  const [wishlist, setWishlist] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  useEffect(() => {
    if (product) {
      setMainImageIndex(0);
    }
  }, [product]);

  const currentPrice = useMemo(() => {
    if (product?.variants?.model) {
      return product.variants.model[0].price;
    }
    return product?.price || 0;
  }, [product]);

  if (!product) {
    return (
      <div className="not-found page-enter">
        <div className="container" style={{ textAlign: 'center', paddingTop: '160px' }}>
          <div style={{ marginBottom: '24px' }}>
            <Search size={64} color="var(--clr-purple)" />
          </div>
          <h2>Produk tidak ditemukan</h2>
          <p style={{ marginBottom: '24px' }}>Papan yang kamu cari tidak tersedia.</p>
          <Link to="/catalog" className="btn btn-primary">Kembali ke Katalog</Link>
        </div>
      </div>
    );
  }

  const handleRentNow = () => {
    navigate(`/product/${product.id}/customize`);
  };

  const shapeClass = {
    round: 'detail-board--round',
    dome:  'detail-board--dome',
    box:   'detail-board--box',
    large: 'detail-board--large',
  }[product.shape] || '';

  const FAQS = [
    { q: 'Apakah bisa custom warna papan?', a: 'Saat ini kami menyediakan koleksi warna yang sudah ada. Untuk custom warna khusus, silakan hubungi kami via WhatsApp.' },
    { q: 'Berapa lama durasi sewa minimum?', a: 'Minimum sewa adalah 1 hari (24 jam). Untuk durasi lebih panjang, harga dapat didiskusikan.' },
    { q: 'Apakah termasuk biaya pengiriman?', a: 'Biaya sewa belum termasuk ongkos antar-jemput. Ongkir akan dihitung berdasarkan jarak lokasi acara.' },
    { q: 'Kapan mockup desain dikirimkan?', a: 'Mockup desain akan dikirimkan via WhatsApp dalam 1–2 jam setelah pemesanan dikonfirmasi.' },
  ];

  const currentGradient = product?.gradient || '';

  return (
    <div className="product-detail page-enter">
      <div className="container">
        {/* Breadcrumb */}
        <div className="detail-breadcrumb">
          <button onClick={() => navigate(-1)} className="detail-back-btn">
            <ArrowLeft size={18} />
            Kembali
          </button>
          <span className="detail-breadcrumb__sep">/</span>
          <Link to="/catalog">Katalog</Link>
          <span className="detail-breadcrumb__sep">/</span>
          <span>{product.name}</span>
        </div>

        <div className="detail-layout">
          {/* ── Left: Board Visual ──────────────────────── */}
          <div className="detail-visual-col">
            <div className="detail-board-wrapper">
              <div className="detail-board-bg" />

              {product.images && product.images.length > 0 ? (
                <div className="detail-image-gallery" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <img 
                    src={product.images[mainImageIndex]} 
                    alt={product.name} 
                    className={`detail-board ${shapeClass}`} 
                    style={{ objectFit: 'cover', width: '100%', height: '100%', border: 'none', background: 'transparent' }}
                  />
                  {product.images.length > 1 && (
                    <div className="detail-thumbnails" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                      {product.images.map((img, idx) => (
                        <img 
                          key={idx} 
                          src={img} 
                          alt={`${product.name} ${idx + 1}`} 
                          onClick={() => setMainImageIndex(idx)}
                          style={{ 
                            width: '70px', 
                            height: '70px', 
                            objectFit: 'cover', 
                            borderRadius: '8px', 
                            border: mainImageIndex === idx ? '2px solid var(--clr-primary)' : '2px solid transparent',
                            cursor: 'pointer',
                            opacity: mainImageIndex === idx ? 1 : 0.7,
                            transition: 'all 0.2s ease'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className={`detail-board ${shapeClass}`} style={{ background: currentGradient }}>
                  <div className="detail-board__shine" />
                  <div className="detail-board__dots" />
                  <div className="detail-board__center">
                    <div className="detail-board__preview-text">
                      <><Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} /> Ucapan Selamat <Sparkles size={12} style={{ display: 'inline', marginLeft: '4px' }} /></>
                    </div>
                  </div>
                </div>
              )}

              {/* Wishlist */}
              <button
                className={`detail-wishlist-btn ${wishlist ? 'active' : ''}`}
                onClick={() => setWishlist(!wishlist)}
              >
                <Heart size={20} fill={wishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Specs */}
            <div className="detail-specs card">
              <h4 className="detail-specs__title">Spesifikasi</h4>
              <div className="detail-specs__grid">
                <div className="detail-spec-item">
                  <div className="detail-spec-icon"><Tag size={15} /></div>
                  <div>
                    <div className="detail-spec-label">Kategori</div>
                    <div className="detail-spec-value">{product.category}</div>
                  </div>
                </div>
                {product.size !== 'Custom' && (
                  <div className="detail-spec-item">
                    <div className="detail-spec-icon"><Ruler size={15} /></div>
                    <div>
                      <div className="detail-spec-label">Ukuran</div>
                      <div className="detail-spec-value">{product.size}</div>
                    </div>
                  </div>
                )}
                <div className="detail-spec-item">
                  <div className="detail-spec-icon"><Palette size={15} /></div>
                  <div>
                    <div className="detail-spec-label">Warna</div>
                    <div className="detail-spec-value">{product.colorVariant}</div>
                  </div>
                </div>
                <div className="detail-spec-item">
                  <div className="detail-spec-icon"><Clock size={15} /></div>
                  <div>
                    <div className="detail-spec-label">Min. Sewa</div>
                    <div className="detail-spec-value">1 Hari</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Info & Order ─────────────────────── */}
          <div className="detail-info-col">
            {/* Badge + Category */}
            <div className="detail-badges">
              <span className="badge badge-purple">{product.category}</span>
              {product.available
                ? <span className="badge badge-green"><CheckCircle size={11} /> Tersedia</span>
                : <span className="badge badge-red">Habis</span>
              }
            </div>

            <h1 className="detail-title">{product.name}</h1>

            <div className="detail-rating">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={16} fill="#FFD166" color="#FFD166" />
              ))}
              <span className="detail-rating__score">4.9</span>
              <span className="detail-rating__count">(89 ulasan)</span>
            </div>

            <div className="detail-price">
              <span className="detail-price__amount">{formatPrice(currentPrice)}</span>
              <span className="detail-price__unit">/hari</span>
            </div>

            <p className="detail-desc">{product.description}</p>

            {/* Features */}
            <div className="detail-features">
              {product.features.map((f) => (
                <div key={f} className="detail-feature-item">
                  <CheckCircle size={14} className="detail-feature-check" />
                  {f}
                </div>
              ))}
            </div>

            <div className="detail-divider" />

            {/* Actions */}
            <div className="detail-actions" style={{ gridTemplateColumns: '1fr' }}>
              <button
                className={`btn btn-primary detail-actions__rent ${!product.available ? '' : ''}`}
                onClick={handleRentNow}
                disabled={!product.available}
                style={{ padding: '16px', fontSize: '1.1rem' }}
              >
                Kustomisasi & Sewa
              </button>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/6281234567890?text=Halo%20Daniyou%20Stuff!%20Saya%20tertarik%20menyewa%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost detail-wa-btn"
            >
              <MessageCircle size={16} />
              Tanya via WhatsApp
            </a>

            {/* FAQ */}
            <div className="detail-faq">
              <h4 className="detail-faq__title">FAQ</h4>
              {FAQS.map((faq, i) => (
                <div key={i} className="detail-faq__item">
                  <button
                    className="detail-faq__question"
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  >
                    {faq.q}
                    {faqOpen === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {faqOpen === i && (
                    <div className="detail-faq__answer">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
