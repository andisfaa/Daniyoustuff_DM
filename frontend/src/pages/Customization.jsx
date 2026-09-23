import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, CheckCircle, PenTool, Info, Sparkles } from 'lucide-react';
import { getProductById, THEMES, formatPrice, getGradient } from '../data/products';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

export default function Customization() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getProductById(id);
  const { dispatch, items } = useCart();

  const [eventType, setEventType] = useState('');
  const [customName, setCustomName] = useState('');
  const [customGreeting, setCustomGreeting] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);

  const [selectedBoardColor, setSelectedBoardColor] = useState('');
  const [selectedDecorColor, setSelectedDecorColor] = useState('');
  const [selectedLayout, setSelectedLayout] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    if (product) {
      setSelectedBoardColor(product.variants?.boardColor?.[0] || '');
      setSelectedDecorColor(product.variants?.decorColor?.[0] || product.variants?.warna?.[0] || '');
      setSelectedLayout(product.variants?.layout?.[0] || '');
      setSelectedModel(product.variants?.model?.[0]?.name || '');
    }
  }, [product]);

  const currentPrice = useMemo(() => {
    if (product?.variants?.model) {
      const modelInfo = product.variants.model.find(m => m.name === selectedModel);
      if (modelInfo) return modelInfo.price;
    }
    return product?.price || 0;
  }, [product, selectedModel]);

  if (!product) {
    return (
      <div className="page-enter" style={{ textAlign: 'center', paddingTop: '160px' }}>
        <h2>Produk tidak ditemukan</h2>
        <Link to="/catalog" className="btn btn-primary">Kembali ke Katalog</Link>
      </div>
    );
  }

  const inCart = items.some((i) => i.id === product.id);

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        ...product,
        price: currentPrice,
        customName,
        customGreeting,
        eventType,
        selectedBoardColor,
        selectedDecorColor,
        selectedLayout,
        selectedModel
      },
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleRentNow = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { 
        ...product, 
        price: currentPrice,
        customName, 
        customGreeting, 
        eventType,
        selectedBoardColor,
        selectedDecorColor,
        selectedLayout,
        selectedModel
      },
    });
    navigate('/cart');
  };

  const shapeClass = {
    round: 'detail-board--round',
    dome:  'detail-board--dome',
    box:   'detail-board--box',
    large: 'detail-board--large',
  }[product.shape] || '';

  const currentGradient = selectedDecorColor ? getGradient(selectedDecorColor) : (product?.gradient || '');

  return (
    <div className="customization-page page-enter">
      <div className="container">
        {/* Breadcrumb */}
        <div className="detail-breadcrumb">
          <button onClick={() => navigate(-1)} className="detail-back-btn">
            <ArrowLeft size={18} />
            Kembali
          </button>
          <span className="detail-breadcrumb__sep">/</span>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
          <span className="detail-breadcrumb__sep">/</span>
          <span>Kustomisasi</span>
        </div>

        <div className="detail-layout">
          {/* ── Left: Board Visual ──────────────────────── */}
          <div className="detail-visual-col">
            <div className="detail-board-wrapper">
              <div className="detail-board-bg" />
              <div className={`detail-board ${shapeClass}`} style={{ background: currentGradient }}>
                <div className="detail-board__shine" />
                <div className="detail-board__dots" />
                <div className="detail-board__center">
                  <div className="detail-board__preview-text">
                    {customGreeting || <><Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} /> Ucapan Selamat <Sparkles size={12} style={{ display: 'inline', marginLeft: '4px' }} /></>}
                  </div>
                  {customName && (
                    <div className="detail-board__preview-name">~ {customName} ~</div>
                  )}
                  {eventType && (
                    <div className="detail-board__preview-event">
                      {THEMES.find((t) => t.id === eventType)?.label}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Info & Order ─────────────────────── */}
          <div className="detail-info-col">
            <h1 className="detail-title">Kustomisasi Papan</h1>
            <p className="detail-desc">Sesuaikan desain, warna, dan teks untuk momen istimewamu.</p>
            
            <div className="detail-price" style={{ margin: '16px 0' }}>
              <span className="detail-price__amount">{formatPrice(currentPrice)}</span>
              <span className="detail-price__unit">/hari</span>
            </div>

            <div className="detail-divider" />

            {/* Customization Form */}
            <div className="detail-form">
              <h3 className="detail-form__title"><PenTool size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> Pilihan Kustomisasi</h3>

              {product.variants?.boardColor && (
                <div className="input-group">
                  <label className="input-label">Warna Papan *</label>
                  <select
                    value={selectedBoardColor}
                    onChange={(e) => setSelectedBoardColor(e.target.value)}
                    className="input-field"
                  >
                    {product.variants.boardColor.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              )}

              {(product.variants?.decorColor || product.variants?.warna) && (
                <div className="input-group">
                  <label className="input-label">Warna Dekorasi *</label>
                  <select
                    value={selectedDecorColor}
                    onChange={(e) => setSelectedDecorColor(e.target.value)}
                    className="input-field"
                  >
                    {(product.variants.decorColor || product.variants.warna).map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              )}

              {product.variants?.layout && (
                <div className="input-group">
                  <label className="input-label">Layout *</label>
                  <select
                    value={selectedLayout}
                    onChange={(e) => setSelectedLayout(e.target.value)}
                    className="input-field"
                  >
                    {product.variants.layout.map(layout => (
                      <option key={layout} value={layout}>{layout}</option>
                    ))}
                  </select>
                </div>
              )}

              {product.variants?.model && (
                <div className="input-group">
                  <label className="input-label">Model *</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="input-field"
                  >
                    {product.variants.model.map(m => (
                      <option key={m.name} value={m.name}>{m.name} - {formatPrice(m.price)}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Jenis Momen *</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="input-field"
                >
                  <option value="">-- Pilih jenis momen --</option>
                  {THEMES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Nama / Gelar</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Contoh: Nurul Ain, S.Kep."
                  className="input-field"
                  maxLength={60}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Ucapan / Teks Papan</label>
                <textarea
                  value={customGreeting}
                  onChange={(e) => setCustomGreeting(e.target.value)}
                  placeholder="Contoh: Selamat Wisuda! Semoga ilmu yang diraih menjadi berkah."
                  className="input-field"
                  rows={3}
                  maxLength={150}
                />
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                  {customGreeting.length}/150
                </div>
              </div>

              <div className="detail-form__note">
                <Info size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Mockup desain papan akan dikirim via WhatsApp setelah pemesanan dikonfirmasi.
              </div>
            </div>

            {/* Actions */}
            <div className="detail-actions">
              <button
                className={`btn btn-primary detail-actions__rent ${!product.available ? '' : ''}`}
                onClick={handleRentNow}
                disabled={!product.available}
              >
                Selesai & Lanjut Keranjang
              </button>
              <button
                className={`btn btn-secondary detail-actions__cart ${addedToCart || inCart ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={!product.available}
              >
                {addedToCart
                  ? <><CheckCircle size={16} /> Ditambahkan!</>
                  : inCart
                  ? <><ShoppingBag size={16} /> Di Keranjang</>
                  : <><ShoppingBag size={16} /> Tambah ke Keranjang</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
