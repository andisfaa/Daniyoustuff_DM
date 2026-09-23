import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Star, CheckCircle, XCircle, Sparkles, Palette, Ruler } from 'lucide-react';
import { formatPrice } from '../../data/products';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const shapeClass = {
    round: 'product-card__visual--round',
    dome:  'product-card__visual--dome',
    box:   'product-card__visual--box',
    large: 'product-card__visual--large',
  }[product.shape] || '';

  // For Flowerbox, show price range
  const priceLabel = product.id === 'flowerbox'
    ? `${formatPrice(70000)} – ${formatPrice(85000)}`
    : formatPrice(product.price);

  // Count total variants
  const variantCount = product.variants
    ? Object.values(product.variants).reduce((sum, v) => {
        if (Array.isArray(v)) {
          if (typeof v[0] === 'object') return sum + v.length;
          return sum + v.length;
        }
        return sum;
      }, 0)
    : 0;

  return (
    <div className="product-card card">
      {/* Visual / Board Preview */}
      <Link to={`/product/${product.id}`} className="product-card__visual-wrapper">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className={`product-card__visual ${shapeClass}`} 
            style={{ objectFit: 'cover', width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <div className={`product-card__visual ${shapeClass}`} style={{ background: product.gradient }}>
            {/* Decorative elements */}
            <div className="product-card__visual-shine" />
            <div className="product-card__visual-dots" />
            <div className="product-card__visual-text">
              <span><Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} /> {product.name} <Sparkles size={12} style={{ display: 'inline', marginLeft: '4px' }} /></span>
            </div>
          </div>
        )}
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
          <div className="product-card__size"><Ruler size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> {product.size}</div>
        )}

        {variantCount > 0 && (
          <div className="product-card__variants">
            <Palette size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> {variantCount} pilihan varian
          </div>
        )}

        <div className="product-card__rating">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} size={12} fill="#C49A3C" color="#C49A3C" />
          ))}
          <span>(4.9)</span>
        </div>

        <div className="product-card__footer">
          <div className="product-card__price">
            <span className="product-card__price-label">
              {product.id === 'flowerbox' ? 'Mulai dari' : 'Sewa / hari'}
            </span>
            <span className="product-card__price-amount">{priceLabel}</span>
          </div>

          <Link
            to={`/product/${product.id}`}
            className="btn btn-primary btn-sm product-card__cta"
          >
            <Eye size={14} />
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
}
