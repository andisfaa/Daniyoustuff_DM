from django import template
from django.templatetags.static import static

register = template.Library()


@register.filter
def format_price(value):
    try:
        return "Rp " + f"{int(float(value)):,}".replace(",", ".")
    except (ValueError, TypeError):
        return value


@register.filter
def multiply(value, arg):
    try:
        return float(value) * float(arg)
    except (ValueError, TypeError):
        return 0


def _path_of(img):
    """Ambil path gambar dari string atau objek ProductImage."""
    if isinstance(img, str):
        return img
    for field in ("image_path", "path", "url", "image", "filename"):
        val = getattr(img, field, None)
        if val:
            return str(val)
    return ""


@register.simple_tag
def product_img(product):
    """Kembalikan URL gambar pertama dari sebuah produk."""
    if not product:
        return ""
    if isinstance(product, str):
        return img_static(product)
    images = getattr(product, "images", None)
    if isinstance(product, dict):
        images = product.get("images")
    first = None
    if images is not None:
        if hasattr(images, "all"):          # relasi ForeignKey
            first = images.all().first()
        elif hasattr(images, "first"):
            first = images.first()
        elif images:                        # list biasa
            first = images[0]
    path = _path_of(first) if first else ""
    if not path:
        return ""
    if path.startswith(("http://", "https://", "/")):
        return path
    if not path.startswith("img/"):
        path = f"img/{path}"
    return static(path)


@register.simple_tag
def img_static(path):
    """Kembalikan URL static untuk gambar"""
    if not path:
        return ""
    path_str = _path_of(path) if not isinstance(path, str) else path
    if not path_str:
        return ""
    if path_str.startswith(("http://", "https://", "/")):
        return path_str
    if not path_str.startswith("img/"):
        path_str = f"img/{path_str}"
    return static(path_str)


@register.filter
def option_label(key):
    """Format label varian opsi"""
    labels = {
        'boardColor': 'Warna Papan',
        'decorColor': 'Warna Bunga',
        'layout': 'Layout',
        'warna': 'Warna',
        'model': 'Model',
        'nama': 'Nama',
        'ucapan': 'Ucapan',
        'tanggal': 'Tgl Acara',
        'catatan': 'Catatan',
    }
    return labels.get(key, key)


@register.filter
def replace_underscore(value):
    if isinstance(value, str):
        return value.replace('_', ' ')
    return value


@register.filter
def user_initial(user):
    """Ambil huruf pertama dari user untuk avatar"""
    if not user:
        return "U"
    name = getattr(user, 'first_name', '') or getattr(user, 'username', '')
    if name:
        return str(name)[0].upper()
    return "U"


@register.filter
def user_display_name(user):
    """Ambil nama ringkas user (nama depan atau bagian sebelum @)"""
    if not user:
        return ""
    first_name = getattr(user, 'first_name', '')
    if first_name:
        return first_name.strip().split()[0]
    username = getattr(user, 'username', '')
    if '@' in username:
        return username.split('@')[0]
    return username[:14]

