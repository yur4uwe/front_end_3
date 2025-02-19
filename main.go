package main

import (
	"fmt"
	"net/http"
)

func main() {
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/", fs)

	handler := http.DefaultServeMux

	http.ListenAndServe(":8080", handler)
	fmt.Println("Server is running on port 8080")
}
