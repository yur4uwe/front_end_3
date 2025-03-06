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
                    background-image: url(/img/depositphotos_67982979-stock-illustration-horizontally-seamless-game-background.jpg);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    font-family: 'Arial', sans-serif;
                    
                }
                :host > div {
                    padding: 20px;
                    margin: 10px;
                    border-radius: 10px;
                    background-color:rgba(218, 217, 217, 0.56);
                }
                :host > div > h1, h2 {
                    text-align: center;
                }
                #login {
                    display: flex;
                    align-items: center;
                    margin-top: 20px;
                    flex-direction: column;
                }
                #login input {
                    padding: 10px;
                    margin-bottom: 10px;
                    border-radius: 5px;
                    border: 1px solid #ccc;
                }
                #login button {
                    font-size: 2rem;
                    padding: 10px 50px;
                    border-radius: 5px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    cursor: pointer;
                }
            </style>
            <div>
            <h1>Home</h1>
            <hr>
            <p>Welcome to the home page!</p>
            <form id="login">
                <input type="text" name="username" placeholder="Username" required> 
                <button type="submit">Start</button>
            </form>
            </div>
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
                    scores.style.display = 'block';
                    scores.innerHTML = "<h2>Previous Scores</h2><hr>";

                    if (response.data.length === 0) {
                        scores.innerHTML += "<p>No scores yet</p>";
                    }

                    localStorage.setItem('lastScores', JSON.stringify(lastScores[0]));

                    scores.innerHTML += lastScores.map(score => `<p> Score: ${score.score} at ${parseTime(score.time)}</p>`).join('');
                } else {
                    scores.style.display = 'none';
                }
            }).catch((err) => {
                scores.style.display = 'none';
                console.error("Failed to load scores: ", err);
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