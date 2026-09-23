import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Download, MessageCircle, Package, ArrowRight, Copy, Star, Sparkles, PenTool, Award, Clock, MapPin, CreditCard, Palette, Rocket, Camera } from 'lucide-react';
import { formatPrice } from '../data/products';
import './Confirmation.css';

const WA_NUMBER = '6281234567890';

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);
  const state = location.state;

  useEffect(() => {
    if (!state?.orderId) {
      navigate('/catalog');
    }
  }, [state, navigate]);

  if (!state?.orderId) return null;

  const { orderId, form, paymentMethod, items, subtotal, deliveryFee, discountAmount, deposit, total, rentalDate, returnDate, deliveryOption, promoCode } = state;

  const paymentLabels = { qris: 'QRIS', ewallet: 'E-Wallet', transfer: 'Transfer Bank' };

  const buildWaMessage = () => {
    const lines = [
      `Halo Daniyou Stuff! 🌸`,
      ``,
      `Saya ingin mengkonfirmasi pesanan:`,
      `📋 No. Pesanan: *${orderId}*`,
      `👤 Nama: ${form.name}`,
      `📱 HP: ${form.phone}`,
      ``,
      `🎨 Papan yang Disewa:`,
      ...items.map((i) => `• ${i.name} x${i.quantity}${i.customName ? ` (${i.customName})` : ''}`),
      ``,
      `📅 Tanggal Sewa: ${rentalDate ? new Date(rentalDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}`,
      `🚚 Pengiriman: ${deliveryOption === 'delivery' ? 'Antar-Jemput' : 'Ambil Sendiri'}`,
      `💳 Metode Bayar: ${paymentLabels[paymentMethod]}`,
      `💰 Total: ${formatPrice(total)}`,
      ``,
      `Terima kasih! 🙏`,
    ];
    return encodeURIComponent(lines.join('\n'));
  };

  const copyOrderId = () => {
    navigator.clipboard?.writeText(orderId);
  };

  return (
    <div className="confirmation page-enter">
      {/* Confetti-like animation */}
      <div className="confirmation__particles" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="confirmation__particle" style={{
            '--delay': `${Math.random() * 2}s`,
            '--x': `${Math.random() * 100}vw`,
            '--color': ['#C77DFF', '#FF6B9D', '#FFD166', '#4FC3F7', '#06D6A0'][i % 5],
          }} />
        ))}
      </div>

      <div className="container confirmation__body">
        {/* Success Icon */}
        <div className="confirmation__success-icon">
          <CheckCircle size={48} />
        </div>

        <div className="confirmation__heading">
          <h1 className="confirmation__title">Pesananmu Berhasil! <Sparkles size={32} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '8px', color: 'var(--clr-primary)' }} /></h1>
          <p className="confirmation__subtitle">
            Terima kasih, <strong>{form.name}</strong>! Pesananmu sudah kami terima.
            Tim Daniyou Stuff akan segera menghubungimu via WhatsApp.
          </p>
        </div>

        {/* Invoice */}
        <div className="confirmation__invoice card" ref={invoiceRef}>
          <div className="invoice__header">
            <div className="invoice__brand">
              <div className="invoice__brand-logo"><Sparkles size={16} /></div>
              <div>
                <div className="invoice__brand-name">Daniyou Stuff.co</div>
                <div className="invoice__brand-tagline">Sewa Papan Akrilik Premium</div>
              </div>
            </div>
            <div className="invoice__info">
              <div className="invoice__label">E-INVOICE</div>
              <div className="invoice__order-id">
                {orderId}
                <button className="invoice__copy-btn" onClick={copyOrderId} title="Salin ID Pesanan">
                  <Copy size={14} />
                </button>
              </div>
              <div className="invoice__date">
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="invoice__divider" />

          {/* Customer Info */}
          <div className="invoice__section">
            <div className="invoice__section-title">Data Penyewa</div>
            <div className="invoice__grid">
              <div><span>Nama</span><strong>{form.name}</strong></div>
              <div><span>WhatsApp</span><strong>{form.phone}</strong></div>
              {form.email && <div><span>Email</span><strong>{form.email}</strong></div>}
              <div><span>Pembayaran</span><strong>{paymentLabels[paymentMethod]}</strong></div>
            </div>
          </div>

          {/* Rental Info */}
          <div className="invoice__section">
            <div className="invoice__section-title">Detail Sewa</div>
            <div className="invoice__grid">
              <div>
                <span>Tanggal Sewa</span>
                <strong>{rentalDate ? new Date(rentalDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</strong>
              </div>
              {returnDate && (
                <div>
                  <span>Tanggal Kembali</span>
                  <strong>{new Date(returnDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </div>
              )}
              <div>
                <span>Pengiriman</span>
                <strong>{deliveryOption === 'delivery' ? '🚚 Antar-Jemput' : '📦 Ambil Sendiri'}</strong>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="invoice__section">
            <div className="invoice__section-title">Papan yang Disewa</div>
            <div className="invoice__items">
              {items.map((item) => (
                <div key={item.id} className="invoice__item">
                  <div
                    className="invoice__item-board"
                    style={{
                      background: item.gradient,
                      borderRadius: item.shape === 'round' ? '50%' : '6px',
                    }}
                  />
                  <div className="invoice__item-info">
                    <div className="invoice__item-name">{item.name}</div>
                    {item.customName && <div className="invoice__item-meta"><PenTool size={12} style={{ display: 'inline', marginRight: '4px' }} /> {item.customName}</div>}
                    {item.eventType && <div className="invoice__item-meta"><Award size={12} style={{ display: 'inline', marginRight: '4px' }} /> {item.eventType}</div>}
                  </div>
                  <div className="invoice__item-qty">x{item.quantity}</div>
                  <div className="invoice__item-price">{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="invoice__totals">
            <div className="invoice__total-row"><span>Subtotal Sewa</span><span>{formatPrice(subtotal)}</span></div>
            <div className="invoice__total-row"><span>Biaya Pengiriman</span><span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Gratis'}</span></div>
            <div className="invoice__total-row invoice__total-row--deposit"><span>Deposit Garansi</span><span>{formatPrice(deposit)}</span></div>
            {discountAmount > 0 && (
              <div className="invoice__total-row invoice__total-row--discount"><span>Diskon ({promoCode})</span><span>–{formatPrice(discountAmount)}</span></div>
            )}
            <div className="invoice__total-row invoice__total-row--final">
              <span>TOTAL PEMBAYARAN</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="invoice__footer">
            <div className="invoice__status">
              <span className="badge badge-purple"><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> Menunggu Konfirmasi</span>
            </div>
            <div className="invoice__footer-note">
              Mockup desain akan dikirim setelah pembayaran dikonfirmasi via WhatsApp
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="confirmation__next-steps">
          <h3 className="confirmation__steps-title"><MapPin size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> Langkah Selanjutnya</h3>
          <div className="confirmation__steps-grid">
            {[
              { step: '01', icon: <CreditCard size={24} />, title: 'Konfirmasi Pembayaran', desc: 'Lakukan pembayaran sesuai metode yang dipilih dan konfirmasi via WhatsApp.' },
              { step: '02', icon: <Palette size={24} />, title: 'Approval Desain', desc: 'Tim kami mengirim mockup desain papan. Review dan setujui via chat.' },
              { step: '03', icon: <Package size={24} />, title: 'Persiapan Papan', desc: 'Papan disiapkan sesuai desain yang disetujui, siap untuk dikirim.' },
              { step: '04', icon: <Rocket size={24} />, title: 'Pengiriman / Ambil', desc: 'Papan dikirim ke lokasimu atau siap dijemput pada tanggal yang disepakati.' },
            ].map((s) => (
              <div key={s.step} className="confirmation__step-card card">
                <div className="confirmation__step-num">{s.step}</div>
                <div className="confirmation__step-icon">{s.icon}</div>
                <div className="confirmation__step-title">{s.title}</div>
                <div className="confirmation__step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="confirmation__actions">
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${buildWaMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg"
          >
            <MessageCircle size={20} />
            Konfirmasi via WhatsApp
          </a>

          <Link to="/track" className="btn btn-secondary btn-lg">
            <Package size={18} />
            Lacak Pesanan
          </Link>

          <Link to="/catalog" className="btn btn-ghost">
            Lihat Katalog Lain
          </Link>
        </div>

        {/* Review prompt */}
        <div className="confirmation__review-prompt card">
          <div className="confirmation__review-stars">
            {[1,2,3,4,5].map((s) => <Star key={s} size={20} fill="#FFD166" color="#FFD166" />)}
          </div>
          <p>Senang dengan pengalamanmu? Bagikan ceritamu di Instagram dengan tag <strong>@daniyoustuff.co</strong> <Camera size={18} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} /></p>
        </div>
      </div>
    </div>
  );
}
