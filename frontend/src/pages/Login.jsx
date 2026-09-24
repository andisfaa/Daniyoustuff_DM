import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, ArrowRight, Eye, EyeOff, Lock, User } from 'lucide-react';
import logoImg from '../assets/IMG/LOGO DANIYOUSTUFF.CO.png';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1500);
  };

  const handleGoogle = () => {
    setGoogleLoading(true);
    // Simulasi Google OAuth redirect
    setTimeout(() => {
      setGoogleLoading(false);
      navigate('/');
    }, 2000);
  };

  return (
    <div className="login-page page-enter">
      {/* Background orbs */}
      <div className="login__orb login__orb--1" />
      <div className="login__orb login__orb--2" />
      <div className="login__orb login__orb--3" />

      <div className="login__container">
        {/* Left Panel – Brand */}
        <div className="login__brand-panel">
          <div className="login__brand-orb" />
          <div className="login__brand-content">
            <Link to="/" className="login__brand-logo">
              <img src={logoImg} alt="DaniyouStuff Logo" />
            </Link>
            <h2 className="login__brand-tagline">
              Abadikan Setiap<br />
              <span className="text-gradient">Momen Istimewa</span><br />
              Bersamamu
            </h2>
            <p className="login__brand-desc">
              Sewa papan ucapan akrilik premium untuk wisuda, semhas,
              ulang tahun, dan semua perayaanmu di Makassar &amp; Gowa.
            </p>
            <div className="login__brand-features">
              {['500+ Pelanggan Puas', 'Custom Teks Gratis', 'Antar-Jemput ke Lokasi', 'Harga Mulai Rp60.000'].map((f) => (
                <div key={f} className="login__brand-feature">
                  <span className="login__brand-feature-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>
          {/* Floating boards decoration */}
          <div className="login__floating-boards" aria-hidden="true">
            <div className="login__mini-board login__mini-board--1">
              <Sparkles size={14} />
              <span>Wisuda</span>
            </div>
            <div className="login__mini-board login__mini-board--2">
              <Sparkles size={14} />
              <span>Semhas</span>
            </div>
            <div className="login__mini-board login__mini-board--3">
              <Sparkles size={14} />
              <span>Ulang Tahun</span>
            </div>
          </div>
        </div>

        {/* Right Panel – Form */}
        <div className="login__form-panel">
          <div className="login__form-card">
            {/* Tab Toggle */}
            <div className="login__tabs">
              <button
                className={`login__tab ${mode === 'login' ? 'login__tab--active' : ''}`}
                onClick={() => setMode('login')}
              >
                Masuk
              </button>
              <button
                className={`login__tab ${mode === 'register' ? 'login__tab--active' : ''}`}
                onClick={() => setMode('register')}
              >
                Daftar
              </button>
            </div>

            <div className="login__form-header">
              <h1 className="login__form-title">
                {mode === 'login' ? 'Selamat Datang' : 'Buat Akun Baru'}
              </h1>
              <p className="login__form-subtitle">
                {mode === 'login'
                  ? 'Masuk untuk mulai menyewa papan akrilik impianmu'
                  : 'Daftar gratis dan nikmati kemudahan sewa papan akrilik'}
              </p>
            </div>

            {/* Google Sign-In Button */}
            <button
              className={`login__google-btn ${googleLoading ? 'login__google-btn--loading' : ''}`}
              onClick={handleGoogle}
              disabled={googleLoading}
              id="btn-google-signin"
            >
              {googleLoading ? (
                <span className="login__spinner" />
              ) : (
                <svg className="login__google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span>
                {googleLoading
                  ? 'Menghubungkan ke Google...'
                  : `${mode === 'login' ? 'Masuk' : 'Daftar'} dengan Gmail`}
              </span>
            </button>

            <div className="login__divider">
              <span>atau gunakan email</span>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="login__form" noValidate>
              {mode === 'register' && (
                <div className="login__field">
                  <label htmlFor="login-name" className="input-label">
                    Nama Lengkap
                  </label>
                  <div className="login__input-wrapper">
                    <User size={16} className="login__input-icon" />
                    <input
                      id="login-name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap"
                      className="input-field login__input"
                      required={mode === 'register'}
                    />
                  </div>
                </div>
              )}

              <div className="login__field">
                <label htmlFor="login-email" className="input-label">
                  Alamat Email
                </label>
                <div className="login__input-wrapper">
                  <Mail size={16} className="login__input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="contoh@gmail.com"
                    className="input-field login__input"
                    required
                  />
                </div>
              </div>

              <div className="login__field">
                <div className="login__field-row">
                  <label htmlFor="login-password" className="input-label">
                    Kata Sandi
                  </label>
                  {mode === 'login' && (
                    <button type="button" className="login__forgot-btn">
                      Lupa kata sandi?
                    </button>
                  )}
                </div>
                <div className="login__input-wrapper">
                  <Lock size={16} className="login__input-icon" />
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimal 8 karakter"
                    className="input-field login__input login__input--pass"
                    required
                  />
                  <button
                    type="button"
                    className="login__show-pass"
                    onClick={() => setShowPass(!showPass)}
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <label className="login__agree">
                  <input type="checkbox" required />
                  <span>
                    Saya menyetujui{' '}
                    <span className="login__link">Syarat &amp; Ketentuan</span>{' '}
                    dan{' '}
                    <span className="login__link">Kebijakan Privasi</span>
                  </span>
                </label>
              )}

              <button
                type="submit"
                className={`btn btn-primary login__submit-btn ${loading ? 'login__submit-btn--loading' : ''}`}
                disabled={loading}
                id="btn-submit-login"
              >
                {loading ? (
                  <span className="login__spinner login__spinner--white" />
                ) : (
                  <>
                    {mode === 'login' ? 'Masuk Sekarang' : 'Buat Akun'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="login__switch-mode">
              {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
              <button
                className="login__link"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? 'Daftar sekarang' : 'Masuk di sini'}
              </button>
            </p>

            <div className="login__back">
              <Link to="/" className="login__back-link">
                ← Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
