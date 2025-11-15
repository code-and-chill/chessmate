import os
import sys


def _ensure_path():
    here = os.path.dirname(__file__)
    service_root = os.path.abspath(os.path.join(here, ".."))
    repo_root = os.path.abspath(os.path.join(service_root, ".."))
    for p in (service_root, repo_root):
        if p not in sys.path:
            sys.path.insert(0, p)


_ensure_path()
