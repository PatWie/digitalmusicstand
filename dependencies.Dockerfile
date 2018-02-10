FROM beevelop/nodejs:6
MAINTAINER Patrick Wieschollek <mail@patwie.com>

# Install Python.
RUN \
  apt-get update && \
  apt-get install -y python python-dev python-pip python-virtualenv poppler-utils&& \
  rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip
RUN pip install titlecase
RUN pip install tornado


# ADD ./frontend /app/frontend
# WORKDIR /app/frontend
# RUN npm install
# RUN npm run build
# RUN dir /app/frontend/dist

# WORKDIR /app
# RUN mkdir /app/data
# ADD ./backend/web.py /app/web.py


# WORKDIR /app
# ADD ./backend/start.sh /app/start.sh

# # EXPOSE 8888
# ENTRYPOINT ./start.sh
