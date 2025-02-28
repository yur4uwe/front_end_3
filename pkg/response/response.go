package response

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Response struct {
	Status  string
	Code    int
	Data    map[string]string
	Pattern string
}

func (r *Response) JSONify() (string, error) {

	json_repr := "{"

	statusObj := fmt.Sprintf("\"status\": \"%s\"", r.GetStatus())
	json_repr += statusObj + ", "
	codeObj := fmt.Sprintf("\"code\": %d", r.GetCode())
	json_repr += codeObj

	var dataObj string
	if r.Data != nil {
		dataObj = fmt.Sprintf("\"data\": %s", r.StringifyData())
		json_repr += ", " + dataObj
	}

	var patternObj string
	if r.GetPattern() != "" {
		patternObj = fmt.Sprintf("\"pattern\": \"%s\"", r.GetPattern())
		json_repr += ", " + patternObj
	}

	json_repr += "}"

	fmt.Println(json_repr)

	is_valid := json.Valid([]byte(json_repr))

	if is_valid {
		return json_repr, nil
	} else {
		return "", fmt.Errorf("invalid json")
	}
}

func InitRes() *Response {
	return &Response{}
}

func (r *Response) SetStatus(status string) *Response {
	r.Status = status
	return r
}

func (r *Response) SetCode(code int) *Response {
	r.Code = code
	return r
}

func (r *Response) SetData(data map[string]string) *Response {
	r.Data = data
	return r
}

// SetPattern sets the pattern for response body.
// pattern is a string that describes JSON structure of the data field.
// Is used for parsing purposes on the client and server side.
func (r *Response) SetPattern(pattern string) *Response {
	r.Pattern = pattern
	return r
}

func (r *Response) GetStatus() string {
	return r.Status
}

func (r *Response) GetCode() int {
	return r.Code
}

func (r *Response) GetData() map[string]string {
	return r.Data
}

func (r *Response) StringifyData() string {
	data := r.GetData()
	var data_str string = "{"
	for key, value := range data {
		data_str += fmt.Sprintf("\"%s\":\"%s\",", key, value)
	}
	data_str = data_str[:len(data_str)-1] + "}"
	return data_str
}

func (r *Response) GetPattern() string {
	return r.Pattern
}

func (r *Response) SendError(w http.ResponseWriter, statusCode int) {
	r.SetStatus("error").
		SetCode(statusCode).
		Send(w)
}

func (r *Response) Send(writer http.ResponseWriter) {
	json_repr, err := r.JSONify()
	if err != nil {
		fmt.Println(err)
		r.SendError(writer, 500)
		return
	}
	writer.Write([]byte(json_repr))
}
