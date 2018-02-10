FROM beevelop/nodejs:6
MAINTAINER Maik Hummel <m@ikhummel.com>

# Install Python.
RUN \
  apt-get update && \
  apt-get install -y python python-dev python-pip python-virtualenv poppler-utils&& \
  rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip
RUN pip install titlecase
RUN pip install tornado


ADD ./frontend /app/frontend
WORKDIR /app/frontend
RUN echo "hi"
RUN npm install chalk
RUN npm run build
RUN dir /app/frontend/dist

WORKDIR /app
RUN mkdir /app/data
ADD ./backend/web.py /app/web.py


WORKDIR /app
ADD ./backend/start.sh /app/start.sh

# EXPOSE 8888
ENTRYPOINT ./start.sh
# ENTRYPOINT python /app/web.py -p 8888 -r /app/frontend/dist -s /app/data
# ENTRYPOINT dir /app && dir /app/frontend/dist && dir /app/data
# CMD [ "python", "./my_script.py" ]
# ENTRYPOINT python -c "print('test')"
# sudo docker run -i -t music --expose=8888 -v "/home/patwie/git/github.com/patwie/digitalmusicstand/backend/sheets":"/app/data"