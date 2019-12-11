package main

import (
  "path/filepath"
  "strings"
)

type Sheet struct {
  Title  string `json:"title"`
  Artist string `json:"artist"`
  Url    string `json:"url"`
}

func GetSheets(sheet_dir string) ([]Sheet, error) {
  sheets := []Sheet{}

  pattern := (sheet_dir) + "/*_*.pdf"
  matches, err := filepath.Glob(pattern)

  if err != nil {
    return nil, err
  }

  for _, match := range matches {
    match = strings.ReplaceAll(match, (sheet_dir)+"/", "")
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

  return sheets, nil
}
