//use builder + currying

class Requester {
    static get = "GET";
    static post = "POST";
    static put = "PUT";
    static delete = "DELETE";

    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * @param {string} url 
     * @returns {string}
     */
    parseUrl(url) {
        return this.baseUrl + url;
    }

    async makeRequest({ url, method, body, token }) {
        const response = await fetch(this.parseUrl(url), {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: body ? JSON.stringify(body) : null
        });
        return response.json();
    }

    requestBuilder() {
        return new RequestBuilder(this);
    }
}

class RequestBuilder {
    constructor(api) {
        this.api = api;
        this.params = {};
    }
    /**
     * 
     * @param {string} url 
     * @returns {RequestBuilder}
     */
    url(url) {
        this.params.url = url;
        return this;
    }

    /**
     * @param {string} method 
     * @returns {RequestBuilder}
     */
    method(method) {
        this.params.method = method;
        return this;
    }

    /**
     * @param {string} body 
     * @returns {RequestBuilder}
     */
    body(body) {
        this.params.body = body;
        return this;
    }

    /**
     * @param {string} token 
     * @returns {RequestBuilder}
     */
    token(token) {
        this.params.token = token;
        return this;
    }

    async send() {
        return this.api.makeRequest(this.params);
    }
}

// Usage example:
// const api = new API('https://api.example.com/api');
// api.requestBuilder()
//     .url('/endpoint')
//     .method(API.get)
//     .token('your-token')
//     .send()
//     .then(response => console.log(response));

const API = new Requester('http://localhost:8080');

export default API;