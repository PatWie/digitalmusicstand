FROM alpine:3.5
RUN apk --update --no-cache add tar gzip zip && rm -rf /var/cache/apk/*