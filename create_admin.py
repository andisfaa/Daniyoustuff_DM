import getpass
from werkzeug.security import generate_password_hash
from database import get_db

nama = input("Nama admin: ").strip()
email = input("Email admin: ").strip().lower()
pw = getpass.getpass("Password (min 8 karakter): ")
pw2 = getpass.getpass("Ulangi password: ")
if pw != pw2 or len(pw) < 8:
    raise SystemExit("Password tidak sama atau kurang dari 8 karakter.")

db = get_db()
with db.cursor() as cur:
    cur.execute("SELECT id FROM users WHERE email=%s", (email,))
    if cur.fetchone():
        cur.execute("UPDATE users SET role='admin', aktif=1, password_hash=%s WHERE email=%s",
                    (generate_password_hash(pw), email))
        print("Akun sudah ada: dijadikan admin, password diperbarui.")
    else:
        cur.execute("INSERT INTO users (nama, email, password_hash, role) VALUES (%s,%s,%s,'admin')",
                    (nama, email, generate_password_hash(pw)))
        print("Admin baru dibuat.")
db.commit()
db.close()