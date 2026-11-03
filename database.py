import os
import pymysql

def get_db():
    kwargs = {}
    if os.environ.get("DB_SSL") == "1":
        # banyak database online (Aiven, dll.) mewajibkan koneksi SSL
        kwargs["ssl"] = {"check_hostname": False}

    return pymysql.connect(
        host=os.environ.get("DB_HOST", "127.0.0.1"),
        port=int(os.environ.get("DB_PORT", 3306)),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASSWORD", ""),
        database=os.environ.get("DB_NAME", "db_daniyoustuff"),
        cursorclass=pymysql.cursors.DictCursor,
        charset="utf8mb4",
        connect_timeout=10,
        **kwargs,
    )