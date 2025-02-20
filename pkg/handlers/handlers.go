package handlers

import (
	"fmt"
	"net/http"

	"fr_lab_3/pkg/response"
	"fr_lab_3/pkg/token"
)

func Home(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Home handler")

	http.ServeFile(w, r, "../static/index.html")
}

func Login(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Login handler")

	token := token.CreateToken("login")
	fmt.Println("Token: ", token)

	res := response.InitRes()

	res.SetStatus("success").
		SetCode(http.StatusOK).
		SetData(map[string]string{"token": token}).
		SetPattern("{token: string}").
		Send(w)
}
