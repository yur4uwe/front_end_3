import { API, Methods } from '../api/requester.js';

class Home extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                h1 {
                    color: #333;
                    font-family: 'Arial', sans-serif;
                }
                p {
                    color: #666;
                    font-family: 'Arial', sans-serif;
                }
            </style>
            <h1>Home</h1>
            <p>Welcome to the home page!</p>
            <form id="login">
                <input type="text" name="username" placeholder="Username" required> 
            </form>
            <button id="start">Start</button>
        `;

        this.shadowRoot.getElementById('login').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const username = formData.get('username');

            const response = await API.requestBuilder()
                .url('/api/login')
                .method(Methods.POST)
                .body({ username })
                .send();

            console.log(response);
        });

        this.shadowRoot.getElementById('start').addEventListener('click', async () => {
            const response = await API.requestBuilder()
                .url('/api/start')
                .method(API.Methods.POST)
                .send();
            console.log(response);
        });
    }
}

customElements.define('game-home', Home);