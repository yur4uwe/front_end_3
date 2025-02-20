package response

import (
	"encoding/json"
	"fmt"
	"io"
)

type Response struct {
	Status  string
	Code    int
	Data    map[string]string
	Pattern string
}

func (r *Response) JSONify() (string, error) {
	json_repr := fmt.Sprintf("{{\"status\":\"%s\"},{\"code\":%d},{\"data\":\"%s\"},{\"pattern\":\"%s\"}}", r.Status, r.Code, r.StringifyData(), r.Pattern)
	is_valid := json.Valid([]byte(json_repr))

	if is_valid {
		return json_repr, nil
	} else {
		return "", fmt.Errorf("invalid json")
	}
}

func InitRes() Response {
	return Response{}
}

func (r *Response) SetStatus(status string) {
	r.Status = status
}

func (r *Response) SetCode(code int) {
	r.Code = code
}

func (r *Response) SetData(data map[string]string) {
	r.Data = data
}

func (r *Response) SetPattern(pattern string) {
	r.Pattern = pattern
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
	var data string
	for key, value := range r.Data {
		data += key + ": " + value + "\n"
	}
	return data
}

func (r *Response) GetPattern() string {
	return r.Pattern
}

func (r *Response) Send(writer io.Writer) {
	json_repr, err := r.JSONify()
	if err != nil {
		fmt.Println(err)
		return
	}
	writer.Write([]byte(json_repr))
}
