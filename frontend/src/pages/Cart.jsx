import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight,
  Truck, Package, Tag, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import './Cart.css';

const DELIVERY_FEE = 15000;

export default function Cart() {
  const navigate = useNavigate();
  const {
    items, dispatch, subtotal, deliveryFee, discountAmount,
    deposit, total, deliveryOption, promoCode, promoDiscount,
    rentalDate, returnDate, applyPromo,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(true);

  const handlePromoApply = () => {
    setPromoError('');
    setPromoSuccess('');
    if (!promoInput.trim()) {
      setPromoError('Masukkan kode promo terlebih dahulu.');
      return;
    }
    const ok = applyPromo(promoInput);
    if (ok) {
      setPromoSuccess(`Promo ${promoInput.toUpperCase()} berhasil digunakan! Diskon ${(promoDiscount || applyPromoDiscount(promoInput)) * 100}%`);
      setPromoInput('');
    } else {
      setPromoError('Kode promo tidak valid atau sudah kadaluarsa.');
    }
  };

  const applyPromoDiscount = (code) => {
    const map = { DANIYOU10: 0.10, WISUDA25: 0.25, SEMHAS15: 0.15 };
    return map[code.toUpperCase()] || 0;
  };

  if (items.length === 0) {
    return (
      <div className="cart-empty page-enter">
        <div className="cart-empty__inner">
          <div className="cart-empty__icon">
            <ShoppingBag size={48} />
          </div>
          <h2>Keranjangmu kosong</h2>
          <p>Belum ada papan akrilik yang ditambahkan. Yuk, lihat koleksi kami!</p>
          <Link to="/catalog" className="btn btn-primary btn-lg">
            Lihat Katalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart page-enter">
      <div className="cart__header">
        <div className="cart__header-orb" />
        <div className="container">
          <h1 className="cart__title">
            <ShoppingBag size={28} />
            Keranjang Sewa
          </h1>
          <p className="cart__subtitle">{items.length} item dipilih</p>
        </div>
      </div>

      <div className="container cart__body">
        <div className="cart__layout">
          {/* ── Left: Items ──────────────────────────────────── */}
          <div className="cart__items-col">
            {/* Rental Schedule */}
            <div className="cart__schedule card">
              <h3 className="cart__section-title">📅 Jadwal Sewa</h3>
              <div className="cart__schedule-grid">
                <div className="input-group">
                  <label className="input-label">Tanggal Sewa *</label>
                  <input
                    type="date"
                    value={rentalDate}
                    onChange={(e) => dispatch({ type: 'SET_RENTAL_DATE', payload: e.target.value })}
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Tanggal Pengembalian *</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => dispatch({ type: 'SET_RETURN_DATE', payload: e.target.value })}
                    className="input-field"
                    min={rentalDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Option */}
            <div className="cart__delivery card">
              <h3 className="cart__section-title">🚚 Opsi Pengiriman</h3>
              <div className="delivery-options">
                <label className={`delivery-option ${deliveryOption === 'pickup' ? 'delivery-option--active' : ''}`}>
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={deliveryOption === 'pickup'}
                    onChange={() => dispatch({ type: 'SET_DELIVERY_OPTION', payload: 'pickup' })}
                  />
                  <div className="delivery-option__icon"><Package size={22} /></div>
                  <div className="delivery-option__content">
                    <div className="delivery-option__name">Ambil Sendiri</div>
                    <div className="delivery-option__desc">Jemput di lokasi kami · Gratis</div>
                  </div>
                  <div className="delivery-option__price">Gratis</div>
                </label>

                <label className={`delivery-option ${deliveryOption === 'delivery' ? 'delivery-option--active' : ''}`}>
                  <input
                    type="radio"
                    name="delivery"
                    value="delivery"
                    checked={deliveryOption === 'delivery'}
                    onChange={() => dispatch({ type: 'SET_DELIVERY_OPTION', payload: 'delivery' })}
                  />
                  <div className="delivery-option__icon"><Truck size={22} /></div>
                  <div className="delivery-option__content">
                    <div className="delivery-option__name">Antar-Jemput</div>
                    <div className="delivery-option__desc">Diantar ke lokasi acaramu</div>
                  </div>
                  <div className="delivery-option__price">{formatPrice(DELIVERY_FEE)}</div>
                </label>
              </div>
            </div>

            {/* Cart Items */}
            <div className="cart__items-list">
              <h3 className="cart__section-title">🎨 Papan yang Disewa</h3>
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} dispatch={dispatch} />
              ))}
            </div>

            {/* Promo Code */}
            <div className="cart__promo card">
              <div className="cart__promo-header">
                <Tag size={18} />
                <h3 className="cart__section-title" style={{ margin: 0 }}>Kode Promo</h3>
              </div>

              {promoCode ? (
                <div className="promo-applied">
                  <div className="promo-applied__info">
                    <span className="badge badge-green">✓ {promoCode}</span>
                    <span className="promo-applied__discount">Diskon {promoDiscount * 100}% berhasil!</span>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => dispatch({ type: 'CLEAR_PROMO' })}
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <div className="promo-input-row">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                    placeholder="Masukkan kode promo (cth: WISUDA25)"
                    className="input-field"
                    onKeyDown={(e) => e.key === 'Enter' && handlePromoApply()}
                  />
                  <button className="btn btn-secondary" onClick={handlePromoApply}>
                    Gunakan
                  </button>
                </div>
              )}
              {promoError && <div className="promo-error">{promoError}</div>}
              {promoSuccess && <div className="promo-success">{promoSuccess}</div>}
              <div className="promo-hint">
                💡 Coba kode: <code>DANIYOU10</code>, <code>WISUDA25</code>, atau <code>SEMHAS15</code>
              </div>
            </div>
          </div>

          {/* ── Right: Summary ───────────────────────────────── */}
          <aside className="cart__summary-col">
            <div className="cart__summary card">
              <button
                className="cart__summary-toggle"
                onClick={() => setSummaryOpen(!summaryOpen)}
              >
                <h3 className="cart__section-title" style={{ margin: 0 }}>📋 Ringkasan Sewa</h3>
                {summaryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {summaryOpen && (
                <div className="summary-rows">
                  <div className="summary-row">
                    <span>Subtotal sewa ({items.length} item)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Biaya pengiriman</span>
                    <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : <span className="summary-free">Gratis</span>}</span>
                  </div>
                  <div className="summary-row summary-row--deposit">
                    <span>
                      Deposit Garansi
                      <Info size={13} className="summary-info-icon" title="Deposit dikembalikan setelah papan dikembalikan dalam kondisi baik" />
                    </span>
                    <span>{formatPrice(deposit)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="summary-row summary-row--discount">
                      <span>Diskon Promo ({promoCode})</span>
                      <span>–{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="summary-divider" />
                  <div className="summary-row summary-row--total">
                    <span>Total Pembayaran</span>
                    <span>{formatPrice(total)}</span>
                  </div>

                  <div className="summary-deposit-note">
                    <Info size={13} />
                    Deposit Rp100.000 akan dikembalikan penuh setelah papan dikembalikan dalam kondisi baik.
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary summary-checkout-btn"
                onClick={() => navigate('/checkout')}
                disabled={!rentalDate}
              >
                Lanjut ke Pembayaran
                <ArrowRight size={18} />
              </button>
              {!rentalDate && (
                <p className="summary-date-warning">⚠️ Pilih tanggal sewa terlebih dahulu</p>
              )}

              <Link to="/catalog" className="btn btn-ghost summary-continue-btn">
                <ArrowLeft size={16} />
                Tambah Produk Lain
              </Link>
            </div>

            {/* Trust badges */}
            <div className="cart__trust-badges card">
              {[
                { icon: '🔒', text: 'Pembayaran Aman & Terenkripsi' },
                { icon: '↩️', text: 'Deposit Dikembalikan Penuh' },
                { icon: '📱', text: 'Konfirmasi via WhatsApp' },
              ].map((b) => (
                <div key={b.text} className="trust-badge">
                  <span className="trust-badge__icon">{b.icon}</span>
                  <span className="trust-badge__text">{b.text}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function CartItemRow({ item, dispatch }) {
  const shapeClass = {
    round: 'cart-item__board--round',
    dome:  'cart-item__board--dome',
    box:   'cart-item__board--box',
    large: 'cart-item__board--large',
  }[item.shape] || '';

  return (
    <div className="cart-item card">
      <div className={`cart-item__board ${shapeClass}`} style={{ background: item.gradient }}>
        <div className="cart-item__board-shine" />
        {item.customName && <span className="cart-item__board-name">{item.customName}</span>}
      </div>

      <div className="cart-item__info">
        <div className="cart-item__category">{item.category}</div>
        <div className="cart-item__name">{item.name}</div>
        {item.size !== 'Custom' && (
          <div className="cart-item__size">📐 {item.size}</div>
        )}
        {item.selectedModel && (
          <div className="cart-item__custom">🏷️ {item.selectedModel}</div>
        )}
        {item.eventType && (
          <div className="cart-item__event">🎓 {item.eventType}</div>
        )}
        {item.customName && (
          <div className="cart-item__custom">✏️ {item.customName}</div>
        )}
        {item.selectedBoardColor && (
          <div className="cart-item__custom">🎨 Papan: {item.selectedBoardColor}</div>
        )}
        {item.selectedDecorColor && (
          <div className="cart-item__custom">🌸 Dekorasi: {item.selectedDecorColor}</div>
        )}
        {item.selectedLayout && (
          <div className="cart-item__custom">📐 Layout: {item.selectedLayout}</div>
        )}
      </div>

      <div className="cart-item__actions">
        <div className="cart-item__qty">
          <button
            onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } })}
            disabled={item.quantity <= 1}
          >
            <Minus size={14} />
          </button>
          <span>{item.quantity}</span>
          <button
            onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity + 1 } })}
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="cart-item__price">{formatPrice(item.price * item.quantity)}</div>
        <button
          className="cart-item__remove"
          onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
