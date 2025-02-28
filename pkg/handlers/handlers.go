package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"fr_lab_3/pkg/response"
)

func Home(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Home handler")

	http.ServeFile(w, r, "../static/index.html")
}

func Login(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Login handler")

	res := response.InitRes()

	res.SetStatus("success").
		SetCode(http.StatusOK).
		Send(w)
}

func Score(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Score handler")
	type Score struct {
		Username string `json:"username"`
		Score    int    `json:"score"`
		Time     string `json:"time"`
	}

	var score Score
	body, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Println(err)
		res := response.InitRes()
		res.SendError(w, http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	err = json.Unmarshal(body, &score)
	if err != nil {
		fmt.Println(err)
		response.InitRes().SendError(w, http.StatusBadRequest)
		return
	}

	fmt.Println("Score: ", score)

	file, err := os.ReadFile("../data/user_data.json")
	if err != nil {
		fmt.Println(err)
		response.InitRes().SendError(w, http.StatusInternalServerError)
		return
	}

	var data []Score
	err = json.Unmarshal(file, &data)
	if err != nil {
		fmt.Println(err)
		response.InitRes().SendError(w, http.StatusInternalServerError)
		return
	}

	data = append(data, score)

	file, err = json.Marshal(data)
	if err != nil {
		fmt.Println(err)
		response.InitRes().SendError(w, http.StatusInternalServerError)
		return
	}

	err = os.WriteFile("../data/user_data.json", file, 0644)
	if err != nil {
		fmt.Println(err)
		response.InitRes().SendError(w, http.StatusInternalServerError)
		return
	}

	res := response.InitRes()
	res.SetStatus("success").
		SetCode(http.StatusOK).
		Send(w)
}
