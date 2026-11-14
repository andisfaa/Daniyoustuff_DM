import json
import os
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponseForbidden, Http404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.utils.text import slugify
from django.utils import timezone
from django.db.models import Sum, Count, Q
from django.conf import settings

from .models import (
    Product, ProductImage, ProductVariant,
    Order, OrderItem, UserProfile,
    Testimonial, GalleryItem,
    Article, ArticleTag
)


def staff_required(view_func):
    """Decorator untuk memastikan hanya admin / staff yang bisa mengakses."""
    @login_required(login_url='login')
    def _wrapped(request, *args, **kwargs):
        if not request.user.is_staff:
            messages.error(request, "Akses ditolak. Halaman ini hanya untuk Administrator.")
            return redirect('home')
        return view_func(request, *args, **kwargs)
    return _wrapped


@staff_required
def admin_dashboard(request):
    """Dashboard Admin utama berbasis tema website DaniyouStuff.co."""
    tab = request.GET.get('tab', 'ringkasan').lower()
    q = request.GET.get('q', '').strip()
    status_filter = request.GET.get('status', '').strip()

    # ── METRIK / KPI RINGKASAN ────────────────────────────────
    total_orders = Order.objects.count()
    pending_orders = Order.objects.filter(status='pending').count()
    confirmed_orders = Order.objects.filter(status__in=['confirmed', 'processing', 'ready', 'delivered']).count()
    completed_orders = Order.objects.filter(status='completed').count()
    total_revenue = Order.objects.filter(status__in=['confirmed', 'processing', 'ready', 'delivered', 'completed']).aggregate(
        total=Sum('subtotal')
    )['total'] or 0

    total_products = Product.objects.count()
    active_products = Product.objects.filter(available=True).count()
    total_articles = Article.objects.count()
    published_articles = Article.objects.filter(status='published').count()
    total_testimonials = Testimonial.objects.count()
    total_gallery = GalleryItem.objects.count()
    total_users = User.objects.count()

    context = {
        'active_tab': tab,
        'q': q,
        'status_filter': status_filter,
        # KPI Stats
        'total_orders': total_orders,
        'pending_orders': pending_orders,
        'confirmed_orders': confirmed_orders,
        'completed_orders': completed_orders,
        'total_revenue': total_revenue,
        'total_products': total_products,
        'active_products': active_products,
        'total_articles': total_articles,
        'published_articles': published_articles,
        'total_testimonials': total_testimonials,
        'total_gallery': total_gallery,
        'total_users': total_users,
        'recent_orders': Order.objects.all().order_by('-created_at')[:8],
        'recent_articles': Article.objects.all().order_by('-created_at')[:5],
    }

    # ── TAB: PESANAN ──────────────────────────────────────────
    if tab == 'pesanan':
        orders_qs = Order.objects.all().prefetch_related('items', 'user').order_by('-created_at')
        if status_filter:
            orders_qs = orders_qs.filter(status=status_filter)
        if q:
            orders_qs = orders_qs.filter(
                Q(order_code__icontains=q) |
                Q(customer_name__icontains=q) |
                Q(customer_phone__icontains=q)
            )
        context['orders'] = orders_qs
        context['status_choices'] = Order.STATUS_CHOICES

    # ── TAB: PRODUK ───────────────────────────────────────────
    elif tab == 'produk':
        products_qs = Product.objects.all().prefetch_related('images').order_by('-id')
        if q:
            products_qs = products_qs.filter(
                Q(name__icontains=q) |
                Q(category__icontains=q) |
                Q(id_slug__icontains=q)
            )
        context['products'] = products_qs
        context['shape_choices'] = Product.SHAPE_CHOICES

    # ── TAB: ARTIKEL ──────────────────────────────────────────
    elif tab == 'artikel':
        articles_qs = Article.objects.all().prefetch_related('tags', 'author').order_by('-created_at')
        if status_filter:
            articles_qs = articles_qs.filter(status=status_filter)
        if q:
            articles_qs = articles_qs.filter(
                Q(title__icontains=q) |
                Q(summary__icontains=q) |
                Q(tags__name__icontains=q)
            ).distinct()
        context['articles'] = articles_qs
        context['all_tags'] = ArticleTag.objects.all().order_by('name')
        context['article_status_choices'] = Article.STATUS_CHOICES

    # ── TAB: TESTIMONI ────────────────────────────────────────
    elif tab == 'testimoni':
        testimonials_qs = Testimonial.objects.all().order_by('order', '-created_at')
        if q:
            testimonials_qs = testimonials_qs.filter(
                Q(name__icontains=q) | Q(event__icontains=q) | Q(text__icontains=q)
            )
        context['testimonials'] = testimonials_qs

    # ── TAB: GALERI ───────────────────────────────────────────
    elif tab == 'galeri':
        gallery_qs = GalleryItem.objects.all().order_by('order', '-created_at')
        if status_filter:
            gallery_qs = gallery_qs.filter(category=status_filter)
        if q:
            gallery_qs = gallery_qs.filter(Q(title__icontains=q) | Q(category__icontains=q))
        context['gallery_items'] = gallery_qs
        context['gallery_categories'] = GalleryItem.CATEGORY_CHOICES

    # ── TAB: PENGGUNA ─────────────────────────────────────────
    elif tab == 'pengguna':
        users_qs = User.objects.all().select_related('profile').order_by('-date_joined')
        if q:
            users_qs = users_qs.filter(
                Q(username__icontains=q) |
                Q(email__icontains=q) |
                Q(first_name__icontains=q) |
                Q(profile__phone_number__icontains=q)
            )
        context['users_list'] = users_qs

    return render(request, 'admin_dashboard.html', context)


# ─────────────────────────────────────────────────────────────
#  AKSI PESANAN
# ─────────────────────────────────────────────────────────────

@staff_required
def admin_order_update_status(request, order_id):
    """Update status pesanan dan catatan admin."""
    if request.method == 'POST':
        order = get_object_or_404(Order, id=order_id)
        new_status = request.POST.get('status', '').strip()
        admin_notes = request.POST.get('admin_notes', '').strip()

        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
        if admin_notes:
            order.admin_notes = admin_notes
        order.save()

        messages.success(request, f"Status pesanan {order.order_code} berhasil diubah menjadi: {order.get_status_display()}.")
    return redirect(f"/admin-dashboard/?tab=pesanan")


# ─────────────────────────────────────────────────────────────
#  AKSI ARTIKEL
# ─────────────────────────────────────────────────────────────

@staff_required
def admin_article_save(request):
    """Tambah atau edit artikel dari website."""
    if request.method == 'POST':
        article_id = request.POST.get('article_id', '').strip()
        title = request.POST.get('title', '').strip()
        slug = request.POST.get('slug', '').strip()
        summary = request.POST.get('summary', '').strip()
        content = request.POST.get('content', '').strip()
        status = request.POST.get('status', 'draft').strip()
        published_at_str = request.POST.get('published_at', '').strip()
        tags_input = request.POST.get('tags_input', '').strip()

        if not title:
            messages.error(request, "Judul artikel wajib diisi.")
            return redirect('/admin-dashboard/?tab=artikel')

        # Generate slug jika kosong
        if not slug:
            slug = slugify(title)

        # Pastikan slug unik jika baru
        if article_id:
            article = get_object_or_404(Article, id=article_id)
            if Article.objects.filter(slug=slug).exclude(id=article.id).exists():
                slug = f"{slug}-{article.id}"
        else:
            base_slug = slug
            counter = 1
            while Article.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            article = Article(author=request.user)

        article.title = title
        article.slug = slug
        article.summary = summary
        article.content = content
        article.status = status

        if published_at_str:
            try:
                article.published_at = timezone.datetime.fromisoformat(published_at_str)
            except Exception:
                pass
        elif status == 'published' and not article.published_at:
            article.published_at = timezone.now()

        # Handle Thumbnail file upload
        if 'thumbnail' in request.FILES:
            article.thumbnail = request.FILES['thumbnail']

        article.save()

        # Handle Tags
        if tags_input:
            tag_names = [t.strip() for t in tags_input.split(',') if t.strip()]
            tag_objs = []
            for name in tag_names:
                t_slug = slugify(name)
                tag_obj, _ = ArticleTag.objects.get_or_create(slug=t_slug, defaults={'name': name})
                tag_objs.append(tag_obj)
            article.tags.set(tag_objs)
        else:
            selected_tag_ids = request.POST.getlist('tags')
            if selected_tag_ids:
                article.tags.set(selected_tag_ids)

        action_word = "diperbarui" if article_id else "diterbitkan / disimpan"
        messages.success(request, f"Artikel '{article.title}' berhasil {action_word}!")

    return redirect('/admin-dashboard/?tab=artikel')


@staff_required
def admin_article_delete(request, article_id):
    """Hapus artikel."""
    if request.method == 'POST':
        article = get_object_or_404(Article, id=article_id)
        title = article.title
        article.delete()
        messages.success(request, f"Artikel '{title}' berhasil dihapus.")
    return redirect('/admin-dashboard/?tab=artikel')


# ─────────────────────────────────────────────────────────────
#  AKSI PRODUK (TAMBAH, EDIT, TOGGLE, HAPUS)
# ─────────────────────────────────────────────────────────────

@staff_required
def admin_product_save(request):
    """Tambah atau edit produk lengkap dengan ImageField dan checkbox ketersediaan."""
    if request.method == 'POST':
        product_id = request.POST.get('product_id', '').strip()
        name = request.POST.get('name', '').strip()
        category = request.POST.get('category', '').strip()
        size = request.POST.get('size', '').strip()
        price = request.POST.get('price', '0').strip()
        shape = request.POST.get('shape', 'round').strip()
        stock = request.POST.get('stock', '10').strip()
        description = request.POST.get('description', '').strip()
        gradient = request.POST.get('gradient', 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)').strip()

        if not name:
            messages.error(request, "Nama produk wajib diisi.")
            return redirect('/admin-dashboard/?tab=produk')

        try:
            price_val = int(price)
            stock_val = int(stock)
        except ValueError:
            price_val = 50000
            stock_val = 10

        if product_id:
            product = get_object_or_404(Product, id=product_id)
            is_new = False
        else:
            id_slug = slugify(name)
            base_slug = id_slug
            c = 1
            while Product.objects.filter(id_slug=id_slug).exists():
                id_slug = f"{base_slug}-{c}"
                c += 1
            product = Product(id_slug=id_slug, available=True)
            is_new = True

        product.name = name
        product.category = category or 'Papan Akrilik'
        product.size = size or 'Diameter 40cm'
        product.price = price_val
        product.shape = shape
        product.stock = stock_val
        product.description = description
        product.gradient = gradient
        # Ketersediaan tidak ditimpa di form modal (dikelola langsung melalui tombol di tabel produk)

        # Handle foto langsung ke ImageField produk
        if 'image' in request.FILES:
            product.image = request.FILES['image']
            product.save()

            # Juga simpan referensi ke ProductImage jika diperlukan
            if product.image:
                ProductImage.objects.create(
                    product=product,
                    image=product.image,
                    path=product.image.url,
                    order=0
                )
        else:
            product.save()

        action_word = "ditambahkan" if is_new else "diperbarui"
        messages.success(request, f"Produk '{product.name}' berhasil {action_word}!")

    return redirect('/admin-dashboard/?tab=produk')


@staff_required
def admin_product_toggle(request, product_id):
    """Toggle ketersediaan produk (Tersedia / Habis)."""
    if request.method == 'POST':
        product = get_object_or_404(Product, id=product_id)
        product.available = not product.available
        product.save()
        status_txt = "Tersedia" if product.available else "Tidak Tersedia"
        messages.success(request, f"Status produk '{product.name}' diubah menjadi: {status_txt}.")
    return redirect('/admin-dashboard/?tab=produk')


@staff_required
def admin_product_delete(request, product_id):
    """Hapus produk."""
    if request.method == 'POST':
        product = get_object_or_404(Product, id=product_id)
        name = product.name
        product.delete()
        messages.success(request, f"Produk '{name}' berhasil dihapus.")
    return redirect('/admin-dashboard/?tab=produk')


# ─────────────────────────────────────────────────────────────
#  AKSI TESTIMONI (TAMBAH, EDIT, TOGGLE STATUS, HAPUS)
# ─────────────────────────────────────────────────────────────

@staff_required
def admin_testimonial_save(request):
    """Tambah atau edit testimoni pelanggan."""
    if request.method == 'POST':
        item_id = request.POST.get('item_id', '').strip()
        name = request.POST.get('name', '').strip()
        event = request.POST.get('event', '').strip()
        text = request.POST.get('text', '').strip()
        rating = int(request.POST.get('rating', '5'))
        avatar_color = request.POST.get('avatar_color', '#715330').strip()
        is_active = ('is_active' in request.POST)
        order = int(request.POST.get('order', '0'))

        if item_id:
            item = get_object_or_404(Testimonial, id=item_id)
            is_new = False
        else:
            item = Testimonial()
            is_new = True

        item.name = name
        item.event = event
        item.text = text
        item.rating = rating
        item.avatar_color = avatar_color
        item.is_active = is_active
        item.order = order
        item.save()

        action_word = "ditambahkan" if is_new else "diperbarui"
        messages.success(request, f"Testimoni dari '{item.name}' berhasil {action_word}!")
    return redirect('/admin-dashboard/?tab=testimoni')


@staff_required
def admin_testimonial_toggle(request, item_id):
    """Toggle status tampilkan/sembunyikan testimoni."""
    if request.method == 'POST':
        item = get_object_or_404(Testimonial, id=item_id)
        item.is_active = not item.is_active
        item.save()
        status_txt = "Ditampilkan di website" if item.is_active else "Disembunyikan dari website"
        messages.success(request, f"Status testimoni '{item.name}' diubah: {status_txt}.")
    return redirect('/admin-dashboard/?tab=testimoni')


@staff_required
def admin_testimonial_delete(request, item_id):
    """Hapus testimoni."""
    if request.method == 'POST':
        item = get_object_or_404(Testimonial, id=item_id)
        name = item.name
        item.delete()
        messages.success(request, f"Testimoni '{name}' berhasil dihapus.")
    return redirect('/admin-dashboard/?tab=testimoni')


# ─────────────────────────────────────────────────────────────
#  AKSI GALERI FOTO (TAMBAH, EDIT, TOGGLE STATUS, HAPUS)
# ─────────────────────────────────────────────────────────────

@staff_required
def admin_gallery_save(request):
    """Upload foto baru atau edit foto galeri (ImageField)."""
    if request.method == 'POST':
        item_id = request.POST.get('item_id', '').strip()
        title = request.POST.get('title', 'Papan Akrilik').strip()
        category = request.POST.get('category', 'Papan Bulat').strip()
        order = int(request.POST.get('order', '0'))
        is_active = ('is_active' in request.POST)

        if item_id:
            item = get_object_or_404(GalleryItem, id=item_id)
            is_new = False
        else:
            item = GalleryItem()
            is_new = True

        item.title = title
        item.category = category
        item.order = order
        item.is_active = is_active

        if 'image' in request.FILES:
            item.image = request.FILES['image']

        item.save()
        action_word = "ditambahkan" if is_new else "diperbarui"
        messages.success(request, f"Foto galeri '{item.title}' berhasil {action_word}!")
    return redirect('/admin-dashboard/?tab=galeri')


@staff_required
def admin_gallery_toggle(request, item_id):
    """Toggle status tampil/sembunyi item galeri."""
    if request.method == 'POST':
        item = get_object_or_404(GalleryItem, id=item_id)
        item.is_active = not item.is_active
        item.save()
        status_txt = "Ditampilkan di galeri" if item.is_active else "Disembunyikan dari galeri"
        messages.success(request, f"Status foto galeri '{item.title}' diubah: {status_txt}.")
    return redirect('/admin-dashboard/?tab=galeri')


@staff_required
def admin_gallery_delete(request, item_id):
    """Hapus item foto galeri."""
    if request.method == 'POST':
        item = get_object_or_404(GalleryItem, id=item_id)
        title = item.title
        item.delete()
        messages.success(request, f"Foto galeri '{title}' berhasil dihapus.")
    return redirect('/admin-dashboard/?tab=galeri')


# ─────────────────────────────────────────────────────────────
#  AKSI PENGGUNA (TAMBAH USER/ADMIN & HAPUS PENGGUNA)
# ─────────────────────────────────────────────────────────────

def superuser_required(view_func):
    """Decorator untuk memastikan hanya Superuser yang dapat mengakses."""
    @login_required(login_url='login')
    def _wrapped(request, *args, **kwargs):
        if not request.user.is_superuser:
            messages.error(request, "Akses ditolak. Fitur ini hanya dapat diakses oleh Superuser.")
            return redirect('/admin-dashboard/?tab=pengguna')
        return view_func(request, *args, **kwargs)
    return _wrapped


@superuser_required
def admin_user_save(request):
    """Tambah pengguna atau admin baru (Khusus Superuser)."""
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        full_name = request.POST.get('full_name', '').strip()
        password = request.POST.get('password', '').strip()
        phone_number = request.POST.get('phone_number', '').strip()
        role = request.POST.get('role', 'staff').strip()  # 'customer', 'staff', 'superuser'

        if not username:
            messages.error(request, "Username wajib diisi.")
            return redirect('/admin-dashboard/?tab=pengguna')

        if not password or len(password) < 6:
            messages.error(request, "Password minimal 6 karakter.")
            return redirect('/admin-dashboard/?tab=pengguna')

        if User.objects.filter(username=username).exists():
            messages.error(request, f"Username '{username}' sudah digunakan. Silakan pilih username lain.")
            return redirect('/admin-dashboard/?tab=pengguna')

        if email and User.objects.filter(email=email).exists():
            messages.error(request, f"Email '{email}' sudah terdaftar. Silakan gunakan email lain.")
            return redirect('/admin-dashboard/?tab=pengguna')

        # Buat user baru
        new_user = User(username=username, email=email)
        if full_name:
            names = full_name.split(' ', 1)
            new_user.first_name = names[0]
            if len(names) > 1:
                new_user.last_name = names[1]

        new_user.set_password(password)

        if role == 'superuser':
            new_user.is_staff = True
            new_user.is_superuser = True
            role_label = "Superadmin"
        elif role == 'staff':
            new_user.is_staff = True
            new_user.is_superuser = False
            role_label = "Admin"
        else:
            new_user.is_staff = False
            new_user.is_superuser = False
            role_label = "Pelanggan"

        new_user.save()

        # Update nomor telepon di UserProfile
        if phone_number:
            profile, _ = UserProfile.objects.get_or_create(user=new_user)
            profile.phone_number = phone_number
            profile.save()

        messages.success(request, f"Akun '{new_user.username}' berhasil dibuat dengan role: {role_label}!")

    return redirect('/admin-dashboard/?tab=pengguna')


@superuser_required
def admin_user_delete(request, user_id):
    """Hapus akun pengguna dari sistem."""
    if request.method == 'POST':
        target_user = get_object_or_404(User, id=user_id)

        # Cek jangan sampai menghapus akun sendiri
        if target_user.id == request.user.id:
            messages.error(request, "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.")
            return redirect('/admin-dashboard/?tab=pengguna')

        # Cek jika satu-satunya superuser
        if target_user.is_superuser and User.objects.filter(is_superuser=True).count() <= 1:
            messages.error(request, "Tidak dapat menghapus satu-satunya Superadmin dalam sistem.")
            return redirect('/admin-dashboard/?tab=pengguna')

        username = target_user.username
        target_user.delete()
        messages.success(request, f"Pengguna '{username}' berhasil dihapus dari sistem.")

    return redirect('/admin-dashboard/?tab=pengguna')
