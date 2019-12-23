package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/akamensky/argparse"
	"github.com/go-chi/chi"
	"github.com/gobuffalo/packr/v2"
)

var box *packr.Box

func FileServer(r chi.Router, path string, root http.FileSystem) {
	if strings.ContainsAny(path, "{}*") {
		panic("FileServer does not permit URL parameters.")
	}

	fs := http.StripPrefix(path, http.FileServer(root))

	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", 301).ServeHTTP)
		path += "/"
	}
	path += "*"

	r.Get(path, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fs.ServeHTTP(w, r)
	}))
}

func main() {
	box = packr.New("myBox", "./static.min")

	parser := argparse.NewParser("dm", "Digital Music Stand (https://github.com/PatWie/digitalmusicstand)")
	sheetDir := parser.String("s", "sheets", &argparse.Options{Required: false, Help: "Path to sheets", Default: "sheets"})
	addr := parser.String("l", "listen", &argparse.Options{Required: false, Help: "Listen at", Default: ":3000"})
	allowUploads := parser.Flag("u", "allow-uploads", &argparse.Options{Required: false, Help: "Allow Uploads", Default: false})

	err := parser.Parse(os.Args)
	if err != nil {
		log.Fatal(parser.Usage(err))
	}

	html, err := box.FindString("index.html")

	r := chi.NewRouter()

	r.Get("/sheets.json", func(w http.ResponseWriter, r *http.Request) {
		sheets, err := GetSheets(*sheetDir)
		if err != nil {
			log.Fatal(parser.Usage(err))
		}
		json.NewEncoder(w).Encode(sheets)

	})
	if *allowUploads {
		r.Post("/upload", UploadSheet(*sheetDir))
		html = strings.Replace(html, "data-upload=disabled", "data-upload=enabled", 1)

	} else {
		r.Post("/upload", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("400 - Uploads are not enabled!"))
			return

		})
	}

	t := template.New("index")
	t, err = t.Parse(html)
	if err != nil {
		panic(err)
	}

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		t.Execute(w, nil)

	})

	FileServer(r, "/", box)
	FileServer(r, "/sheet", http.Dir(*sheetDir))

	fmt.Println("Digital Music Stand (https://github.com/PatWie/digitalmusicstand)")
	fmt.Println("listens at            ", *addr)
	fmt.Println("allow file uploads    ", *allowUploads)
	fmt.Println("serve from directory  ", *sheetDir)

	err = http.ListenAndServe(*addr, r)
	if err != nil {
		log.Fatal(err)
	}

}
