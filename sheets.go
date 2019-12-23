package main

import (
	"io"
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

func UploadSheet(sheetDir string) func(http.ResponseWriter, *http.Request) {

	return func(w http.ResponseWriter, r *http.Request) {
		r.ParseMultipartForm(32 << 20)
		clientFile, handler, err := r.FormFile("file")
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("400 - Cannot fetch uploaded file!"))
			return
		}
		defer clientFile.Close()

		buff := make([]byte, 512)
		if _, err = clientFile.Read(buff); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("400 - Cannot read uploaded file!"))
			return
		}

		if http.DetectContentType(buff) != "application/pdf" {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("400 - Uploaded file is not a PDF!"))
			return
		}

		destinationPath := path.Join(sheetDir, handler.Filename)

		_, err = os.Stat(destinationPath)
		if os.IsNotExist(err) {
			f, err := os.OpenFile(destinationPath, os.O_WRONLY|os.O_CREATE, 0666)
			if err != nil {
				w.WriteHeader(http.StatusOK)
			}
			defer f.Close()
			io.Copy(f, clientFile)
		} else {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("400 - File already exists!"))
			return
		}

	}

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
