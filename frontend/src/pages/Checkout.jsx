import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Building2, Lock, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import './Checkout.css';

const PAYMENT_METHODS = [
  {
    id: 'qris',
    label: 'QRIS',
    icon: '📱',
    desc: 'Bayar dengan scan QR dari semua dompet digital',
    banks: ['GoPay', 'OVO', 'Dana', 'ShopeePay', 'LinkAja'],
  },
  {
    id: 'ewallet',
    label: 'E-Wallet',
    icon: '💳',
    desc: 'Transfer langsung via dompet digitalmu',
    banks: ['GoPay', 'OVO', 'Dana', 'ShopeePay'],
  },
  {
    id: 'transfer',
    label: 'Transfer Bank',
    icon: '🏦',
    desc: 'Transfer via ATM atau mobile banking',
    banks: ['BCA', 'BRI', 'BNI', 'Mandiri', 'BSI'],
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, discountAmount, deposit, total, rentalDate, returnDate, deliveryOption, promoCode, dispatch } = useCart();

  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nama wajib diisi';
    if (!form.phone.trim()) errs.phone = 'Nomor HP wajib diisi';
    else if (!/^08\d{8,11}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Format: 08xxxxxxxxxx';
    if (deliveryOption === 'delivery' && !form.address.trim()) errs.address = 'Alamat wajib diisi untuk pengiriman';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const buildWaMessage = (orderId) => {
    const paymentLabels = { qris: 'QRIS', ewallet: 'E-Wallet', transfer: 'Transfer Bank' };
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    setProcessing(true);
    
    const orderId = 'DYS-' + Date.now().toString().slice(-8).toUpperCase();
    const waUrl = `https://wa.me/6281234567890?text=${buildWaMessage(orderId)}`;
    
    // Open WA in a new tab synchronously to avoid popup blockers
    window.open(waUrl, '_blank');

    navigate('/confirmation', {
      state: {
        orderId,
        form,
        paymentMethod,
        items,
        subtotal,
        deliveryFee,
        discountAmount,
        deposit,
        total,
        rentalDate,
        returnDate,
        deliveryOption,
        promoCode,
      },
    });
    dispatch({ type: 'CLEAR_CART' });
  };

  if (items.length === 0) {
    navigate('/catalog');
    return null;
  }

  return (
    <div className="checkout page-enter">
      <div className="checkout__header">
        <div className="container">
          <h1 className="checkout__title">Checkout</h1>
          {/* Progress Steps */}
          <div className="checkout__steps">
            {['Keranjang', 'Checkout', 'Konfirmasi'].map((step, i) => (
              <React.Fragment key={step}>
                <div className={`checkout__step ${i === 1 ? 'checkout__step--active' : i < 1 ? 'checkout__step--done' : ''}`}>
                  <div className="checkout__step-dot">{i < 1 ? '✓' : i + 1}</div>
                  <span>{step}</span>
                </div>
                {i < 2 && <div className="checkout__step-line" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="container checkout__body">
        <form onSubmit={handleSubmit} className="checkout__layout">
          {/* ── Left: Form ──────────────────────────────────── */}
          <div className="checkout__form-col">
            {/* Penyewa Data */}
            <div className="checkout__section card">
              <h3 className="checkout__section-title">👤 Data Penyewa</h3>
              <div className="checkout__form-grid">
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Nama Lengkap *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nama sesuai KTP / identitas"
                    className={`input-field ${errors.name ? 'input-field--error' : ''}`}
                  />
                  {errors.name && <span className="input-error">{errors.name}</span>}
                </div>

                <div className="input-group">
                  <label className="input-label">Nomor HP (WhatsApp) *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    className={`input-field ${errors.phone ? 'input-field--error' : ''}`}
                  />
                  {errors.phone && <span className="input-error">{errors.phone}</span>}
                </div>

                <div className="input-group">
                  <label className="input-label">Email (Opsional)</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@gmail.com"
                    className="input-field"
                  />
                </div>

                {deliveryOption === 'delivery' && (
                  <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="input-label">Alamat Pengiriman *</label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Alamat lengkap lokasi acara (nama gedung, jalan, kelurahan, kota)"
                      className={`input-field ${errors.address ? 'input-field--error' : ''}`}
                      rows={3}
                    />
                    {errors.address && <span className="input-error">{errors.address}</span>}
                  </div>
                )}

                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Catatan Tambahan (Opsional)</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Waktu pengiriman, instruksi khusus, dll."
                    className="input-field"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout__section card">
              <h3 className="checkout__section-title">
                <Lock size={18} />
                Metode Pembayaran
              </h3>
              <div className="payment-methods">
                {PAYMENT_METHODS.map((pm) => (
                  <label
                    key={pm.id}
                    className={`payment-method ${paymentMethod === pm.id ? 'payment-method--active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={pm.id}
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                    />
                    <div className="payment-method__icon">{pm.icon}</div>
                    <div className="payment-method__content">
                      <div className="payment-method__label">{pm.label}</div>
                      <div className="payment-method__desc">{pm.desc}</div>
                      <div className="payment-method__banks">
                        {pm.banks.map((b) => (
                          <span key={b} className="payment-bank-tag">{b}</span>
                        ))}
                      </div>
                    </div>
                    {paymentMethod === pm.id && (
                      <CheckCircle size={20} className="payment-method__check" />
                    )}
                  </label>
                ))}
              </div>

              <div className="checkout__payment-note">
                <Lock size={14} />
                Pembayaran 100% aman. Detail pembayaran akan dikirim via WhatsApp setelah checkout.
              </div>
            </div>
          </div>

          {/* ── Right: Order Summary ─────────────────────────── */}
          <aside className="checkout__summary-col">
            <div className="checkout__summary card">
              <h3 className="checkout__section-title">📋 Ringkasan Pesanan</h3>

              {/* Items */}
              <div className="checkout__summary-items">
                {items.map((item) => (
                  <div key={item.id} className="checkout__summary-item">
                    <div
                      className="checkout__summary-board"
                      style={{
                        background: item.gradient,
                        borderRadius: item.shape === 'round' ? '50%' : '8px',
                      }}
                    />
                    <div className="checkout__summary-info">
                      <div className="checkout__summary-name">{item.name}</div>
                      {item.customName && <div className="checkout__summary-meta">✏️ {item.customName}</div>}
                      <div className="checkout__summary-qty">x{item.quantity}</div>
                    </div>
                    <div className="checkout__summary-price">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              {/* Rental Info */}
              {rentalDate && (
                <div className="checkout__rental-info">
                  <div className="checkout__rental-row">
                    <span>Tanggal Sewa</span>
                    <span>{new Date(rentalDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  {returnDate && (
                    <div className="checkout__rental-row">
                      <span>Tanggal Kembali</span>
                      <span>{new Date(returnDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                  <div className="checkout__rental-row">
                    <span>Pengiriman</span>
                    <span>{deliveryOption === 'delivery' ? 'Antar-Jemput' : 'Ambil Sendiri'}</span>
                  </div>
                </div>
              )}

              <div className="summary-divider" style={{ background: 'var(--clr-border)', height: '1px', margin: 'var(--space-sm) 0' }} />

              {/* Totals */}
              <div className="checkout__totals">
                <div className="summary-row"><span>Subtotal Sewa</span><span>{formatPrice(subtotal)}</span></div>
                <div className="summary-row"><span>Ongkos Kirim</span><span>{deliveryFee > 0 ? formatPrice(deliveryFee) : <span style={{ color: '#4ECCA3' }}>Gratis</span>}</span></div>
                <div className="summary-row" style={{ color: 'var(--clr-gold)' }}><span>Deposit Garansi</span><span>{formatPrice(deposit)}</span></div>
                {discountAmount > 0 && (
                  <div className="summary-row" style={{ color: '#4ECCA3' }}><span>Diskon ({promoCode})</span><span>–{formatPrice(discountAmount)}</span></div>
                )}
                <div className="summary-divider" style={{ background: 'var(--clr-border)', height: '1px', margin: '4px 0' }} />
                <div className="summary-row summary-row--total"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>

              <button
                type="submit"
                className={`btn btn-primary checkout__submit-btn ${processing ? 'processing' : ''}`}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Konfirmasi Pesanan
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-ghost checkout__back-btn"
                onClick={() => navigate('/cart')}
              >
                <ArrowLeft size={16} />
                Kembali ke Keranjang
              </button>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
