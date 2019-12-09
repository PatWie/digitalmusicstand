package main

import (
  "fmt"
  "log"
  "net/http"
  "os"
  "path/filepath"
  "strings"

  "github.com/akamensky/argparse"

  "github.com/gin-contrib/static"
  "github.com/gin-gonic/gin"

  "github.com/gobuffalo/packr/v2"
)

type Sheet struct {
  Title  string `json:"title"`
  Artist string `json:"artist"`
  Url    string `json:"url"`
}

var box *packr.Box

func Serve(c *gin.Context) {
  p := c.Param("filepath")
  fileserver := http.FileServer(box)

  c.Request.URL.Path = strings.ReplaceAll(c.Request.URL.Path, "/static", "")

  if box.Has(p) {
    fileserver.ServeHTTP(c.Writer, c.Request)
    c.Abort()
  }
}

func main() {

  gin.SetMode(gin.ReleaseMode)

  box = packr.New("myBox", "./static")

  // Create new parser object
  parser := argparse.NewParser("dm", "Digital Music Stand (https://github.com/PatWie/digitalmusicstand)")
  // Create string flag
  sheet_dir := parser.String("s", "sheets", &argparse.Options{Required: false, Help: "Path to sheets", Default: "sheets"})
  port := parser.Int("p", "port", &argparse.Options{Required: false, Help: "Port to serve", Default: 3000})
  // Parse input
  err := parser.Parse(os.Args)
  if err != nil {
    log.Fatal(parser.Usage(err))
  }

  r := gin.Default()

  sheets := []Sheet{}

  pattern := (*sheet_dir) + "/*_*.pdf"

  matches, err := filepath.Glob(pattern)

  if err != nil {
    fmt.Println(err)
  }

  for _, match := range matches {
    match = strings.ReplaceAll(match, (*sheet_dir)+"/", "")
    url := "/sheets/" + match
    match = strings.ReplaceAll(match, ".pdf", "")
    match = strings.ReplaceAll(match, "-", " ")

    tokens := strings.Split(match, "_")
    if len(tokens) == 2 {
      artist := strings.Title(strings.ToLower(tokens[0]))
      title := strings.Title(strings.ToLower(tokens[1]))

      sheets = append(sheets, Sheet{Title: title, Artist: artist, Url: url})
    }
  }

  index_html, _ := box.FindString("index.html")

  r.GET("/", func(c *gin.Context) {
    c.Writer.WriteHeader(http.StatusOK)
    c.Writer.Write([]byte(index_html))
  })
  r.GET("/static/*filepath", Serve)
  r.Use(static.Serve("/sheets", static.LocalFile(*sheet_dir, false)))
  r.GET("/sheets.json", func(c *gin.Context) {
    c.JSON(200, sheets)
  })

  r.Run(fmt.Sprintf(":%v", *port))
}
