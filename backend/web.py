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
        pdfs = glob.glob('sheets/*.pdf')

        data = []
        for pdf in pdfs:
            # pdfinfo adele_hello.pdf
            args = ["pdfinfo", pdf]
            proc = Popen(args, stdout=PIPE, stderr=PIPE)
            infp, err = proc.communicate()


            title = pdf[len('sheets/'):].split('_')[1][:-4].replace('-', ' ')
            author = pdf[len('sheets/'):].split('_')[0].replace('-', ' ')
            data.append({
                'title': titlecase(title),
                'author': titlecase(author),
                'file':pdf,
                'preview': 'http://localhost:8888/preview/%s' % pdf,
                'pages': re.findall(regex, infp)[0]
                })

        self.write(json.dumps(data))



class Application(tornado.web.Application):
    def __init__(self, args):
        super(Application, self).__init__(args)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', "--port", default="8888", type=int)
    parser.add_argument('-a', "--address", default="127.0.0.1", type=str)
    args = parser.parse_args()

    print("start Application ...")
    application = Application([
        (r'/', SheetListHandler),
        (r'/preview/(.*)', PreviewHandler),
        (r'/page/([0-9]*)/(.*)', PageHandler)
    ])

    print("listen on %s:%i ..." % (args.address, args.port))
    application.listen(args.port, address=args.address)
    tornado.ioloop.IOLoop.instance().start()
