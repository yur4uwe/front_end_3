package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"sort"
	"strconv"

	"fr_lab_3/pkg/response"
)

type Score struct {
	Username string `json:"username"`
	Score    int    `json:"score"`
	Time     string `json:"time"`
}

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

func NewScore(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Score handler")

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

func GetScore(w http.ResponseWriter, r *http.Request) {
	fmt.Println("GetScore handler")

	params := r.URL.Query()
	username := params["username"]
	limit, err := strconv.Atoi(params["limit"][0])
	if err != nil {
		fmt.Println("Error parsing limit", err)
		response.InitRes().SendError(w, http.StatusBadRequest)
		return
	}

	fmt.Println("Username: ", username)
	if username[0] == "null" {
		fmt.Println("No username or limit provided")
		response.InitRes().
			SetStatus("unathorized").
			SetCode(http.StatusUnauthorized).
			Send(w)
		return
	}

	file, err := os.ReadFile("../data/user_data.json")
	if err != nil {
		fmt.Println("Error reading user data file", err)
		response.InitRes().SendError(w, http.StatusInternalServerError)
		return
	}

	var data []Score
	err = json.Unmarshal(file, &data)
	if err != nil {
		fmt.Println("Error unmarshalling user data", err)
		response.InitRes().SendError(w, http.StatusInternalServerError)
		return
	}

	sort.Slice(data, func(i, j int) bool {
		return data[i].Score > data[j].Score
	})

	var scores []Score
	for _, score := range data {
		if score.Username == username[0] {
			scores = append(scores, score)
		}
		if len(scores) == limit && limit != 0 {
			break
		}
	}

	res := response.InitRes()
	res.SetStatus("success").
		SetCode(http.StatusOK).
		SetData(scores).
		Send(w)
}
