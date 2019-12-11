package main

import (
  "encoding/json"
  "fmt"
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

  box = packr.New("myBox", "./static")

  parser := argparse.NewParser("dm", "Digital Music Stand (https://github.com/PatWie/digitalmusicstand)")
  sheet_dir := parser.String("s", "sheets", &argparse.Options{Required: false, Help: "Path to sheets", Default: "sheets"})
  port := parser.Int("p", "port", &argparse.Options{Required: false, Help: "Port to serve", Default: 3000})
  err := parser.Parse(os.Args)
  if err != nil {
    log.Fatal(parser.Usage(err))
  }

  r := chi.NewRouter()
  r.Get("/sheets.json", func(w http.ResponseWriter, r *http.Request) {
    sheets, err := GetSheets(*sheet_dir)
    if err != nil {
      log.Fatal(parser.Usage(err))
    }
    json.NewEncoder(w).Encode(sheets)

  })

  FileServer(r, "/", box)
  FileServer(r, "/sheets", http.Dir(*sheet_dir))

  http.ListenAndServe(fmt.Sprintf(":%v", *port), r)
}
