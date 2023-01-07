package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/akamensky/argparse"
	"github.com/go-chi/chi/v5"
)

//go:embed static.min/*
var embededFiles embed.FS

func FileServer(r chi.Router, path string, root http.FileSystem) {
	if strings.ContainsAny(path, "{}*") {
		panic("FileServer does not permit URL parameters.")
	}

	fs := http.StripPrefix(path, http.FileServer(root))
	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", http.StatusMovedPermanently).ServeHTTP)
		path += "/"
	}
	path += "*"

	r.Get(path, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fs.ServeHTTP(w, r)
	}))
}

func ReadStringFromFile(path string) string {
	fmt.Println(path)
	fsys, err := fs.Sub(embededFiles, "static.min")
	if err != nil {
		panic(err)
	}

	html_buf, err := fs.ReadFile(fsys, path)
	if err != nil {
		panic(err)
	}

	return string(html_buf)
}

func main() {
	parser := argparse.NewParser("dm", "Digital Music Stand (https://github.com/PatWie/digitalmusicstand)")
	sheetDir := parser.String("s", "sheets", &argparse.Options{Required: false, Help: "Path to sheets", Default: "sheets"})
	addr := parser.String("l", "listen", &argparse.Options{Required: false, Help: "Listen at", Default: ":3000"})
	allowUploads := parser.Flag("u", "allow-uploads", &argparse.Options{Required: false, Help: "Allow Uploads", Default: false})
	parseYaml := parser.Flag("y", "parse-yaml", &argparse.Options{Required: false, Help: "Parse Yaml Files", Default: false})

	err := parser.Parse(os.Args)
	if err != nil {
		log.Fatal(parser.Usage(err))
	}

	staticFilesFS, err := fs.Sub(embededFiles, "static.min")
	if err != nil {
		panic(err)
	}
	indexHTML := ReadStringFromFile("index.html")

	r := chi.NewRouter()

	r.Get("/sheets.json", func(w http.ResponseWriter, _ *http.Request) {
		sheets, err := GetSheets(*sheetDir, *parseYaml)
		if err != nil {
			log.Fatal(parser.Usage(err))
		}
		err = json.NewEncoder(w).Encode(sheets)
		if err != nil {
			panic(err)
		}
	})

	if *allowUploads {
		r.Post("/upload", UploadSheet(*sheetDir))
		indexHTML = strings.Replace(indexHTML, "data-upload=disabled", "data-upload=enabled", 1)

	} else {
		r.Post("/upload", func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("400 - Uploads are not enabled!"))
		})
	}

	t := template.New("index")
	t, err = t.Parse(indexHTML)
	if err != nil {
		panic(err)
	}
	r.Get("/", func(w http.ResponseWriter, _ *http.Request) {
		err := t.Execute(w, nil)
		if err != nil {
			panic(err)
		}

	})

	FileServer(r, "/sheet", http.Dir(*sheetDir))
	FileServer(r, "/", http.FS(staticFilesFS))

	fmt.Println("Digital Music Stand (https://github.com/PatWie/digitalmusicstand)")
	fmt.Println("listens at            ", *addr)
	fmt.Println("allow file uploads    ", *allowUploads)
	fmt.Println("serve from directory  ", *sheetDir)

	err = http.ListenAndServe(*addr, r)
	if err != nil {
		log.Fatal(err)
	}

}
