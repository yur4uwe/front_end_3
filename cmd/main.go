package main

import (
	"fmt"
	"fr_lab_3/pkg/handlers"
	"net/http"
)

func main() {
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/", fs)

	http.HandleFunc("/api/login", handlers.Login)

	handler := http.DefaultServeMux

	http.ListenAndServe(":8080", handler)
	fmt.Println("Server is running on port 8080")
}
