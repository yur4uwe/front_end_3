import API from '../api/requester.js';
import { navigate } from '../api/router.js';

class Home extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    font-family: 'Arial', sans-serif;
                }
                #login {
                    display: flex;
                    align-items: center;
                }
            </style>
            <h1>Home</h1>
            <p>Welcome to the home page!</p>
            <form id="login">
                <input type="text" name="username" placeholder="Username" required> 
                <button type="submit">Start</button>
            </form>
        `;

        this.shadowRoot.getElementById('login').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const username = formData.get('username');

            const response = await API.requestBuilder()
                .url('/api/login')
                .method(API.Methods.POST)
                .body({ username })
                .send();

            console.log(response);

            if (response.status === "success") {
                navigate('/game');
            }
        });
    }
}

customElements.define('game-home', Home);