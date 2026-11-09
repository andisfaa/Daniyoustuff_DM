#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'daniyou.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Django tidak ditemukan. Pastikan virtualenv aktif dan Django sudah diinstall."
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()

