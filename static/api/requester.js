//use builder + currying

/**
 * @typedef {Object} Methods
 * @property {string} GET
 * @property {string} POST
 * @property {string} PUT
 * @property {string} DELETE
 */

/**
 * Class representing HTTP methods.
 */
class Methods {
    constructor() {
        this.GET = "GET";
        this.POST = "POST";
        this.PUT = "PUT";
        this.DELETE = "DELETE";
    }
}

/**
 * Class representing a Requester.
 */
class Requester {
    /**
     * Creates an instance of Requester.
     * @param {string} baseUrl - The base URL for the API.
     */
    constructor(baseUrl) {
        this.Methods = new Methods();
        Object.freeze(this.Methods);
        Object.defineProperty(this, 'baseUrl', {
            value: baseUrl,
            writable: false,
            configurable: false
        });
    }

    /**
     * Parses the URL.
     * @param {string} url - The URL to parse.
     * @returns {string} The full URL.
     */
    parseUrl(url) {
        return this.baseUrl + url;
    }

    /**
     * Makes an HTTP request.
     * @param {Object} params - The request parameters.
     * @param {string} params.url - The URL for the request.
     * @param {string} params.method - The HTTP method.
     * @param {Object} [params.body] - The request body.
     * @param {string} [params.token] - The authorization token.
     * @returns {Promise<Object>} The response data.
     */
    async makeRequest({ url, method, body }) {
        const response = await fetch(this.parseUrl(url), {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
            },
            body: body ? JSON.stringify(body) : null
        });
        return response.json();
    }

    setToken(token) {
        this.token = token;
    }

    /**
     * Creates a new RequestBuilder instance.
     * @returns {RequestBuilder} The RequestBuilder instance.
     */
    requestBuilder() {
        return new RequestBuilder(this);
    }
}

/**
 * Class representing a RequestBuilder.
 */
class RequestBuilder {
    /**
     * Creates an instance of RequestBuilder.
     * @param {Requester} api - The Requester instance.
     */
    constructor(api) {
        this.api = api;
        this.params = {};
    }

    /**
     * Sets the URL for the request.
     * @param {string} url - The URL.
     * @returns {RequestBuilder} The RequestBuilder instance.
     */
    url(url) {
        this.params.url = url;
        return this;
    }

    /**
     * Sets the HTTP method for the request.
     * @param {string} method - The HTTP method.
     * @returns {RequestBuilder} The RequestBuilder instance.
     */
    method(method) {
        this.params.method = method;
        return this;
    }

    /**
     * Sets the body for the request.
     * @param {Object} body - The request body.
     * @returns {RequestBuilder} The RequestBuilder instance.
     */
    body(body) {
        this.params.body = body;
        return this;
    }

    /**
     * Sets the authorization token for the request.
     * @param {string} token - The authorization token.
     * @returns {RequestBuilder} The RequestBuilder instance.
     */
    // token(token) {
    //     this.params.token = token;
    //     return this;
    // }

    /**
     * Sends the request.
     * @returns {Promise<Object>} The response data.
     */
    async send() {
        return this.api.makeRequest(this.params);
    }
}

// Usage example:
// const api = new API('https://api.example.com/api').setToken('token');
// api.requestBuilder()
//     .url('/endpoint')
//     .method(API.get)
//     .send()
//     .then(response => console.log(response));

const API = new Requester('http://localhost:8080');

export default API;