from flask import (
    Flask, render_template, request, url_for,
    send_from_directory, session, jsonify, redirect, g, abort
)
import os, re, urllib.parse
from functools import wraps
import pymysql
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'ganti-ini-sebelum-online')
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_IMG_DIR = os.path.join(BASE_DIR, 'static', 'img')

# ══════════ PRODUK (dari database) ══════════
GRUP_KEY = {
    'Warna Papan': 'boardColor',
    'Warna Decor': 'decorColor',
    'Layout': 'layout',
    'Warna': 'warna',
    'Model': 'model',
}

def load_products():
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("""SELECT p.*, c.nama AS kategori
                           FROM products p JOIN categories c ON c.id = p.category_id
                           ORDER BY p.id""")
            rows = cur.fetchall()
            cur.execute("SELECT product_id, path FROM product_images ORDER BY product_id, urutan, id")
            imgs = cur.fetchall()
            cur.execute("""SELECT product_id, grup, nilai, harga_tambahan
                           FROM product_options ORDER BY product_id, id""")
            opts = cur.fetchall()
    finally:
        db.close()

    products = []
    for r in rows:
        images = [i['path'] for i in imgs if i['product_id'] == r['id']]
        variants = {}
        for o in (x for x in opts if x['product_id'] == r['id']):
            key = GRUP_KEY.get(o['grup'], o['grup'].lower().replace(' ', '_'))
            if key == 'model':
                variants.setdefault('model', []).append(
                    {'name': o['nilai'], 'price': r['harga_sewa'] + o['harga_tambahan']})
            else:
                variants.setdefault(key, []).append(o['nilai'])
        products.append({
            'db_id': r['id'],
            'id': r['slug'] or str(r['id']),
            'name': r['nama'],
            'category': r['kategori'],
            'size': r['ukuran'] or '',
            'price': r['harga_sewa'],
            'shape': r['shape'] or '',
            'description': r['deskripsi'] or '',
            'features': [f for f in (r['fitur'] or '').split('|') if f],
            'gradient': r['gradient'] or '',
            'images': images or ['LOGO DANIYOUSTUFF.CO.png'],
            'available': bool(r['aktif']),
            'stock': r['stok'],
            'variants': variants,
        })
    return products

def get_products():
    if 'products' not in g:
        g.products = load_products()
    return g.products

# ══════════ HELPER UMUM ══════════
def format_price(price):
    return f'Rp{price:,.0f}'.replace(',', '.')

def get_product_by_id(pid):
    return next((p for p in get_products() if p['id'] == pid), None)

def generate_wa_message(cart_items=None, subtotal=0):
    if cart_items is None:
        cart_items = session.get('cart', [])
    message = "Halo Kak, saya ingin memesan produk dari DaniyouStuff:\n\n"
    for item in cart_items:
        name = item.get('name', 'Produk')
        price = item.get('price', 0)
        qty = item.get('qty', 1)
        options = item.get('options', {})
        message += f"• *{name}* (x{qty}) - {format_price(price * qty)}\n"
        if options:
            for k, v in options.items():
                if v:
                    message += f"  - {k}: {v}\n"
        message += "\n"
    if not subtotal and cart_items:
        subtotal = sum(i.get('price', 0) * i.get('qty', 1) for i in cart_items)
    message += f"Total Keseluruhan: *{format_price(subtotal)}*\n\n"
    message += "Mohon konfirmasinya ya Kak. Terima kasih!"
    return urllib.parse.quote(message)

# ══════════ AUTH ══════════
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

def current_user():
    """Selalu dibaca dari DATABASE, jadi perubahan role/aktif langsung berlaku."""
    if 'cu' not in g:
        g.cu = None
        uid = session.get('user_id')
        if uid:
            db = get_db()
            try:
                with db.cursor() as cur:
                    cur.execute("SELECT id, nama, email, no_wa, role, aktif FROM users WHERE id=%s", (uid,))
                    u = cur.fetchone()
            finally:
                db.close()
            if u and u['aktif']:
                g.cu = u
            else:
                for k in ('user', 'user_id', 'role'):
                    session.pop(k, None)
    return g.cu

def start_session(uid, nama, role):
    cart = session.get('cart', [])       # keranjang tetap terbawa saat login
    session.clear()
    session['cart'] = cart
    session['user_id'] = uid
    session['user'] = {'name': nama, 'nama': nama, 'role': role}   
    session['role'] = role               # hanya tampilan; izin selalu dicek ke database

def login_required(f):
    @wraps(f)
    def wrapper(*a, **kw):
        if not current_user():
            return redirect(url_for('login', next=request.path))
        return f(*a, **kw)
    return wrapper

def admin_required(f):
    @wraps(f)
    def wrapper(*a, **kw):
        u = current_user()
        if not u:
            return redirect(url_for('login', next=request.path))
        if u['role'] != 'admin':
            abort(403)
        return f(*a, **kw)
    return wrapper

def safe_next(target):
    if target and target.startswith('/') and not target.startswith('//') and '\\' not in target:
        return target
    return url_for('home')

# ══════════ CONTEXT PROCESSOR ══════════
@app.context_processor
def inject_globals():
    cart = session.get('cart', [])
    cart_count = len(cart)
    cart_total = sum(item.get('price', 0) * item.get('qty', 1) for item in cart)

    def img_url(filename):
        return url_for('static', filename=f'img/{filename}')

    return dict(
        format_price=format_price,
        products=get_products(),
        session=session,
        cart_count=cart_count,
        cart_total=cart_total,
        img_url=img_url,
        current_user=current_user(),
    )

# ══════════ ROUTE PUBLIK (Pengunjung) ══════════
@app.route('/img/<path:filename>')
def serve_img(filename):
    return send_from_directory(STATIC_IMG_DIR, filename)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/catalog')
def catalog():
    category = request.args.get('category', 'all')
    search = request.args.get('search', '').strip()
    sort_by = request.args.get('sort', 'default')
    available_only = request.args.get('available') in ('1', 'true')

    all_products = get_products()
    categories = ['all'] + list(dict.fromkeys(p['category'] for p in all_products))

    filtered = list(all_products)
    if category and category != 'all':
        filtered = [p for p in filtered if p['category'] == category]
    if search:
        filtered = [p for p in filtered
                    if search.lower() in p['name'].lower() or search.lower() in p['description'].lower()]
    if available_only:
        filtered = [p for p in filtered if p.get('available')]

    if sort_by in ('price-asc', 'price_asc'):
        filtered.sort(key=lambda p: p['price'])
    elif sort_by in ('price-desc', 'price_desc'):
        filtered.sort(key=lambda p: p['price'], reverse=True)
    elif sort_by == 'name-asc':
        filtered.sort(key=lambda p: p['name'].lower())

    return render_template('catalog.html', products=filtered, all_products=all_products,
                           categories=categories, category=category, search=search,
                           sort_by=sort_by, available_only=available_only)

@app.route('/product/<pid>')
def product_detail(pid):
    product = get_product_by_id(pid)
    if not product:
        return redirect(url_for('catalog'))
    related = [p for p in get_products() if p['id'] != pid][:3]
    return render_template('product_detail.html', product=product, related=related)

@app.route('/cart')
def cart():
    cart_items = session.get('cart', [])
    subtotal = sum(item.get('price', 0) * item.get('qty', 1) for item in cart_items)
    wa_url = f"https://wa.me/6281356942724?text={generate_wa_message(cart_items, subtotal)}"
    return render_template('cart.html', cart_items=cart_items, subtotal=subtotal, wa_url=wa_url)

@app.route('/cart/add', methods=['POST'])
def cart_add():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'No data'}), 400
    product = get_product_by_id(data.get('product_id'))
    if not product:
        return jsonify({'success': False, 'message': 'Produk tidak ditemukan'}), 404

    allowed = {product['price']} | {m['price'] for m in product['variants'].get('model', [])}
    price = data.get('price', product['price'])
    if price not in allowed:
        price = product['price']

    cart = session.get('cart', [])
    cart.append({
        'id': product['id'], 'name': product['name'], 'price': price, 'qty': 1,
        'options': data.get('options', {}),
        'image': product['images'][0] if product.get('images') else '',
    })
    session['cart'] = cart
    session.modified = True
    return jsonify({'success': True, 'count': len(cart)})

@app.route('/cart/remove', methods=['POST'])
def cart_remove():
    data = request.get_json()
    if not data:
        return jsonify({'success': False}), 400
    idx = data.get('index')
    cart = session.get('cart', [])
    if idx is not None and 0 <= int(idx) < len(cart):
        cart.pop(int(idx))
        session['cart'] = cart
        session.modified = True
        return jsonify({'success': True, 'count': len(cart)})
    return jsonify({'success': False, 'message': 'Index tidak valid'}), 400

@app.route('/cart/clear', methods=['POST'])
def cart_clear():
    session['cart'] = []
    session.modified = True
    return jsonify({'success': True})

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/track')
def track():
    return render_template('order_tracking.html')

# ══════════ LOGIN / DAFTAR / LOGOUT ══════════
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user():
        return redirect(url_for('home'))
    error, form = None, {}
    if request.method == 'POST':
        # menerima field 'email' maupun 'username' supaya form lama tetap jalan
        ident = (request.form.get('email') or request.form.get('username') or '').strip().lower()
        password = request.form.get('password', '')
        form = {'email': ident}
        db = get_db()
        try:
            with db.cursor() as cur:
                cur.execute("SELECT id, nama, password_hash, role, aktif FROM users WHERE email=%s", (ident,))
                u = cur.fetchone()
        finally:
            db.close()

        if u and u['aktif'] and check_password_hash(u['password_hash'], password):
            start_session(u['id'], u['nama'], u['role'])
            nxt = request.args.get('next')
            if u['role'] == 'admin' and not nxt:
                return redirect(url_for('admin_dashboard'))
            return redirect(safe_next(nxt))
        error = 'Email atau password salah.'
    return render_template('login.html', tab='masuk', error_login=error, error_register=None, form=form)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user():
        return redirect(url_for('home'))
    error, form = None, {}
    if request.method == 'POST':
        nama = request.form.get('nama', '').strip()
        email = request.form.get('email', '').strip().lower()
        no_wa = request.form.get('no_wa', '').strip()
        password = request.form.get('password', '')
        form = {'nama': nama, 'email': email, 'no_wa': no_wa}

        if not nama or not EMAIL_RE.match(email):
            error = 'Nama dan email yang valid wajib diisi.'
        elif len(password) < 8:
            error = 'Password minimal 8 karakter.'
        else:
            db = get_db()
            try:
                with db.cursor() as cur:
                    cur.execute(
                        "INSERT INTO users (nama, email, password_hash, no_wa) VALUES (%s,%s,%s,%s)",
                        (nama, email, generate_password_hash(password), no_wa or None))
                    uid = cur.lastrowid
                db.commit()
            except pymysql.err.IntegrityError:
                error = 'Email sudah terdaftar.'
            finally:
                db.close()
            if not error:
                start_session(uid, nama, 'user')
                return redirect(url_for('home'))
    return render_template('login.html', tab='daftar', error_login=None, error_register=error, form=form)

@app.route('/logout')
def logout():
    for k in ('user', 'user_id', 'role'):
        session.pop(k, None)
    return redirect(url_for('home'))

# ══════════ USER (harus login) ══════════
@app.route('/akun')
@login_required
def akun():
    return render_template('akun.html')

# ══════════ ADMIN ══════════
@app.route('/admin')
@admin_required
def admin_dashboard():
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("SELECT COUNT(*) AS n FROM users WHERE role='user'")
            total_user = cur.fetchone()['n']
            cur.execute("SELECT COUNT(*) AS n FROM orders")
            total_order = cur.fetchone()['n']
            cur.execute("SELECT COUNT(*) AS n FROM orders WHERE status='menunggu'")
            order_baru = cur.fetchone()['n']
    finally:
        db.close()
    return render_template('admin/dashboard.html', total_user=total_user,
                           total_order=total_order, order_baru=order_baru)

@app.route('/admin/users')
@admin_required
def admin_users():
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("""SELECT id, nama, email, no_wa, role, aktif, created_at
                           FROM users ORDER BY id DESC""")
            users = cur.fetchall()
    finally:
        db.close()
    return render_template('admin/users.html', users=users)

@app.route('/admin/users/<int:uid>/toggle', methods=['POST'])
@admin_required
def admin_user_toggle(uid):
    if uid == current_user()['id']:
        abort(400)
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("UPDATE users SET aktif = 1 - aktif WHERE id=%s AND role='user'", (uid,))
        db.commit()
    finally:
        db.close()
    return redirect(url_for('admin_users'))

if __name__ == '__main__':
    app.run(debug=True)