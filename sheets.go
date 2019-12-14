package main

import (
	"errors"
	"net/http"
	"net/url"
	"os"
	"path"
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
		url := "/sheet/" + url.QueryEscape(match)
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

type SheetDir struct {
	Compress bool
	Dir      string
}

func (d SheetDir) Open(name string) (http.File, error) {
	if filepath.Separator != '/' && strings.ContainsRune(name, filepath.Separator) {
		return nil, errors.New("http: invalid character in file path")
	}
	dir := d.Dir
	if dir == "" {
		dir = "."
	}

	fullName := filepath.Join(dir, filepath.FromSlash(path.Clean("/"+name)))

	if d.Compress {
		fullNamePDFCompressed := filepath.Join(dir, filepath.FromSlash(path.Clean("/"+name)))
		fullNamePDFCompressed = fullNamePDFCompressed[:len(fullNamePDFCompressed)-3] + "cpdf"

		if _, err := os.Stat(fullNamePDFCompressed); os.IsNotExist(err) {
			// Try to compress
			CompressPDF(fullName, fullNamePDFCompressed)
			// if original was smaller, we use this file
			if FileSize(fullName) < FileSize(fullNamePDFCompressed) {
				FileCopy(fullName, fullNamePDFCompressed)
			}
		}
	}

	f, err := os.Open(fullName)
	if err != nil {
		return nil, err
	}
	return f, nil

}
