import { API } from '../api/requester.js';

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
            <button id="start">Start</button>
        `;

        this.shadowRoot.getElementById('start').addEventListener('click', async () => {
            const response = await API.requestBuilder()
                .url('/api/start')
                .method('POST')
                .token('Bearer token')
                .send();
            console.log(response);
        });
    }
}

customElements.define('game-home', Home);