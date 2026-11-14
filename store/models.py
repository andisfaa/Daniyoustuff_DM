from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import json


class UserProfile(models.Model):
    """Profil Tambahan Pengguna (Nomor HP & Alamat)"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=30, blank=True, null=True, verbose_name="Nomor WhatsApp / HP")
    address = models.TextField(blank=True, null=True, verbose_name="Alamat Lengkap")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'store_user_profile'
        verbose_name = 'Profil Pengguna'
        verbose_name_plural = 'Daftar Profil Pengguna'

    def __str__(self):
        return f"{self.user.username} ({self.phone_number or 'Belum ada nomor'})"


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        if hasattr(instance, 'profile'):
            instance.profile.save()
        else:
            UserProfile.objects.create(user=instance)


class Product(models.Model):
    """Model Produk DaniyouStuff"""
    SHAPE_CHOICES = [
        ('round', 'Bulat'),
        ('dome', 'Kubah'),
        ('box', 'Flowerbox'),
        ('large', 'Besar'),
    ]

    id_slug = models.SlugField(unique=True, max_length=50)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    size = models.CharField(max_length=50)
    price = models.IntegerField()
    shape = models.CharField(max_length=20, choices=SHAPE_CHOICES)
    description = models.TextField()
    features = models.JSONField(default=list)
    gradient = models.CharField(max_length=200)
    image = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name="Foto Utama Produk")
    available = models.BooleanField(default=True)
    stock = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'store_product'
        ordering = ['id']

    def __str__(self):
        return self.name

    def get_images(self):
        imgs = []
        if self.image:
            imgs.append(self.image.url)
        for pi in self.images.all():
            if pi.image:
                imgs.append(pi.image.url)
            elif pi.path:
                imgs.append(pi.path)
        return imgs


class ProductImage(models.Model):
    """Gambar Produk"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name="Foto Produk")
    path = models.CharField(max_length=300, blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        db_table = 'store_product_image'
        ordering = ['order']

    def __str__(self):
        return f"{self.product.name} - img {self.order}"


class ProductVariant(models.Model):
    """Varian Produk (warna, layout, model, dll)"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    key = models.CharField(max_length=50)   # contoh: 'boardColor', 'warna', 'model'
    label = models.CharField(max_length=100, blank=True)  # contoh: 'Warna Papan'
    value = models.CharField(max_length=100)  # contoh: 'Pink Soft'
    extra_price = models.IntegerField(default=0)  # harga tambahan (mis: Landscape +15000)

    class Meta:
        db_table = 'store_product_variant'

    def __str__(self):
        return f"{self.product.name} | {self.key}: {self.value}"


class Order(models.Model):
    """Pesanan / Order Pelanggan"""
    STATUS_CHOICES = [
        ('pending', 'Menunggu Verifikasi Pembayaran'),
        ('confirmed', 'Pembayaran Dikonfirmasi'),
        ('processing', 'Sedang Diproses'),
        ('ready', 'Siap Dikirim / Diambil'),
        ('delivered', 'Sedang Dikirim'),
        ('completed', 'Pesanan Selesai'),
        ('cancelled', 'Dibatalkan'),
    ]

    PAYMENT_CHOICES = [
        ('qris', 'QRIS Toko (Business Marni)'),
        ('transfer', 'Transfer Bank Manual'),
        ('whatsapp', 'Pesan via WhatsApp'),
    ]

    DELIVERY_CHOICES = [
        ('courier', 'Diantar via Kurir (Antar-Jemput)'),
        ('pickup', 'Ambil Sendiri di Studio / Lokasi'),
    ]

    order_code = models.CharField(max_length=30, unique=True, verbose_name="Kode Pesanan")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders', verbose_name="Akun Pelanggan")
    customer_name = models.CharField(max_length=100, verbose_name="Nama Pemesan")
    customer_phone = models.CharField(max_length=30, verbose_name="No. WhatsApp / HP")
    delivery_method = models.CharField(max_length=20, choices=DELIVERY_CHOICES, default='courier', verbose_name="Metode Pengambilan")
    shipping_fee = models.IntegerField(default=15000, verbose_name="Biaya Kurir / Ongkir (Rp)")
    customer_address = models.TextField(blank=True, verbose_name="Alamat Pengiriman")
    event_date = models.DateField(null=True, blank=True, verbose_name="Tanggal Acara")
    notes = models.TextField(blank=True, verbose_name="Catatan Khusus / Kustomisasi")
    subtotal = models.IntegerField(default=0, verbose_name="Total Bayar (Rp)")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending', verbose_name="Status Pesanan")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='qris', verbose_name="Metode Pembayaran")
    payment_proof = models.FileField(upload_to='payment_proofs/', blank=True, null=True, verbose_name="Bukti Pembayaran QRIS")
    admin_notes = models.TextField(blank=True, verbose_name="Catatan Admin")
    wa_message = models.TextField(blank=True, verbose_name="Draft Pesan WhatsApp")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Waktu Pemesanan")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Terakhir Diperbarui")

    class Meta:
        db_table = 'store_order'
        ordering = ['-created_at']
        verbose_name = 'Pesanan'
        verbose_name_plural = 'Daftar Pesanan'

    def __str__(self):
        return f"{self.order_code} - {self.customer_name} ({self.get_status_display()})"


class OrderItem(models.Model):
    """Item dalam Pesanan"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=100)
    price = models.IntegerField()
    qty = models.IntegerField(default=1)
    options = models.JSONField(default=dict)
    image = models.CharField(max_length=300, blank=True)

    class Meta:
        db_table = 'store_order_item'

    def __str__(self):
        return f"{self.product_name} x{self.qty}"

    def total(self):
        return self.price * self.qty


class Testimonial(models.Model):
    """Testimoni / Cerita Pelanggan untuk Halaman About & Beranda"""
    name = models.CharField(max_length=100, verbose_name="Nama Pelanggan")
    event = models.CharField(max_length=150, verbose_name="Momen / Acara", help_text="Contoh: Wisuda S1 UNHAS 2024 / Semhas UMI 2024")
    text = models.TextField(verbose_name="Isi Testimoni / Ulasan")
    rating = models.IntegerField(default=5, verbose_name="Rating Bintang (1-5)")
    avatar_color = models.CharField(max_length=30, default="#715330", verbose_name="Warna Avatar (HEX)", help_text="Contoh: #FFB6C1, #1565C0, #E91E8C, #0D47A1")
    order = models.IntegerField(default=0, verbose_name="Urutan Tampil")
    is_active = models.BooleanField(default=True, verbose_name="Tampilkan di Web")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Waktu Ditambahkan")

    class Meta:
        db_table = 'store_testimonial'
        ordering = ['order', '-created_at']
        verbose_name = 'Testimoni Pelanggan'
        verbose_name_plural = 'Daftar Testimoni Pelanggan'

    def __str__(self):
        return f"{self.name} ({self.event})"

    @property
    def color(self):
        return self.avatar_color or '#715330'

    @property
    def initial(self):
        return self.name[0].upper() if self.name else 'D'


class GalleryItem(models.Model):
    """Foto Galeri / Portfolio untuk Halaman About"""
    CATEGORY_CHOICES = [
        ('Papan Bulat', 'Papan Bulat'),
        ('Papan Kubah', 'Papan Kubah'),
        ('Flowerbox', 'Flowerbox'),
        ('Papan Besar', 'Papan Besar'),
    ]

    title = models.CharField(max_length=150, blank=True, verbose_name="Judul / Keterangan Foto", default="Papan Akrilik")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Papan Bulat', verbose_name="Kategori Papan")
    image = models.ImageField(upload_to='gallery/', blank=True, null=True, verbose_name="Foto Galeri")
    static_path = models.CharField(max_length=300, blank=True, verbose_name="Path Foto (Legacy)")
    order = models.IntegerField(default=0, verbose_name="Urutan Tampil")
    is_active = models.BooleanField(default=True, verbose_name="Tampilkan di Web")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Waktu Ditambahkan")

    class Meta:
        db_table = 'store_gallery_item'
        ordering = ['order', '-created_at']
        verbose_name = 'Foto Galeri (Portfolio)'
        verbose_name_plural = 'Daftar Foto Galeri'

    def __str__(self):
        return f"{self.category} - {self.title or 'Foto'}"

    def get_src(self):
        if self.image:
            return self.image.url
        if self.static_path:
            return self.static_path
        return ''


# ─────────────────────────────────────────────────────────────
#  ARTIKEL / BLOG
# ─────────────────────────────────────────────────────────────

class ArticleTag(models.Model):
    """Tag / Label untuk Artikel"""
    name = models.CharField(max_length=50, unique=True, verbose_name="Nama Tag")
    slug = models.SlugField(max_length=60, unique=True, verbose_name="Slug Tag")

    class Meta:
        db_table = 'store_article_tag'
        verbose_name = 'Tag Artikel'
        verbose_name_plural = 'Daftar Tag Artikel'

    def __str__(self):
        return self.name


class Article(models.Model):
    """Model Artikel / Blog DaniyouStuff.co"""
    STATUS_CHOICES = [
        ('draft', 'Draft (Belum Terbit)'),
        ('published', 'Dipublikasikan'),
        ('archived', 'Diarsipkan'),
    ]

    title = models.CharField(max_length=200, verbose_name="Judul Artikel")
    slug = models.SlugField(
        max_length=220, unique=True, verbose_name="Slug URL",
        help_text="Otomatis tersinkronisasi dari judul. Gunakan huruf kecil dan tanda hubung."
    )
    thumbnail = models.FileField(
        upload_to='articles/thumbnails/', blank=True, null=True,
        verbose_name="Thumbnail / Gambar Utama"
    )
    summary = models.TextField(
        max_length=500, verbose_name="Ringkasan Artikel",
        help_text="Ringkasan singkat yang muncul di daftar artikel (maks. 500 karakter)."
    )
    content = models.TextField(verbose_name="Isi Artikel Lengkap")
    tags = models.ManyToManyField(
        ArticleTag, blank=True, verbose_name="Tags Artikel",
        related_name='articles'
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='draft',
        verbose_name="Status Publikasi"
    )
    published_at = models.DateTimeField(
        null=True, blank=True, verbose_name="Jadwal / Waktu Terbit",
        help_text="Kosongkan untuk menyimpan sebagai draft. Isi jadwal untuk terbit otomatis."
    )
    author = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name="Penulis"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Dibuat")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Diperbarui")

    class Meta:
        db_table = 'store_article'
        ordering = ['-published_at', '-created_at']
        verbose_name = 'Artikel'
        verbose_name_plural = 'Daftar Artikel'

    def __str__(self):
        return f"{self.title} [{self.get_status_display()}]"

    def is_live(self):
        """Cek apakah artikel sudah tayang (published + waktu terbit sudah lewat)."""
        from django.utils import timezone
        return (
            self.status == 'published'
            and (self.published_at is None or self.published_at <= timezone.now())
        )

