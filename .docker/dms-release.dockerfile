From golang:1.13

RUN wget https://github.com/tdewolff/minify/releases/download/v2.6.1/minify_2.6.1_linux_amd64.tar.gz
RUN tar -xvf minify_2.6.1_linux_amd64.tar.gz && rm -r cmd && rm LICENSE.md
RUN mv minify /go/bin/minify

RUN go get -u github.com/gobuffalo/packr/v2/packr2