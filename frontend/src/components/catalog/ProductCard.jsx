import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Star, CheckCircle, XCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../data/products';
import './ProductCard.css';

export default function ProductCard({ product, showAddToCart = true }) {
  const { dispatch, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.some((i) => i.id === product.id);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'ADD_ITEM', payload: product });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const shapeClass = {
    round: 'product-card__visual--round',
    dome:  'product-card__visual--dome',
    box:   'product-card__visual--box',
    large: 'product-card__visual--large',
  }[product.shape] || '';

  return (
    <div className="product-card card">
      {/* Visual / Board Preview */}
      <Link to={`/product/${product.id}`} className="product-card__visual-wrapper">
        <div className={`product-card__visual ${shapeClass}`} style={{ background: product.gradient }}>
          {/* Decorative elements */}
          <div className="product-card__visual-shine" />
          <div className="product-card__visual-dots" />
          <div className="product-card__visual-text">
            <span>✦ Papan Ucapan ✦</span>
          </div>
        </div>
        {/* Availability Badge */}
        <div className={`product-card__avail-badge ${product.available ? 'avail--yes' : 'avail--no'}`}>
          {product.available
            ? <><CheckCircle size={12} /> Tersedia</>
            : <><XCircle size={12} /> Habis</>
          }
        </div>
      </Link>

      {/* Content */}
      <div className="product-card__content">
        <div className="product-card__category">{product.category}</div>

        <Link to={`/product/${product.id}`} className="product-card__name">
          {product.name}
        </Link>

        {product.size !== 'Custom' && (
          <div className="product-card__size">📐 {product.size}</div>
        )}

        <div className="product-card__rating">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} size={12} fill="#FFD166" color="#FFD166" />
          ))}
          <span>(4.9)</span>
        </div>

        <div className="product-card__footer">
          <div className="product-card__price">
            <span className="product-card__price-label">Sewa / hari</span>
            <span className="product-card__price-amount">{formatPrice(product.price)}</span>
          </div>

          {showAddToCart && (
            <div className="product-card__actions">
              <Link
                to={`/product/${product.id}`}
                className="product-card__icon-btn"
                title="Lihat Detail"
              >
                <Eye size={16} />
              </Link>
              <button
                className={`product-card__icon-btn product-card__add-btn ${inCart ? 'in-cart' : ''} ${added ? 'just-added' : ''}`}
                onClick={handleAdd}
                disabled={!product.available}
                title={inCart ? 'Di Keranjang' : 'Tambah ke Keranjang'}
              >
                <ShoppingBag size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
