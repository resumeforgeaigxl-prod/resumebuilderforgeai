package main

import (
	"bytes"
	"fmt"
	"os"

	"github.com/ledongthuc/pdf"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "Usage: pdf-parser <pdf-file-path>")
		os.Exit(1)
	}

	pdfPath := os.Args[1]

	content, err := readPdf(pdfPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading PDF: %v\n", err)
		os.Exit(1)
	}

	fmt.Print(content)
}

func readPdf(path string) (string, error) {
	f, r, err := pdf.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()

	var buf bytes.Buffer
	b, err := r.GetPlainText()
	if err != nil {
		return "", err
	}
	_, err = buf.ReadFrom(b)
	if err != nil {
		return "", err
	}

	return buf.String(), nil
}
