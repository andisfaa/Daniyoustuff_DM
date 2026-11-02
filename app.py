from flask import (
    Flask, render_template, request, url_for,
    send_from_directory, session, jsonify, redirect
)
import os, urllib.parse

app = Flask(__name__)
app.secret_key = 'daniyoustuff-secret-2024'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_IMG_DIR = os.path.join(BASE_DIR, 'static', 'img')

# ── Product Data ──
PRODUCTS = [
    {
        'id': 'papan-bulat', 'name': 'Papan Bulat', 'category': 'Papan Bulat',
        'size': '60×60 cm', 'price': 60000, 'shape': 'round',
        'description': 'Papan bulat elegan dengan berbagai pilihan warna dekorasi. Cocok untuk momen wisuda, semhas, ulang tahun, dan acara spesial lainnya.',
        'features': ['Frame kayu premium', 'Dekorasi bunga segar', 'Custom teks & nama', 'Dapat difoto dari semua sisi'],
        'gradient': 'linear-gradient(135deg, #FFB6C1 0%, #FFDDE1 100%)',
        'images': [f'Katalog Daniyou/PAPAN BULAT/Bulat ({i}).jpeg' for i in range(1, 10)],
        'available': True, 'stock': 5,
        'variants': {
            'boardColor': ['Putih', 'Abu'],
            'decorColor': ['Pink Soft', 'Pink Merah', 'Kuning', 'Biru', 'Merah', 'Biru Hijau', 'Merah Hit', 'Biru Navy', 'Biru Elektrik'],
            'layout': ['Lurus', 'Miring']
        },
    },
    {
        'id': 'papan-kubah', 'name': 'Papan Kubah', 'category': 'Papan Kubah',
        'size': '50×70 cm', 'price': 60000, 'shape': 'dome',
        'description': 'Papan kubah unik dengan bentuk melengkung yang elegan. Tersedia dalam berbagai pilihan warna yang menawan untuk segala momen istimewamu.',
        'features': ['Bentuk kubah unik', 'Dekorasi bunga segar', 'Custom teks & nama', 'Tinggi & menawan'],
        'gradient': 'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)',
        'images': [f'Katalog Daniyou/PAPAN KUBAH/Kubah ({i}).jpeg' for i in range(1, 10)],
        'available': True, 'stock': 5,
        'variants': {
            'warna': ['Biru Navy', 'Pink Biru', 'Pink Soft', 'Kuning', 'Pink Merah', 'Biru', 'Ungu', 'Pink', 'Merah Pink', 'Biru Soft', 'Merah', 'Biru Hijau', 'Biru Pink'],
            'layout': ['Lurus', 'Miring']
        },
    },
    {
        'id': 'flowerbox', 'name': 'Flowerbox', 'category': 'Flowerbox',
        'size': 'Custom', 'price': 70000, 'shape': 'box',
        'description': 'Flowerbox eksklusif dengan bunga premium dan kotak elegan. Tersedia dalam model Portrait dan Landscape.',
        'features': ['Kotak floral premium', 'Bunga segar pilihan', 'Ribbon dekoratif', 'Cocok untuk hadiah'],
        'gradient': 'linear-gradient(135deg, #E91E8C 0%, #FF6B9D 50%, #FFB6C1 100%)',
        'images': [f'Katalog Daniyou/PAPAN FLOWERBOX/Flowerbox ({i}).jpeg' for i in range(1, 3)],
        'available': True, 'stock': 4,
        'variants': {
            'warna': ['Pink', 'Merah Pink'],
            'model': [{'name': 'Potrait', 'price': 70000}, {'name': 'Landscape', 'price': 85000}]
        },
    },
    {
        'id': 'papan-besar', 'name': 'Papan Besar', 'category': 'Papan Besar',
        'size': '80×60 cm', 'price': 100000, 'shape': 'large',
        'description': 'Papan besar premium ukuran 80×60 cm yang megah dan impactful. Sempurna untuk wisuda dan acara besar.',
        'features': ['Ukuran extra large', 'Frame premium', 'Dekorasi bunga mewah', 'Impactful & megah'],
        'gradient': 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)',
        'images': [f'Katalog Daniyou/PAPAN BESAR/Besar ({i}).jpeg' for i in range(1, 5)],
        'available': True, 'stock': 2,
        'variants': {
            'warna': ['Navy', 'Merah Hitam Putih']
        },
    },
]

# ── Helper Functions ──
def format_price(price):
    return f'Rp{price:,.0f}'.replace(',', '.')

def get_product_by_id(pid):
    return next((p for p in PRODUCTS if p['id'] == pid), None)

def generate_wa_message(cart_items=None, subtotal=0):
    """Membuat pesan WhatsApp otomatis dengan argumen yang aman."""
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
        subtotal = sum(item.get('price', 0) * item.get('qty', 1) for item in cart_items)

    message += f"Total Keseluruhan: *{format_price(subtotal)}*\n\n"
    message += "Mohon konfirmasinya ya Kak. Terima kasih!"
    return urllib.parse.quote(message)

# ── Context Processor ──
@app.context_processor
def inject_globals():
    cart = session.get('cart', [])
    cart_count = len(cart)
    cart_total = sum(item.get('price', 0) * item.get('qty', 1) for item in cart)

    def img_url(filename):
        return url_for('static', filename=f'img/{filename}')

    return dict(
        format_price=format_price,
        products=PRODUCTS,
        session=session,
        cart_count=cart_count,
        cart_total=cart_total,
        img_url=img_url,
    )

# ── Routes ──
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
    available_only = request.args.get('available') == '1'

    all_products = PRODUCTS
    categories = ['all'] + list(dict.fromkeys(p['category'] for p in PRODUCTS))

    # Filter
    filtered = list(all_products)
    if category and category != 'all':
        filtered = [p for p in filtered if p['category'] == category]
    if search:
        filtered = [p for p in filtered if search.lower() in p['name'].lower() or search.lower() in p['description'].lower()]
    if available_only:
        filtered = [p for p in filtered if p.get('available')]

    # Sort
    if sort_by == 'price_asc':
        filtered.sort(key=lambda p: p['price'])
    elif sort_by == 'price_desc':
        filtered.sort(key=lambda p: p['price'], reverse=True)

    return render_template(
        'catalog.html',
        products=filtered,
        all_products=all_products,
        categories=categories,
        category=category,
        search=search,
        sort_by=sort_by,
        available_only=available_only,
    )

@app.route('/product/<pid>')
def product_detail(pid):
    product = get_product_by_id(pid)
    if not product:
        return redirect(url_for('catalog'))
    related = [p for p in PRODUCTS if p['id'] != pid][:3]
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

    product_id = data.get('product_id')
    product = get_product_by_id(product_id)
    if not product:
        return jsonify({'success': False, 'message': 'Produk tidak ditemukan'}), 404

    price = data.get('price', product['price'])
    options = data.get('options', {})

    # Ambil gambar pertama sebagai thumbnail
    image = product['images'][0] if product.get('images') else ''

    cart = session.get('cart', [])
    cart.append({
        'id': product['id'],
        'name': product['name'],
        'price': price,
        'qty': 1,
        'options': options,
        'image': image,
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

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Placeholder login sederhana
        username = request.form.get('username', '')
        password = request.form.get('password', '')
        if username and password:
            session['user'] = username
            return redirect(url_for('home'))
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('home'))

@app.route('/track')
def track():
    return render_template('order_tracking.html')

if __name__ == '__main__':
    app.run(debug=True)
