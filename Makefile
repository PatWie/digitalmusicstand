all:
	rm -rf static.min
	mkdir static.min
	mkdir static.min/fonts
	mkdir static.min/css
	mkdir static.min/js
	./minify -o static.min/css/min.css static/css/main.css static/css/all.min.css
	./minify -o static.min/index.html static/index.html
	./minify -o static.min/js/jquery-3.4.1.min.js static/js/jquery-3.4.1.min.js
	./minify -o static.min/js/dropzone.min.js static/js/dropzone.js
	./minify -o static.min/js/pdf.min.js static/js/pdf.js static/js/pdf.worker.js
	./minify -o static.min/js/main.min.js static/js/fuzzysort.js static/js/main.js
	cp static/fonts/* static.min/fonts/
	cp static/favicon.ico static.min/favicon.ico
