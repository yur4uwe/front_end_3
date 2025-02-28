package middleware

import (
	"fmt"
	"net/http"
	"strings"
)

func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		url := fmt.Sprintf("| Request URL: %s", r.URL)
		method := fmt.Sprintf("| Request Method: %s", r.Method)

		// Calculate padding to make the lines equal length
		maxLength := max(len(url), len(method))
		urlPadding := maxLength - len(url) + 1
		methodPadding := maxLength - len(method) + 1

		// Print the formatted log
		fmt.Printf("+%s+\n", strings.Repeat("=", maxLength))
		fmt.Printf("%s%s|\n", url, strings.Repeat(" ", urlPadding))
		fmt.Printf("%s%s|\n", method, strings.Repeat(" ", methodPadding))
		fmt.Printf("+%s+\n", strings.Repeat("=", maxLength))

		next.ServeHTTP(w, r)

		//fmt.Printf("+%s+\n", strings.Repeat("=", maxLength))
	})
}
