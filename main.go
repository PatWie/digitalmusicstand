package main

import (
  "fmt"
  "log"
  "os"
  "path/filepath"
  "strings"

  "github.com/akamensky/argparse"

  "github.com/gin-contrib/static"
  "github.com/gin-gonic/gin"
)

type Sheet struct {
  Title  string `json:"title"`
  Artist string `json:"artist"`
  Url    string `json:"url"`
}

func main() {

  // Create new parser object
  parser := argparse.NewParser("dm", "Digital Music Stand")
  // Create string flag
  sheet_dir := parser.String("s", "sheets", &argparse.Options{Required: false, Help: "Path to sheets", Default: "sheets"})
  port := parser.Int("p", "port", &argparse.Options{Required: false, Help: "Port to serve", Default: 3000})
  // Parse input
  err := parser.Parse(os.Args)
  if err != nil {
    log.Fatal(parser.Usage(err))
  }

  fmt.Println(*sheet_dir)

  r := gin.Default()

  sheets := []Sheet{}

  pattern := (*sheet_dir) + "/*_*.pdf"

  matches, err := filepath.Glob(pattern)

  if err != nil {
    fmt.Println(err)
  }

  for _, match := range matches {
    url := "/" + match
    match = strings.ReplaceAll(match, (*sheet_dir)+"/", "")
    match = strings.ReplaceAll(match, ".pdf", "")
    match = strings.ReplaceAll(match, "-", " ")

    tokens := strings.Split(match, "_")
    if len(tokens) == 2 {
      artist := strings.Title(strings.ToLower(tokens[0]))
      title := strings.Title(strings.ToLower(tokens[1]))

      sheets = append(sheets, Sheet{Title: title, Artist: artist, Url: url})
    }
  }

  r.Use(static.Serve("/", static.LocalFile("static", false)))
  r.Use(static.Serve("/sheets", static.LocalFile("sheets", false)))
  r.GET("/sheets.json", func(c *gin.Context) {
    c.JSON(200, sheets)
  })

  r.Run(fmt.Sprintf(":%v", *port))
}
