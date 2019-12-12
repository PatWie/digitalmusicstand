package main

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
)

func CompressPDF(source string, target string) error {
	cmd := "gs"
	args := []string{
		"-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.4",
		"-dPDFSETTINGS=/screen", "-dNOPAUSE", "-dQUIET", "-dBATCH",
		"-sOutputFile=" + target, source}
	return exec.Command(cmd, args...).Run()
}

func FileSize(filename string) int64 {
	fi, err := os.Stat(filename)
	if err != nil {
		return 10000000
	}
	return fi.Size()
}

func FileCopy(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	if err != nil {
		return err
	}
	return out.Close()
}

func CompressPDFinDir(dirname string) error {
	pattern := (dirname) + "/*_*.pdf"
	matches, err := filepath.Glob(pattern)

	if err != nil {
		return err
	}

	for _, match := range matches {
		target := match[:len(match)-3] + "cpdf"

		if _, err := os.Stat(target); os.IsNotExist(err) {
			fmt.Println("Compress", match, target)
			CompressPDF(match, target)
		}

	}
	return nil
}
