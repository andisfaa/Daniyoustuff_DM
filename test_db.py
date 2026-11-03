import os
from database import get_db

db = get_db()
with db.cursor() as cur:
    cur.execute("SELECT nama, harga_sewa FROM products")
    for p in cur.fetchall():
        print(p["nama"], p["harga_sewa"])

    cur.execute("SELECT path FROM product_images")
    hilang = [r["path"] for r in cur.fetchall()
              if not os.path.exists(os.path.join("static", "img", r["path"]))]
db.close()

print("\nFoto hilang:", hilang if hilang else "tidak ada, semua 24 ditemukan")