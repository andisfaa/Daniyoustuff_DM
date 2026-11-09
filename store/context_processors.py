from .models import Product


def cart_globals(request):
    """Context processor: inject cart info ke semua template (pengganti inject_globals di Flask)"""
    cart = request.session.get('cart', [])
    cart_count = len(cart)
    cart_total = sum(item.get('price', 0) * item.get('qty', 1) for item in cart)

    def format_price(price):
        return f"Rp{price:,.0f}".replace(',', '.')

    return {
        'cart_count': cart_count,
        'cart_total': cart_total,
        'format_price': format_price,
        'products': Product.objects.filter(available=True),
    }

