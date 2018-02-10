import os
import tornado
import tornado.ioloop
import tornado.web
import argparse
import json
import glob
from titlecase import titlecase
from subprocess import Popen, PIPE
import re
root = os.path.dirname(__file__)


regex = r"Pages:\s*([0-9]*)"
SHEET_DIR = None


class PreviewHandler(tornado.web.RequestHandler):
    def get(self, q):
        self.set_header("Content-type", "image/png")
        args = ['pdftoppm', q, '-png', '-f', '1', '-singlefile']
        proc = Popen(args, stdout=PIPE, stderr=PIPE)
        data, err = proc.communicate()
        self.write(data)

class PageHandler(tornado.web.RequestHandler):
    def get(self, p, q):
        self.set_header("Content-type", "image/png")
        args = ['pdftoppm', q, '-png', '-f', str(p), '-singlefile']
        proc = Popen(args, stdout=PIPE, stderr=PIPE)
        data, err = proc.communicate()
        self.write(data)


class SheetListHandler(tornado.web.RequestHandler):
    def get(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header('Content-Type', 'application/json')
        pdfs = glob.glob(os.path.join(SHEET_DIR, '*.pdf'))

        data = []
        for pdf in pdfs:
            args = ["pdfinfo", pdf]
            proc = Popen(args, stdout=PIPE, stderr=PIPE)
            infp, err = proc.communicate()


            title = pdf.split('/')[-1].split('_')[1][:-4].replace('-', ' ')
            author = pdf.split('/')[-1].split('_')[0].replace('-', ' ')
            data.append({
                'title': titlecase(title),
                'author': titlecase(author),
                'file':pdf,
                'preview': '/preview/%s' % pdf,
                'pages': re.findall(regex, infp)[0]
                })

        self.write(json.dumps(data))



class Application(tornado.web.Application):
    def __init__(self, args):
        super(Application, self).__init__(args)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', "--port", default="8888", type=int)
    parser.add_argument('-r', "--root", default="index.html", type=str)
    parser.add_argument('-s', "--sheets", default="./sheets", type=str)
    parser.add_argument('-a', "--address", default="127.0.0.1", type=str)
    args = parser.parse_args()

    SHEET_DIR = args.sheets

    print("start Application ...")
    application = Application([
        (r'/sheets', SheetListHandler),
        (r'/preview/(.*)', PreviewHandler),
        (r'/page/([0-9]*)/(.*)', PageHandler),
        (r"/(.*)", tornado.web.StaticFileHandler, {"path": args.root, "default_filename": os.path.join(args.root, 'index.html')})
    ])

    print("listen on %s:%i ..." % (args.address, args.port))
    application.listen(args.port)
    tornado.ioloop.IOLoop.instance().start()
