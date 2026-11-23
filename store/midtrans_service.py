import logging
import html
from django.conf import settings
import midtransclient

logger = logging.getLogger(__name__)


def get_snap_client():
    """Menginisialisasi client Midtrans Snap dengan kredensial dari settings."""
    server_key = getattr(settings, 'MIDTRANS_SERVER_KEY', '')
    client_key = getattr(settings, 'MIDTRANS_CLIENT_KEY', '')
    is_production = getattr(settings, 'MIDTRANS_IS_PRODUCTION', False)

    return midtransclient.Snap(
        is_production=is_production,
        server_key=server_key,
        client_key=client_key,
    )


def create_order_snap_token(order, request=None):
    """
    Membuat Snap Token untuk transaksi pesanan DaniyouStuff.
    Token ini digunakan oleh frontend Midtrans Snap Popup.
    """
    snap = get_snap_client()

    # Buat item details
    items = []
    calculated_total = 0

    for item in order.items.all():
        price = int(item.price)
        qty = int(item.qty)
        calculated_total += price * qty
        items.append({
            'id': f"PROD-{item.product_id or item.id}",
            'price': price,
            'quantity': qty,
            'name': (item.product_name or 'Produk Akrilik')[:50],
        })

    # Tambah ongkir jika ada
    if order.shipping_fee and int(order.shipping_fee) > 0:
        fee = int(order.shipping_fee)
        calculated_total += fee
        items.append({
            'id': 'SHIPPING',
            'price': fee,
            'quantity': 1,
            'name': 'Ongkir Kurir (Antar-Jemput)',
        })

    # Pastikan gross_amount sesuai dengan order.subtotal
    gross_amount = int(order.subtotal)
    # Jika ada selisih kalkulasi, sesuaikan agar Midtrans tidak menolak validasi item_details
    if calculated_total != gross_amount:
        items = [{
            'id': order.order_code,
            'price': gross_amount,
            'quantity': 1,
            'name': f"Pesanan {order.order_code}",
        }]

    # Siapkan customer details
    user_email = 'customer@daniyoustuff.co'
    if order.user and getattr(order.user, 'email', None):
        user_email = order.user.email

    param = {
        'transaction_details': {
            'order_id': order.order_code,
            'gross_amount': gross_amount,
        },
        'item_details': items,
        'customer_details': {
            'first_name': html.unescape(order.customer_name or 'Pelanggan DaniyouStuff'),
            'email': user_email,
            'phone': order.customer_phone or '',
            'billing_address': {
                'first_name': order.customer_name or '',
                'address': (order.customer_address or '')[:200],
            },
        },
    }

    try:
        response = snap.create_transaction(param)
        snap_token = response.get('token')
        if snap_token:
            order.snap_token = snap_token
            order.save(update_fields=['snap_token'])
        return response
    except Exception as e:
        logger.error(f"Gagal membuat Midtrans Snap Token untuk {order.order_code}: {e}")
        # Jika order_id sudah pernah dipakai di Midtrans (misal percobaan ulang)
        # tambahkan suffix timestamp agar tetap unik
        if 'already' in str(e).lower() or '400' in str(e):
            import time
            alt_order_id = f"{order.order_code}-{int(time.time())}"
            param['transaction_details']['order_id'] = alt_order_id
            try:
                response = snap.create_transaction(param)
                snap_token = response.get('token')
                if snap_token:
                    order.snap_token = snap_token
                    order.save(update_fields=['snap_token'])
                return response
            except Exception as e2:
                logger.error(f"Retry Snap Token gagal: {e2}")
                raise e2
        raise e


def check_midtrans_status(order_code):
    """Mengecek status transaksi langsung ke Midtrans API."""
    snap = get_snap_client()
    try:
        status_res = snap.transactions.status(order_code)
        return status_res
    except Exception as e:
        logger.error(f"Gagal memeriksa status Midtrans untuk {order_code}: {e}")
        return None

