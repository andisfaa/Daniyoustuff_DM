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


def _clean_url(url):
    """Bersihkan URL jika terjadi double-prefixed Cloudinary storage."""
    if not url:
        return ""
    url_str = str(url).strip()
    if "https%3A" in url_str or "http%3A" in url_str or "https:/" in url_str:
        import urllib.parse
        unquoted = urllib.parse.unquote(url_str)
        idx = unquoted.rfind("https://")
        if idx == -1:
            idx = unquoted.rfind("http://")
        if idx != -1:
            return unquoted[idx:]
    return url_str


def _path_of(img):
    """Ambil URL/path gambar dari string atau objek gambar/ImageField."""
    if not img:
        return ""
    if isinstance(img, str):
        return _clean_url(img)
    # Jika ImageField / FieldFile - cek dulu apakah nilainya sudah full URL
    if hasattr(img, 'name'):
        name = str(img.name or '')
        if name.startswith(('http://', 'https://')):
            return _clean_url(name)
    if hasattr(img, 'url'):
        try:
            return _clean_url(img.url)
        except Exception:
            return _clean_url(str(img))
    for field in ("image", "image_path", "path", "url", "filename"):
        val = getattr(img, field, None)
        if val:
            val_str = str(val)
            if val_str.startswith(('http://', 'https://')):
                return _clean_url(val_str)
            if hasattr(val, 'url'):
                try:
                    return _clean_url(val.url)
                except Exception:
                    pass
            return _clean_url(val_str)
    return ""


@register.simple_tag
def product_img(product):
    """Kembalikan URL gambar pertama dari sebuah produk (prioritas ImageField)."""
    if not product:
        return ""
    if isinstance(product, str):
        return img_static(product)

    # Cek method get_image_url() dulu (handle Cloudinary full URL)
    if hasattr(product, 'get_image_url'):
        url = product.get_image_url()
        if url:
            return url

    # Cek ImageField utama langsung jika instance Product
    if hasattr(product, "image") and product.image:
        val = str(product.image)
        if val.startswith(('http://', 'https://')):
            return val
        try:
            return product.image.url
        except Exception:
            pass

    images = getattr(product, "images", None)
    if isinstance(product, dict):
        if product.get("image"):
            img = product["image"]
            return getattr(img, "url", str(img))
        images = product.get("images")

    first = None
    if images is not None:
        if hasattr(images, "all"):          # relasi ForeignKey
            first = images.all().first()
        elif hasattr(images, "first"):
            first = images.first()
        elif images:                        # list biasa
            first = images[0]

    if not first:
        return ""

    if hasattr(first, 'image') and first.image:
        try:
            return first.image.url
        except ValueError:
            pass

    path = _path_of(first)
    if not path:
        return ""
    if path.startswith(("http://", "https://", "/")):
        return path
    if not path.startswith("img/"):
        path = f"img/{path}"
    return static(path)


@register.simple_tag
def img_static(path):
    """Kembalikan URL untuk gambar (support media ImageField dan static)."""
    if not path:
        return ""
    if hasattr(path, 'url'):
        return path.url
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

