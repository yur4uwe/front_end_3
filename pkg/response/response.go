package response

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Response struct {
	Status  string
	Code    int
	Data    interface{}
	Pattern string
}

func (r *Response) JSONify() (string, error) {
	json_repr := "{"

	statusObj := fmt.Sprintf("\"status\": \"%s\"", r.GetStatus())
	json_repr += statusObj + ", "
	codeObj := fmt.Sprintf("\"code\": %d", r.GetCode())
	json_repr += codeObj

	if r.Data != nil {
		dataObj, err := r.StringifyData()
		if err != nil {
			return "", err
		}
		json_repr += ", \"data\": " + dataObj
	}

	if r.GetPattern() != "" {
		patternObj := fmt.Sprintf("\"pattern\": \"%s\"", r.GetPattern())
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

func (r *Response) SetData(data interface{}) *Response {
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

func (r *Response) GetData() interface{} {
	return r.Data
}

func (r *Response) StringifyData() (string, error) {
	data, err := json.Marshal(r.GetData())
	if err != nil {
		return "", err
	}
	return string(data), nil
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
		fmt.Println("Error jsonifying data:", err)
		r.SendError(writer, 500)
		return
	}
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(r.GetCode())
	writer.Write([]byte(json_repr))
}
