import os
import urllib.request
import webbrowser
from subprocess import Popen
from tqdm import tqdm
import time

# source: https://stackoverflow.com/questions/15644964/python-progress-bar-and-downloads
class DownloadProgressBar(tqdm):
    def update_to(self, b=1, bsize=1, tsize=None):
        if tsize is not None:
            self.total = tsize
        self.update(b * bsize - self.n)


def download_url(url, output_path):
    with DownloadProgressBar(unit='B', unit_scale=True,
                             miniters=1, desc=url.split('/')[-1]) as t:
        urllib.request.urlretrieve(url, filename=output_path, reporthook=t.update_to)

def run():
    db_url = 'https://github.com/cwipy7/moreco/releases/download/1/movie_sqlite.db'
    db_filename = db_url.split('/')[-1]
    path = os.path.join('visual', 'db')
    os.makedirs(path, exist_ok=True)
    full_path = os.path.join(path, db_filename)
    if not os.path.exists(full_path):
        download_url(db_url, full_path)
    os.chdir('visual')
    try:
        p = Popen("python server.py", shell=True)
    except OSError as e:
        print(e.strerror)
    time.sleep(3)
    webbrowser.open('http://127.0.0.1:5000/ ', new=2)
    p.wait()

if __name__ == '__main__':
    run()
