package main

import (
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"strings"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"gopkg.in/yaml.v2"
)

type Sheet struct {
	Title      string `json:"title"`
	Artist     string `json:"artist"`
	BookArtist string `json:"bookartist"`
	BookTitle  string `json:"booktitle"`
	URL        string `json:"url"`
	Pages      []int  `json:"pages"`
}

type SheetConfig struct {
	BookPath   string `yaml:"path"`
	BookArtist string `yaml:"artist"`
	BookTitle  string `yaml:"title"`
	Songs      []struct {
		Artist string `yaml:"artist"`
		Title  string `yaml:"title"`
		Pages  []int  `yaml:",flow"`
	}
}

func UploadSheet(sheetDir string) func(http.ResponseWriter, *http.Request) {

	return func(w http.ResponseWriter, r *http.Request) {
		err := r.ParseMultipartForm(32 << 20)
		if err != nil {
			panic(err)
		}

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
			clientFile.Seek(0, io.SeekStart)
			io.Copy(f, clientFile)
		} else {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("400 - File already exists!"))
			return
		}

	}

}

func GetSheets(sheetDir string, parseYaml bool) ([]Sheet, error) {
	sheets := []Sheet{}
	processed_pdfs := []string{}

	// process yaml files
	if parseYaml {
		pattern := sheetDir + "/*.yml"
		matches, err := filepath.Glob(pattern)

		if err != nil {
			return nil, err
		}

		for _, match := range matches {
			yamlFile, err := os.ReadFile(match)

			if err != nil {
				return nil, err
			}

			sheetConfig := SheetConfig{}

			err = yaml.Unmarshal(yamlFile, &sheetConfig)

			if err != nil {
				return nil, err
			}

			url := "/sheet/" + url.QueryEscape(sheetConfig.BookPath)
			processed_pdfs = append(processed_pdfs, sheetConfig.BookPath)

			if len(sheetConfig.Songs) > 0 {
				for _, song := range sheetConfig.Songs {
					if song.Artist == "" {
						song.Artist = sheetConfig.BookArtist
					}

					sheets = append(sheets, Sheet{Title: song.Title, Artist: song.Artist, URL: url, Pages: song.Pages,
						BookArtist: sheetConfig.BookArtist, BookTitle: sheetConfig.BookTitle})
				}
			} else {
				sheets = append(sheets, Sheet{Title: sheetConfig.BookTitle, Artist: sheetConfig.BookArtist, URL: url})
			}
		}
	}

	// process pdf files
	pattern := sheetDir + "/*_*.pdf"
	matches, err := filepath.Glob(pattern)

	if err != nil {
		return nil, err
	}

	for _, match := range matches {
		match = strings.ReplaceAll(match, (sheetDir)+"/", "")

		// skip already processed files
		skip := false
		for _, file := range processed_pdfs {
			if file == match {
				skip = true
				break
			}
		}

		if skip {
			continue
		}

		url := "/sheet/" + url.QueryEscape(match)
		match = strings.ReplaceAll(match, ".pdf", "")
		match = strings.ReplaceAll(match, "-", " ")

		tokens := strings.Split(match, "_")
		caser := cases.Title(language.English, cases.NoLower)
		if len(tokens) == 2 {
			artist := caser.String(strings.ToLower(tokens[0]))
			title := caser.String(strings.ToLower(tokens[1]))
			sheets = append(sheets, Sheet{Title: title, Artist: artist, URL: url})
		}
	}

	return sheets, nil
}
