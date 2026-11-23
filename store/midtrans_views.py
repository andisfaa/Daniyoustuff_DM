import json
import logging
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404
from .models import Order
from .midtrans_service import check_midtrans_status, create_order_snap_token

logger = logging.getLogger(__name__)


def _extract_real_order_code(order_id):
    """
    Mengekstrak kode pesanan asli dari order_id Midtrans.
    Format Daniyou: DNY-YYMMDD-XXXX (atau DNY-YYMMDD-XXXX-TIMESTAMP)
    """
    parts = order_id.split('-')
    if len(parts) >= 3 and parts[0] == 'DNY':
        return f"{parts[0]}-{parts[1]}-{parts[2]}"
    return order_id


@csrf_exempt
@require_POST
def midtrans_notification_view(request):
    """
    Webhook handler untuk menerima notifikasi status pembayaran dari server Midtrans.
    Endpoint ini harus didaftarkan di Dashboard Midtrans -> Settings -> Configuration -> Notification URL.
    """
    try:
        payload = json.loads(request.body.decode('utf-8'))
    except Exception as e:
        logger.error(f"Invalid JSON payload from Midtrans: {e}")
        return HttpResponse("Bad Request", status=400)

    order_id = payload.get('order_id', '')
    transaction_status = payload.get('transaction_status', '')
    fraud_status = payload.get('fraud_status', '')
    payment_type = payload.get('payment_type', '')
    transaction_id = payload.get('transaction_id', '')

    logger.info(f"Midtrans Webhook: order_id={order_id}, status={transaction_status}, fraud={fraud_status}")

    real_code = _extract_real_order_code(order_id)
    try:
        order = Order.objects.get(order_code=real_code)
    except Order.DoesNotExist:
        logger.warning(f"Order not found for Midtrans notification: {real_code}")
        return HttpResponse("Order Not Found", status=404)

    # Simpan info transaksi
    if payment_type:
        order.payment_type = payment_type
    if transaction_id:
        order.midtrans_transaction_id = transaction_id

    # Update status pesanan berdasarkan status transaksi Midtrans
    if transaction_status in ['capture', 'settlement']:
        if fraud_status == 'accept' or transaction_status == 'settlement':
            order.status = 'confirmed'
            logger.info(f"Pesanan {order.order_code} berhasil dibayar via Midtrans ({payment_type})")
        elif fraud_status == 'challenge':
            order.status = 'pending'
    elif transaction_status in ['pending']:
        order.status = 'pending'
    elif transaction_status in ['deny', 'cancel', 'expire']:
        order.status = 'cancelled'

    order.save()
    return JsonResponse({'status': 'OK', 'message': 'Notification processed successfully'})


@csrf_exempt
@require_POST
def midtrans_finish_view(request):
    """
    Endpoint pembaruan instan dari frontend begitu pelanggan menyelesaikan pembayaran di popup Snap.
    Berguna terutama saat testing di localhost atau sebelum webhook Midtrans tiba.
    """
    try:
        data = json.loads(request.body.decode('utf-8'))
    except Exception:
        data = request.POST

    order_code = data.get('order_code', '').strip().upper()
    order = get_object_or_404(Order, order_code=order_code)

    # Cek status langsung ke server Midtrans untuk verifikasi keamanan
    status_res = check_midtrans_status(order.order_code)
    if status_res:
        t_status = status_res.get('transaction_status', '')
        fraud = status_res.get('fraud_status', '')
        p_type = status_res.get('payment_type', '')
        t_id = status_res.get('transaction_id', '')

        if p_type:
            order.payment_type = p_type
        if t_id:
            order.midtrans_transaction_id = t_id

        if t_status in ['settlement', 'capture'] and fraud in ['accept', '']:
            order.status = 'confirmed'
            order.save()
            return JsonResponse({'status': 'success', 'order_status': order.status, 'message': 'Pembayaran berhasil dikonfirmasi!'})
        elif t_status == 'pending':
            order.status = 'pending'
            order.save()
            return JsonResponse({'status': 'pending', 'order_status': order.status, 'message': 'Pembayaran menunggu penyelesaian'})

    # Jika Midtrans API belum mencatat status, ambil indikator dari Snap callback client
    client_status = data.get('result_status', '')
    if client_status == 'success':
        order.status = 'confirmed'
        order.save()
        return JsonResponse({'status': 'success', 'order_status': order.status, 'message': 'Pembayaran berhasil dikonfirmasi!'})

    return JsonResponse({'status': 'ok', 'order_status': order.status})


def get_snap_token_api(request, order_code):
    """API untuk mengambil atau memperbarui Snap Token pesanan tertentu."""
    order = get_object_or_404(Order, order_code=order_code.upper())

    if not order.snap_token:
        try:
            create_order_snap_token(order, request=request)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    from django.conf import settings
    return JsonResponse({
        'order_code': order.order_code,
        'snap_token': order.snap_token,
        'client_key': getattr(settings, 'MIDTRANS_CLIENT_KEY', ''),
        'is_production': getattr(settings, 'MIDTRANS_IS_PRODUCTION', False),
    })
