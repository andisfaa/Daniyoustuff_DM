import urllib.parse
import json
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, FileResponse, Http404
from django.views.decorators.http import require_POST
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import os

from .models import Product, Order, OrderItem, UserProfile, Testimonial, GalleryItem, Article, ArticleTag
from django.db.models import Q
from datetime import datetime
import uuid


def format_price(price):
    return f"Rp{price:,.0f}".replace(',', '.')


def generate_wa_message(cart_items, subtotal):
    message = "Halo Kak, saya ingin memesan produk dari DaniyouStuff:\n\n"
    key_labels = {
        'boardColor': 'Warna Papan', 'decorColor': 'Warna Bunga',
        'layout': 'Layout', 'warna': 'Warna', 'model': 'Model',
        'nama': 'Nama', 'ucapan': 'Ucapan',
        'tanggal': 'Tgl Acara', 'catatan': 'Catatan',
    }
    for item in cart_items:
        name = item.get('name', 'Produk')
        price = item.get('price', 0)
        qty = item.get('qty', 1)
        options = item.get('options', {})

        message += f"• *{name}* (x{qty}) - {format_price(price * qty)}\n"
        if options:
            for k, v in options.items():
                if v:
                    label = key_labels.get(k, k)
                    message += f"  - {label}: {v}\n"
        message += "\n"

    message += f"Total Keseluruhan: *{format_price(subtotal)}*\n\n"
    message += "Mohon konfirmasinya ya Kak. Terima kasih!"
    return urllib.parse.quote(message)


def get_product_images(product):
    return list(product.images.values_list('path', flat=True))


def _build_variants(product):
    variants = {}
    for v in product.variants.all():
        if v.key not in variants:
            variants[v.key] = []
        if v.extra_price:
            variants[v.key].append({'name': v.value, 'price': product.price + v.extra_price})
        else:
            variants[v.key].append(v.value)
    return variants


def _to_product_dict(p):
    imgs = get_product_images(p)
    return {
        'id': p.id_slug,
        'pk': p.pk,
        'id_slug': p.id_slug,
        'name': p.name,
        'category': p.category,
        'size': p.size,
        'price': p.price,
        'shape': p.shape,
        'description': p.description,
        'features': p.features,
        'gradient': p.gradient,
        'available': p.available,
        'stock': p.stock,
        'images': imgs,
        'variants': _build_variants(p),
    }


def home(request):
    all_qs = Product.objects.prefetch_related('images', 'variants').filter(available=True)
    featured = [_to_product_dict(p) for p in all_qs]
    return render(request, 'index.html', {'featured': featured})


def catalog(request):
    category = request.GET.get('category', 'all')
    search = request.GET.get('search', '').strip()
    sort_by = request.GET.get('sort', 'default')
    available_only = request.GET.get('available') == '1'

    all_products_qs = Product.objects.prefetch_related('images', 'variants').all()
    qs = all_products_qs

    if category and category != 'all':
        qs = qs.filter(category=category)
    if search:
        qs = qs.filter(name__icontains=search) | qs.filter(description__icontains=search)
    if available_only:
        qs = qs.filter(available=True)

    if sort_by == 'price_asc':
        qs = qs.order_by('price')
    elif sort_by == 'price_desc':
        qs = qs.order_by('-price')

    products_data = [_to_product_dict(p) for p in qs]
    all_products_data = [_to_product_dict(p) for p in all_products_qs]

    distinct_cats = list(Product.objects.values_list('category', flat=True).distinct())
    categories = [{
        'slug': 'all',
        'name': 'Semua Produk',
        'count': all_products_qs.count()
    }]
    for cat in distinct_cats:
        categories.append({
            'slug': cat,
            'name': cat,
            'count': all_products_qs.filter(category=cat).count()
        })

    return render(request, 'catalog.html', {
        'products': products_data,
        'all_products': all_products_data,
        'categories': categories,
        'category': category,
        'search': search,
        'sort_by': sort_by,
        'available_only': available_only,
    })


def product_detail(request, pid):
    try:
        if str(pid).isdigit():
            product = Product.objects.prefetch_related('images', 'variants').get(id=int(pid))
        else:
            product = Product.objects.prefetch_related('images', 'variants').get(id_slug=pid)
    except Product.DoesNotExist:
        return redirect('catalog')

    product_data = _to_product_dict(product)
    related_qs = Product.objects.prefetch_related('images').exclude(id=product.id)[:3]
    related = [_to_product_dict(p) for p in related_qs]

    return render(request, 'product_detail.html', {
        'product': product_data,
        'related': related,
    })


def cart_view(request):
    cart_items = request.session.get('cart', [])
    subtotal = sum(item.get('price', 0) * item.get('qty', 1) for item in cart_items)
    wa_url = f"https://wa.me/6281356942724?text={generate_wa_message(cart_items, subtotal)}"
    return render(request, 'cart.html', {
        'cart_items': cart_items,
        'subtotal': subtotal,
        'wa_url': wa_url,
    })


@csrf_exempt
@require_POST
def cart_add(request):
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'success': False, 'message': 'Data tidak valid'}, status=400)

    product_id = data.get('product_id')
    try:
        if str(product_id).isdigit():
            product = Product.objects.prefetch_related('images').get(id=int(product_id))
        else:
            product = Product.objects.prefetch_related('images').get(id_slug=product_id)
    except Product.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Produk tidak ditemukan'}, status=404)

    price = data.get('price', product.price)
    options = data.get('options', {})
    imgs = get_product_images(product)
    image = imgs[0] if imgs else ''

    direct_checkout = data.get('direct', False)
    item_data = {
        'id': product.id_slug,
        'name': product.name,
        'price': price,
        'qty': 1,
        'options': options,
        'image': image,
    }

    if direct_checkout:
        request.session['cart'] = [item_data]
    else:
        cart = request.session.get('cart', [])
        cart.append(item_data)
        request.session['cart'] = cart

    request.session.modified = True

    return JsonResponse({
        'success': True,
        'count': len(request.session['cart']),
        'redirect_url': '/checkout/' if direct_checkout else None
    })


@csrf_exempt
@require_POST
def cart_remove(request):
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'success': False}, status=400)

    idx = data.get('index')
    cart = request.session.get('cart', [])

    if idx is not None and 0 <= int(idx) < len(cart):
        cart.pop(int(idx))
        request.session['cart'] = cart
        request.session.modified = True
        return JsonResponse({'success': True, 'count': len(cart)})

    return JsonResponse({'success': False, 'message': 'Index tidak valid'}, status=400)


@csrf_exempt
@require_POST
def cart_clear(request):
    request.session['cart'] = []
    request.session.modified = True
    return JsonResponse({'success': True})


def about(request):
    # Ambil foto galeri dari database
    gallery_qs = GalleryItem.objects.filter(is_active=True).order_by('order', '-created_at')
    if gallery_qs.exists():
        gallery_images = [{
            'product': g.category,
            'title': g.title,
            'src': g.get_src()
        } for g in gallery_qs]
    else:
        # Fallback jika belum ada data gallery
        products = Product.objects.prefetch_related('images').all()
        gallery_images = []
        for p in products:
            for img in p.images.all():
                gallery_images.append({
                    'product': p.name,
                    'title': p.name,
                    'src': img.path
                })

    # Ambil testimoni dari database
    testimonials_qs = Testimonial.objects.filter(is_active=True).order_by('order', '-created_at')
    if testimonials_qs.exists():
        testimonials = testimonials_qs
    else:
        testimonials = [
            {'name': 'Aliya Putri', 'event': 'Wisuda S1 UNHAS 2024', 'text': 'Papan bulat pinknya cantik banget! Semua foto jadi aesthetic. Highly recommend!', 'initial': 'A', 'color': '#FFB6C1', 'rating': 5},
            {'name': 'Rizky Amalia', 'event': 'Seminar Hasil UMI 2024', 'text': 'Pelayanan ramah dan profesional. Papan kubahnya elegan, antar tepat waktu. Puas!', 'initial': 'R', 'color': '#1565C0', 'rating': 5},
            {'name': 'Siti Nurhaliza', 'event': 'Ulang Tahun ke-22', 'text': 'Flowerboxnya BAGUS BANGET! Teman-teman langsung tanya sewa di mana haha.', 'initial': 'S', 'color': '#E91E8C', 'rating': 5},
            {'name': 'Farhan Maulana', 'event': 'Wisuda S2 UNM 2024', 'text': 'Papan besar navy-nya megah. Foto bareng keluarga jadi sangat berkesan. Terima kasih!', 'initial': 'F', 'color': '#0D47A1', 'rating': 5},
        ]

    return render(request, 'about.html', {
        'gallery_images': gallery_images,
        'testimonials': testimonials
    })


def login_view(request):
    error = None
    tab = 'masuk'
    next_url = request.GET.get('next') or request.POST.get('next') or ''

    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '').strip()

        # Coba autentikasi via username atau email
        user = authenticate(request, username=email, password=password)
        if not user:
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        if user:
            auth_login(request, user)
            return redirect(next_url or 'home')
        else:
            error = 'Email atau password salah.'

    return render(request, 'login.html', {'error': error, 'tab': tab, 'form': {}, 'next_url': next_url})


def register_view(request):
    error = None
    tab = 'daftar'
    next_url = request.GET.get('next') or request.POST.get('next') or ''

    if request.method == 'POST':
        nama = request.POST.get('nama', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '').strip()
        no_wa = request.POST.get('no_wa', '').strip()

        if not email or not password:
            error = 'Email dan password wajib diisi.'
        elif User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
            error = 'Email sudah terdaftar. Silakan masuk.'
        else:
            user = User.objects.create_user(username=email, email=email, password=password, first_name=nama)
            if hasattr(user, 'profile'):
                user.profile.phone_number = no_wa
                user.profile.save()
            else:
                UserProfile.objects.create(user=user, phone_number=no_wa)
            auth_login(request, user)
            return redirect(next_url or 'home')

    return render(request, 'login.html', {
        'error': error,
        'tab': tab,
        'form': {'nama': request.POST.get('nama', ''), 'email': request.POST.get('email', ''), 'no_wa': request.POST.get('no_wa', '')},
        'next_url': next_url
    })


def logout_view(request):
    auth_logout(request)
    return redirect('home')


@login_required
def akun_view(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    user_orders = Order.objects.filter(user=request.user).prefetch_related('items').order_by('-created_at')
    updated = request.GET.get('updated') == '1'
    return render(request, 'akun.html', {
        'profile': profile,
        'user_orders': user_orders,
        'updated': updated,
    })


@login_required
@require_POST
def profile_update_view(request):
    nama = request.POST.get('nama', '').strip()
    telepon = request.POST.get('telepon', '').strip()
    alamat = request.POST.get('alamat', '').strip()

    if nama:
        request.user.first_name = nama
        request.user.save()

    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    profile.phone_number = telepon
    profile.address = alamat
    profile.save()

    return redirect('/akun/?updated=1')


def checkout_view(request):
    if not request.user.is_authenticated:
        return redirect('/login/?next=/checkout/')

    cart_items = request.session.get('cart', [])
    if not cart_items:
        return redirect('cart')

    items_subtotal = sum(item.get('price', 0) * item.get('qty', 1) for item in cart_items)
    user = request.user if request.user.is_authenticated else None
    profile = None
    if user:
        profile, _ = UserProfile.objects.get_or_create(user=user)

    error = None

    if request.method == 'POST':
        customer_name = request.POST.get('customer_name', '').strip()
        customer_phone = request.POST.get('customer_phone', '').strip()
        delivery_method = request.POST.get('delivery_method', 'courier').strip()
        customer_address = request.POST.get('customer_address', '').strip()
        event_date_str = request.POST.get('event_date', '').strip()
        notes = request.POST.get('notes', '').strip()
        payment_proof = request.FILES.get('payment_proof')

        # Ongkir: Kurir Rp15.000, Ambil Sendiri Rp0
        shipping_fee = 15000 if delivery_method == 'courier' else 0
        total_subtotal = items_subtotal + shipping_fee

        if not customer_name or not customer_phone:
            error = 'Nama pemesan dan No. WhatsApp wajib diisi.'
        elif not event_date_str:
            error = 'Tanggal acara wajib dipilih/diisi.'
        elif delivery_method == 'courier' and not customer_address:
            error = 'Alamat pengantaran wajib diisi jika memilih opsi Diantar via Kurir.'
        elif not payment_proof:
            error = 'Silakan unggah foto/screenshot bukti transfer QRIS terlebih dahulu.'
        else:
            event_date = None
            try:
                event_date = datetime.strptime(event_date_str, '%Y-%m-%d').date()
            except ValueError:
                event_date = None

            if delivery_method == 'pickup' and not customer_address:
                customer_address = 'Ambil Sendiri di Studio Daniyou'

            # Generate unique order code: DNY-YYMMDD-XXXX
            today_str = datetime.now().strftime('%y%m%d')
            rand_code = uuid.uuid4().hex[:4].upper()
            order_code = f"DNY-{today_str}-{rand_code}"

            order = Order.objects.create(
                order_code=order_code,
                user=user,
                customer_name=customer_name,
                customer_phone=customer_phone,
                delivery_method=delivery_method,
                shipping_fee=shipping_fee,
                customer_address=customer_address,
                event_date=event_date,
                notes=notes,
                subtotal=total_subtotal,
                status='pending',
                payment_method='qris',
                payment_proof=payment_proof,
            )

            # Buat item pesanan
            for item in cart_items:
                product_obj = None
                p_id = item.get('id')
                if p_id:
                    try:
                        if str(p_id).isdigit():
                            product_obj = Product.objects.get(id=int(p_id))
                        else:
                            product_obj = Product.objects.get(id_slug=p_id)
                    except Product.DoesNotExist:
                        product_obj = None

                OrderItem.objects.create(
                    order=order,
                    product=product_obj,
                    product_name=item.get('name', 'Produk'),
                    price=item.get('price', 0),
                    qty=item.get('qty', 1),
                    options=item.get('options', {}),
                    image=item.get('image', ''),
                )

            # Jika user sedang login & profilnya belum lengkap, simpan data terbarunya
            if user and profile:
                if not profile.phone_number:
                    profile.phone_number = customer_phone
                if not profile.address and customer_address and delivery_method == 'courier':
                    profile.address = customer_address
                profile.save()

            # Bersihkan session keranjang
            request.session['cart'] = []
            request.session.modified = True

            return redirect('order_detail', order_code=order.order_code)

    initial_data = {
        'name': (user.first_name if user and user.first_name else (user.username if user else '')) or '',
        'phone': (profile.phone_number if profile else '') or '',
        'address': (profile.address if profile else '') or '',
        'delivery_method': 'courier',
        'event_date': '',
        'notes': '',
    }

    # Pre-populate tanggal acara & catatan kustom jika ada dari pilihan produk
    if cart_items:
        notes_parts = []
        for itm in cart_items:
            opts = itm.get('options', {})
            if opts.get('tanggal') and not initial_data['event_date']:
                initial_data['event_date'] = opts.get('tanggal')
            p_name = itm.get('name', 'Produk')
            item_details = []
            if opts.get('nama'):
                item_details.append(f"Nama di papan: {opts['nama']}")
            if opts.get('ucapan'):
                item_details.append(f"Ucapan: {opts['ucapan']}")
            if opts.get('boardColor'):
                item_details.append(f"Papan: {opts['boardColor']}")
            if opts.get('decorColor'):
                item_details.append(f"Bunga: {opts['decorColor']}")
            if opts.get('layout'):
                item_details.append(f"Layout: {opts['layout']}")
            if opts.get('catatan'):
                item_details.append(f"Ket: {opts['catatan']}")
            if item_details:
                notes_parts.append(f"[{p_name}] " + ", ".join(item_details))
        if notes_parts:
            initial_data['notes'] = "\n".join(notes_parts)

    initial_shipping = 15000
    initial_total = items_subtotal + initial_shipping

    return render(request, 'checkout.html', {
        'cart_items': cart_items,
        'items_subtotal': items_subtotal,
        'shipping_fee': initial_shipping,
        'total': initial_total,
        'subtotal': initial_total,  # backward compatibility
        'initial': initial_data,
        'error': error,
    })


def direct_checkout_view(request, pid):
    """Langsung set item ini ke checkout tanpa lewat keranjang"""
    try:
        if str(pid).isdigit():
            product = Product.objects.prefetch_related('images').get(id=int(pid))
        else:
            product = Product.objects.prefetch_related('images').get(id_slug=pid)
    except Product.DoesNotExist:
        return redirect('catalog')

    imgs = get_product_images(product)
    image = imgs[0] if imgs else ''

    request.session['cart'] = [{
        'id': product.id_slug,
        'name': product.name,
        'price': product.price,
        'qty': 1,
        'options': {},
        'image': image,
    }]
    request.session.modified = True
    return redirect('checkout')


def order_detail_view(request, order_code):
    try:
        order = Order.objects.prefetch_related('items').get(order_code=order_code.upper())
    except Order.DoesNotExist:
        return redirect('track')

    return render(request, 'order_detail.html', {'order': order})


def admin_dashboard(request):
    return redirect('/admin/')


def track(request):
    order = None
    error = None
    if request.method == 'POST' or request.GET.get('code'):
        code = request.POST.get('order_code', '') or request.GET.get('code', '')
        if code:
            try:
                order = Order.objects.prefetch_related('items').get(order_code=code.upper())
            except Order.DoesNotExist:
                error = f'Kode pesanan "{code}" tidak ditemukan.'
    return render(request, 'order_tracking.html', {'order': order, 'error': error})


def serve_img(request, filename):
    filepath = os.path.join(settings.BASE_DIR, 'static', 'img', filename)
    if os.path.exists(filepath):
        return FileResponse(open(filepath, 'rb'))
    raise Http404


# ─────────────────────────────────────────────────────────────
#  ARTIKEL / BLOG VIEWS
# ─────────────────────────────────────────────────────────────

def article_list(request):
    """Halaman daftar artikel yang sudah published."""
    from django.utils import timezone
    tag_slug = request.GET.get('tag', '')

    articles = Article.objects.filter(
        status='published'
    ).filter(
        Q(published_at__isnull=True) | Q(published_at__lte=timezone.now())
    ).prefetch_related('tags', 'author').order_by('-published_at', '-created_at')

    # Semua tag yang dipakai artikel live
    tags = ArticleTag.objects.filter(articles__in=articles).distinct().order_by('name')

    # Filter berdasarkan tag yang dipilih
    active_tag = None
    if tag_slug:
        articles = articles.filter(tags__slug=tag_slug)
        active_tag = ArticleTag.objects.filter(slug=tag_slug).first()

    return render(request, 'articles/article_list.html', {
        'articles': articles,
        'tags': tags,
        'active_tag': active_tag,
    })


def article_detail(request, slug):
    """Halaman detail satu artikel."""
    from django.utils import timezone
    article = get_object_or_404(Article, slug=slug)

    # Non-staff hanya bisa lihat artikel published yang sudah waktunya
    if not request.user.is_staff:
        if article.status != 'published':
            raise Http404
        if article.published_at and article.published_at > timezone.now():
            raise Http404

    related = Article.objects.filter(
        status='published',
        tags__in=article.tags.all()
    ).exclude(id=article.id).filter(
        Q(published_at__isnull=True) | Q(published_at__lte=timezone.now())
    ).distinct()[:3]

    return render(request, 'articles/article_detail.html', {
        'article': article,
        'related': related,
    })
