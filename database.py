import pymysql

def get_db():
    return pymysql.connect(
        host="127.0.0.1",
        user="root",
        password="",                      # bawaan XAMPP
        database="db_daniyoustuff",
        cursorclass=pymysql.cursors.DictCursor,
        charset="utf8mb4",
    )