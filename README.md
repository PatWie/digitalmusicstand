# Digital Music Stand

A simple PDF viewer to organize music sheets.

<img src="./img/digitalmusicstand_001.jpg" />
<img src="./img/digitalmusicstand_002.jpg" />

## Demo

visit [http://demo-digitalmusicstand.patwie.com](http://demo-digitalmusicstand.patwie.com)

## Get

```bash
docker pull patwie/digitalmusicstand
```

## Build Setup

You only need to set two options:
 - SHEET_DIR: path to pdf files
 - PORT: port the app is listen to

The files in the sheet directoy need to follow the convention `interpret_title.pdf`. Whitespaces should be replaced by '-'.

``` bash
sudo docker build . -f dependencies.Dockerfile -t patwie/digitalmusicstand_dependencies
sudo docker build . -t patwie/digitalmusicstand --no-cache
cp start.example.sh start.sh
nano start.sh
./start
```

## Features
- no database just a collection of files
- supports usb double foot switch to "flip" pages (shortcuts: 1 (left), 2 (right))