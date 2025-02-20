package main

import (
	"fmt"
	"fr_lab_3/pkg/handlers"
	"fr_lab_3/pkg/middleware"
	"net/http"
)

func main() {
	fs := http.FileServer(http.Dir("../static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	http.HandleFunc("/", handlers.Home)
	http.HandleFunc("/api/login", handlers.Login)

	handler := middleware.Logger(http.DefaultServeMux)

	fmt.Println("Server is running on port 8080")
	http.ListenAndServe(":8080", handler)

}
