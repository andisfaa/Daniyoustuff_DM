"""
Script untuk mengisi database MySQL dengan data produk dari Flask.
Jalankan: python seed_products.py
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'daniyou.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from store.models import Product, ProductImage, ProductVariant

PRODUCTS_DATA = [
    {
        'id_slug': 'papan-bulat',
        'name': 'Papan Bulat',
        'category': 'Papan Bulat',
        'size': '60×60 cm',
        'price': 60000,
        'shape': 'round',
        'description': 'Papan bulat elegan dengan berbagai pilihan warna dekorasi. Cocok untuk momen wisuda, semhas, ulang tahun, dan acara spesial lainnya.',
        'features': ['Frame kayu premium', 'Dekorasi bunga segar', 'Custom teks & nama', 'Dapat difoto dari semua sisi'],
        'gradient': 'linear-gradient(135deg, #FFB6C1 0%, #FFDDE1 100%)',
        'available': True,
        'stock': 5,
        'images': [f'Katalog Daniyou/PAPAN BULAT/Bulat ({i}).jpeg' for i in range(1, 10)],
        'variants': {
            'boardColor': [('Putih', 0), ('Abu', 0)],
            'decorColor': [
                ('Pink Soft', 0), ('Pink Merah', 0), ('Kuning', 0),
                ('Biru', 0), ('Merah', 0), ('Biru Hijau', 0),
                ('Merah Hit', 0), ('Biru Navy', 0), ('Biru Elektrik', 0),
            ],
            'layout': [('Lurus', 0), ('Miring', 0)],
        },
    },
    {
        'id_slug': 'papan-kubah',
        'name': 'Papan Kubah',
        'category': 'Papan Kubah',
        'size': '50×70 cm',
        'price': 60000,
        'shape': 'dome',
        'description': 'Papan kubah unik dengan bentuk melengkung yang elegan. Tersedia dalam berbagai pilihan warna yang menawan untuk segala momen istimewamu.',
        'features': ['Bentuk kubah unik', 'Dekorasi bunga segar', 'Custom teks & nama', 'Tinggi & menawan'],
        'gradient': 'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)',
        'available': True,
        'stock': 5,
        'images': [f'Katalog Daniyou/PAPAN KUBAH/Kubah ({i}).jpeg' for i in range(1, 10)],
        'variants': {
            'warna': [
                ('Biru Navy', 0), ('Pink Biru', 0), ('Pink Soft', 0), ('Kuning', 0),
                ('Pink Merah', 0), ('Biru', 0), ('Ungu', 0), ('Pink', 0),
                ('Merah Pink', 0), ('Biru Soft', 0), ('Merah', 0), ('Biru Hijau', 0), ('Biru Pink', 0),
            ],
            'layout': [('Lurus', 0), ('Miring', 0)],
        },
    },
    {
        'id_slug': 'flowerbox',
        'name': 'Flowerbox',
        'category': 'Flowerbox',
        'size': 'Custom',
        'price': 70000,
        'shape': 'box',
        'description': 'Flowerbox eksklusif dengan bunga premium dan kotak elegan. Tersedia dalam model Portrait dan Landscape.',
        'features': ['Kotak floral premium', 'Bunga segar pilihan', 'Ribbon dekoratif', 'Cocok untuk hadiah'],
        'gradient': 'linear-gradient(135deg, #E91E8C 0%, #FF6B9D 50%, #FFB6C1 100%)',
        'available': True,
        'stock': 4,
        'images': [f'Katalog Daniyou/PAPAN FLOWERBOX/Flowerbox ({i}).jpeg' for i in range(1, 3)],
        'variants': {
            'warna': [('Pink', 0), ('Merah Pink', 0)],
            'model': [('Potrait', 0), ('Landscape', 15000)],  # Landscape +Rp15.000
        },
    },
    {
        'id_slug': 'papan-besar',
        'name': 'Papan Besar',
        'category': 'Papan Besar',
        'size': '80×60 cm',
        'price': 100000,
        'shape': 'large',
        'description': 'Papan besar premium ukuran 80×60 cm yang megah dan impactful. Sempurna untuk wisuda dan acara besar.',
        'features': ['Ukuran extra large', 'Frame premium', 'Dekorasi bunga mewah', 'Impactful & megah'],
        'gradient': 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)',
        'available': True,
        'stock': 2,
        'images': [f'Katalog Daniyou/PAPAN BESAR/Besar ({i}).jpeg' for i in range(1, 5)],
        'variants': {
            'warna': [('Navy', 0), ('Merah Hitam Putih', 0)],
        },
    },
]

def seed():
    print("🌱 Mulai seed data produk ke MySQL...")
    created = 0
    skipped = 0

    for data in PRODUCTS_DATA:
        product, is_new = Product.objects.get_or_create(
            id_slug=data['id_slug'],
            defaults={
                'name': data['name'],
                'category': data['category'],
                'size': data['size'],
                'price': data['price'],
                'shape': data['shape'],
                'description': data['description'],
                'features': data['features'],
                'gradient': data['gradient'],
                'available': data['available'],
                'stock': data['stock'],
            }
        )

        if is_new:
            # Tambah gambar
            for i, img_path in enumerate(data['images']):
                ProductImage.objects.create(product=product, path=img_path, order=i)

            # Tambah varian
            for key, values in data['variants'].items():
                for val, extra in values:
                    ProductVariant.objects.create(
                        product=product, key=key, value=val, extra_price=extra
                    )

            print(f"  ✅ {product.name} — ditambahkan")
            created += 1
        else:
            print(f"  ⏭️  {product.name} — sudah ada, dilewati")
            skipped += 1

    print(f"\n✅ Selesai! {created} produk baru, {skipped} dilewati.")
    print("🔗 Cek di phpMyAdmin: tabel store_product, store_product_image, store_product_variant")

if __name__ == '__main__':
    seed()

