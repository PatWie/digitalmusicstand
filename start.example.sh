SHEET_DIR="path/to/sheets"
PORT=8889

sudo docker run -i -p ${PORT}:8888 -v ${SHEET_DIR}:"/app/data" -t patwie/digitalmusicstand