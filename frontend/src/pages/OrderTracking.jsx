import React, { useState } from 'react';
import { Search, Package, CheckCircle, Truck, Star, MessageCircle } from 'lucide-react';
import './OrderTracking.css';

const MOCK_ORDERS = {
  'DYS-12345678': {
    id: 'DYS-12345678',
    name: 'Nurul Ain',
    phone: '08123456789',
    product: 'Papan Bulat – Pink Soft',
    rentalDate: '2026-09-15',
    returnDate: '2026-09-16',
    currentStep: 2,
    gradient: 'linear-gradient(135deg, #FFB6C1, #FF6B9D)',
    shape: 'round',
  },
  'DYS-87654321': {
    id: 'DYS-87654321',
    name: 'Ahmad Fauzan',
    phone: '08987654321',
    product: 'Papan Kubah – Biru Navy',
    rentalDate: '2026-09-20',
    returnDate: '2026-09-21',
    currentStep: 1,
    gradient: 'linear-gradient(135deg, #1565C0, #42A5F5)',
    shape: 'dome',
  },
};

const TRACKING_STEPS = [
  { icon: '🎨', label: 'Persetujuan Desain', desc: 'Mockup desain sedang dikirim ke WhatsApp Anda' },
  { icon: '📦', label: 'Persiapan Papan', desc: 'Papan sedang disiapkan sesuai desain yang disetujui' },
  { icon: '🚀', label: 'Dalam Pengiriman', desc: 'Papan sedang dalam perjalanan ke lokasi Anda' },
  { icon: '✅', label: 'Selesai', desc: 'Papan berhasil diterima / dikembalikan' },
];

const WA_NUMBER = '6281234567890';

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    const key = orderId.toUpperCase().trim();
    const order = MOCK_ORDERS[key];
    if (order && order.phone === phone.replace(/\s/g, '')) {
      setResult(order);
      setSearched(true);
    } else if (order) {
      setError('Nomor HP tidak sesuai dengan pesanan ini.');
      setResult(null);
    } else {
      setError('ID Pesanan tidak ditemukan. Pastikan ID pesanan benar.');
      setResult(null);
    }
  };

  return (
    <div className="tracking page-enter">
      <div className="tracking__header">
        <div className="tracking__header-orb" />
        <div className="container">
          <div className="section-label" style={{ justifyContent: 'flex-start', marginBottom: 'var(--space-md)' }}>
            Real-time
          </div>
          <h1 className="tracking__title">
            Lacak <span className="text-gradient">Pesananmu</span>
          </h1>
          <p className="tracking__subtitle">
            Pantau status reservasimu secara real-time dari desain hingga pengiriman
          </p>
        </div>
      </div>

      <div className="container tracking__body">
        {/* Search Form */}
        <div className="tracking__search-card card">
          <div className="tracking__search-icon">
            <Package size={28} />
          </div>
          <h2 className="tracking__search-title">Lacak Status Pesanan</h2>
          <p className="tracking__search-desc">
            Masukkan ID Pesanan dan nomor HP WhatsApp yang terdaftar
          </p>

          <form onSubmit={handleSearch} className="tracking__form">
            <div className="input-group">
              <label className="input-label">ID Pesanan</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Contoh: DYS-12345678"
                className="input-field"
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Nomor HP WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="input-field"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary tracking__search-btn">
              <Search size={18} />
              Cari Pesanan
            </button>
          </form>

          {error && <div className="tracking__error">{error}</div>}

          <div className="tracking__demo-hint">
            💡 <strong>Demo:</strong> Coba ID: <code>DYS-12345678</code> HP: <code>08123456789</code>
            &nbsp;atau ID: <code>DYS-87654321</code> HP: <code>08987654321</code>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="tracking__result">
            {/* Order Info */}
            <div className="tracking__order-info card">
              <div className="tracking__order-header">
                <div className={`tracking__order-board tracking__order-board--${result.shape}`} style={{ background: result.gradient }}>
                  <div className="tracking__order-board-shine" />
                </div>
                <div className="tracking__order-details">
                  <div className="tracking__order-id">#{result.id}</div>
                  <div className="tracking__order-product">{result.product}</div>
                  <div className="tracking__order-meta">
                    <span>👤 {result.name}</span>
                    <span>📅 {new Date(result.rentalDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</span>
                    {result.returnDate && (
                      <span>↩️ {new Date(result.returnDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</span>
                    )}
                  </div>
                </div>
                <div className={`tracking__order-status badge ${result.currentStep >= 3 ? 'badge-green' : 'badge-purple'}`}>
                  {result.currentStep >= 3 ? '✅ Selesai' : '⏳ Dalam Proses'}
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="tracking__stepper card">
              <h3 className="tracking__stepper-title">Status Pesanan</h3>
              <div className="tracking__steps">
                {TRACKING_STEPS.map((step, i) => {
                  const isDone = i < result.currentStep;
                  const isActive = i === result.currentStep;
                  return (
                    <div key={i} className={`tracking__step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                      <div className="tracking__step-indicator">
                        <div className="tracking__step-dot">
                          {isDone ? <CheckCircle size={20} /> : <span>{step.icon}</span>}
                        </div>
                        {i < TRACKING_STEPS.length - 1 && (
                          <div className={`tracking__step-line ${isDone ? 'filled' : ''}`} />
                        )}
                      </div>
                      <div className="tracking__step-content">
                        <div className="tracking__step-label">{step.label}</div>
                        <div className="tracking__step-desc">{step.desc}</div>
                        {isActive && (
                          <div className="tracking__step-active-badge">
                            <span className="tracking__pulse" />
                            Saat Ini
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="tracking__cta card">
              <div className="tracking__cta-icon">💬</div>
              <div className="tracking__cta-content">
                <h4>Ada pertanyaan tentang pesananmu?</h4>
                <p>Hubungi tim Daniyou Stuff langsung via WhatsApp untuk update terbaru.</p>
              </div>
              <a
                href={`https://wa.me/${WA_NUMBER}?text=Halo%20Daniyou%20Stuff!%20Saya%20ingin%20menanyakan%20pesanan%20${result.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <MessageCircle size={16} />
                Chat WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
