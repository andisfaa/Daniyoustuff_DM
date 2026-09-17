import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Camera as Instagram, MessageCircle, MapPin, Phone, Heart, Music } from 'lucide-react';
import './Footer.css';

const WA_NUMBER = '6281356942724';

export default function Footer() {
  return (
    <footer className="footer">
      {/* CTA Banner */}
      <div className="footer__cta">
        <div className="footer__cta-inner">
          <div className="footer__cta-content">
            <h3 className="footer__cta-title">Siap Membuat Momenmu Tak Terlupakan?</h3>
            <p className="footer__cta-desc">
              Pesan papan akrilik premium sekarang dan abadikan momen istimewamu bersama Daniyou Stuff.
            </p>
          </div>
          <div className="footer__cta-actions">
            <Link to="/catalog" className="btn btn-primary btn-lg">
              Lihat Katalog
            </Link>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=Halo%20Daniyou%20Stuff!%20Saya%20ingin%20bertanya%20tentang%20sewa%20papan%20akrilik`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-lg"
            >
              <MessageCircle size={18} />
              WhatsApp Kami
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer__main">
        <div className="container footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <div className="footer__logo-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="footer__logo-name">Daniyou Stuff.co</div>
                <div className="footer__logo-tagline">Sewa Papan Akrilik Premium</div>
              </div>
            </div>
            <p className="footer__brand-desc">
              Spesialis sewa papan ucapan akrilik cantik untuk wisuda, semhas, ulang tahun,
              dan semua momen istimewamu di Makassar & Gowa.
            </p>
            <div className="footer__socials">
              <a
                href="https://www.instagram.com/daniyoustuff.co"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-btn"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.tiktok.com/@papan.akrilik.murah"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-btn"
                aria-label="TikTok"
              >
                <Music size={18} />
              </a>
              <a
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-btn footer__social-btn--wa"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="footer__links-col">
            <h4 className="footer__col-title">Menu</h4>
            <ul className="footer__links">
              <li><Link to="/">Beranda</Link></li>
              <li><Link to="/catalog">Katalog Produk</Link></li>
              <li><Link to="/gallery">Portofolio</Link></li>
              <li><Link to="/track">Lacak Pesanan</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer__links-col">
            <h4 className="footer__col-title">Kategori</h4>
            <ul className="footer__links">
              <li><Link to="/catalog?category=Papan Bulat">Papan Bulat</Link></li>
              <li><Link to="/catalog?category=Papan Kubah">Papan Kubah</Link></li>
              <li><Link to="/catalog?category=Papan Besar">Papan Besar</Link></li>
              <li><Link to="/catalog?category=Flowerbox">Flowerbox</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__links-col">
            <h4 className="footer__col-title">Kontak</h4>
            <ul className="footer__contacts">
              <li>
                <MapPin size={15} />
                <span>Makassar & Gowa, Sulawesi Selatan</span>
              </li>
              <li>
                <Phone size={15} />
                <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer">
                  +62 813-5694-2724
                </a>
              </li>
              <li>
                <Instagram size={15} />
                <a href="https://www.instagram.com/daniyoustuff.co" target="_blank" rel="noopener noreferrer">
                  @daniyoustuff.co
                </a>
              </li>
              <li>
                <Music size={15} />
                <a href="https://www.tiktok.com/@papan.akrilik.murah" target="_blank" rel="noopener noreferrer">
                  @papan.akrilik.murah
                </a>
              </li>
            </ul>
            <div className="footer__hours">
              <div className="footer__hours-label">Jam Operasional</div>
              <div>Senin – Sabtu: 08.00 – 21.00 WITA</div>
              <div>Minggu: 09.00 – 18.00 WITA</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <div className="container footer__bottom-inner">
            <p className="footer__copyright">
              © 2024 Daniyou Stuff.co · Semua hak dilindungi
            </p>
            <p className="footer__made-with">
              Dibuat dengan <Heart size={13} fill="currentColor" /> untuk pelanggan Daniyou Stuff
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
