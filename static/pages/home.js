import API from '../api/requester.js';
import { navigate } from '../api/router.js';

function parseTime(time) {
    const date = new Date(time);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

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
            <div id="prev-scores"></div>
        `;

        const userName = localStorage.getItem("username");
        if (userName) {
            this.shadowRoot.getElementById('login').querySelector("input[type=text]").value = userName;
        }

        const scores = this.shadowRoot.getElementById('prev-scores');
        API.requestBuilder()
            .url('/api/scores')
            .method(API.Methods.GET)
            .param([
                { paramName: "username", paramVal: userName },
                { paramName: "limit", paramVal: 5 }
            ])
            .send()

            .then(response => {
                /**
                 * @type {{score:number,username:string,time:string}[]} lastScores
                 */
                const lastScores = response.data;
                console.log(lastScores);
                if (response.status === "success") {
                    scores.innerHTML = "<h2>Previous Scores</h2>";
                    if (response.data.length === 0) {
                        scores.innerHTML += "<p>No scores yet</p>";
                    }

                    scores.innerHTML += lastScores.map(score => `<p> Score: ${score.score} at ${parseTime(score.time)}</p>`).join('');
                }
            });

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
            localStorage.setItem('username', username);

            if (response.status === "success") {
                navigate('/game');
            }
        });
    }
}

customElements.define('game-home', Home);