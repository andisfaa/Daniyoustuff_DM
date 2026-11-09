from django.contrib import admin
from django.utils.html import format_html
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    Product, ProductImage, ProductVariant,
    Order, OrderItem, UserProfile,
    Testimonial, GalleryItem
)


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profil Tambahan (No. WhatsApp & Alamat)'
    fk_name = 'user'


class CustomUserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'get_phone', 'is_staff')

    def get_phone(self, obj):
        return obj.profile.phone_number if hasattr(obj, 'profile') else '-'
    get_phone.short_description = 'No. WhatsApp'


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone_number', 'address', 'updated_at']
    search_fields = ['user__username', 'user__email', 'phone_number', 'address']


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'available', 'stock', 'updated_at']
    list_filter = ['available', 'category']
    search_fields = ['name', 'category']
    prepopulated_fields = {'id_slug': ('name',)}
    list_editable = ['available', 'stock', 'price']
    inlines = [ProductImageInline, ProductVariantInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ['product_name', 'price', 'qty', 'options_display', 'total']
    extra = 0

    def options_display(self, obj):
        if not obj.options:
            return '-'
        items = []
        for k, v in obj.options.items():
            if v:
                items.append(f"{k}: {v}")
        return ", ".join(items)
    options_display.short_description = 'Kustomisasi Varian'

    def total(self, obj):
        return f"Rp{obj.total():,.0f}".replace(',', '.')
    total.short_description = 'Subtotal'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_code', 'customer_name', 'customer_phone',
        'delivery_method', 'event_date', 'subtotal_display', 'status',
        'payment_method', 'proof_thumbnail', 'created_at'
    ]
    list_filter = ['status', 'delivery_method', 'payment_method', 'created_at']
    search_fields = ['order_code', 'customer_name', 'customer_phone', 'customer_address']
    list_editable = ['status']
    readonly_fields = ['order_code', 'proof_preview', 'created_at', 'updated_at', 'wa_message']
    inlines = [OrderItemInline]
    actions = ['confirm_payment', 'set_processing', 'set_ready', 'set_completed']

    fieldsets = (
        ('Informasi Pesanan', {
            'fields': ('order_code', 'status', 'user', 'created_at', 'updated_at')
        }),
        ('Data Pemesan & Pengiriman', {
            'fields': ('customer_name', 'customer_phone', 'delivery_method', 'shipping_fee', 'customer_address', 'event_date', 'notes')
        }),
        ('Pembayaran & QRIS', {
            'fields': ('subtotal', 'payment_method', 'proof_preview', 'payment_proof', 'admin_notes')
        }),
        ('Draft WhatsApp', {
            'classes': ('collapse',),
            'fields': ('wa_message',)
        }),
    )

    def subtotal_display(self, obj):
        return f"Rp{obj.subtotal:,.0f}".replace(',', '.')
    subtotal_display.short_description = 'Total'

    def proof_thumbnail(self, obj):
        if obj.payment_proof:
            return format_html(
                '<a href="{}" target="_blank">'
                '<img src="{}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;border:1px solid #ccc;" />'
                '</a>',
                obj.payment_proof.url, obj.payment_proof.url
            )
        return format_html('<span style="color:#999;font-size:0.8rem;">Belum ada</span>')
    proof_thumbnail.short_description = 'Bukti QRIS'

    def proof_preview(self, obj):
        if obj.payment_proof:
            return format_html(
                '<div style="margin:10px 0;">'
                '<a href="{}" target="_blank">'
                '<img src="{}" style="max-width:320px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);border:1px solid #ddd;" />'
                '</a>'
                '<p style="margin-top:6px;font-size:0.85rem;color:#555;">Klik gambar untuk melihat ukuran penuh</p>'
                '</div>',
                obj.payment_proof.url, obj.payment_proof.url
            )
        return format_html('<p style="color:#888;">Pelanggan belum mengunggah bukti pembayaran.</p>')
    proof_preview.short_description = 'Pratinjau Bukti Pembayaran'

    # Admin quick actions
    @admin.action(description='✅ Konfirmasi Pembayaran Terpilih')
    def confirm_payment(self, request, queryset):
        rows = queryset.update(status='confirmed')
        self.message_user(request, f"{rows} pesanan berhasil dikonfirmasi pembayarannya.")

    @admin.action(description='⚙️ Tandai Sedang Diproses')
    def set_processing(self, request, queryset):
        rows = queryset.update(status='processing')
        self.message_user(request, f"{rows} pesanan statusnya diubah menjadi 'Sedang Diproses'.")

    @admin.action(description='📦 Tandai Siap Dikirim / Diambil')
    def set_ready(self, request, queryset):
        rows = queryset.update(status='ready')
        self.message_user(request, f"{rows} pesanan statusnya diubah menjadi 'Siap Dikirim / Diambil'.")

    @admin.action(description='🎉 Tandai Pesanan Selesai')
    def set_completed(self, request, queryset):
        rows = queryset.update(status='completed')
        self.message_user(request, f"{rows} pesanan berhasil diselesaikan.")


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['name', 'event', 'rating_stars', 'avatar_preview', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'rating', 'created_at']
    search_fields = ['name', 'event', 'text']
    list_editable = ['order', 'is_active']
    ordering = ['order', '-created_at']

    def rating_stars(self, obj):
        return '⭐' * obj.rating
    rating_stars.short_description = 'Bintang'

    def avatar_preview(self, obj):
        color = obj.avatar_color or '#715330'
        return format_html(
            '<div style="width:28px;height:28px;border-radius:50%;background:{};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:12px;">{}</div>',
            color, obj.initial
        )
    avatar_preview.short_description = 'Avatar'


@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ['thumb_preview', 'title', 'category', 'order', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['title', 'category']
    list_editable = ['order', 'is_active']
    ordering = ['order', '-created_at']

    def thumb_preview(self, obj):
        src = obj.get_src()
        if not src:
            return format_html('<span style="color:#aaa;">Tanpa Foto</span>')
        # jika bukan /media atau http, tambahkan /static/
        if not src.startswith(('http://', 'https://', '/')):
            if not src.startswith('img/'):
                src = 'img/' + src
            src = f'/static/{src}'
        return format_html(
            '<a href="{}" target="_blank"><img src="{}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;border:1px solid #ddd;" /></a>',
            src, src
        )
    thumb_preview.short_description = 'Pratinjau Foto'


admin.site.site_header = "DaniyouStuff.co — Panel Admin"
admin.site.site_title = "DaniyouStuff Admin"
admin.site.index_title = "Manajemen Toko & Pesanan"
