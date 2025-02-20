package handlers

import (
	"fmt"
	"net/http"

	"fr_lab_3/pkg/token"
)

func Login(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Login handler")

	token := token.CreateToken("login")
	fmt.Println("Token: ", token)

	w.Write([]byte("Login handler"))
}
