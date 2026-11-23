from cloudinary_storage.storage import MediaCloudinaryStorage


class SafeMediaCloudinaryStorage(MediaCloudinaryStorage):
    """
    Cloudinary storage yang aman:
    Jika nama file sudah merupakan URL lengkap (dimulai http:// atau https://),
    langsung kembalikan URL tersebut tanpa melakukan prepending / encoding ganda.
    """
    def url(self, name):
        if not name:
            return ""
        name_str = str(name).strip()
        if name_str.startswith(('http://', 'https://')):
            return name_str
        return super().url(name)
