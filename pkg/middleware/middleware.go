package middleware

import (
	"fmt"
	"net/http"
)

func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Request URL: ", r.URL)
		fmt.Println("Request Method: ", r.Method)
		fmt.Print("+=============================+\n")

		next.ServeHTTP(w, r)

		fmt.Println("\n+=============================+")
	})
}
