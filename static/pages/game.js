class Game extends HTMLElement {
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
            <h1>Game</h1>
            <p>Welcome to the game page!</p>
            <button id="start">Start</button>
        `;
    }
}

customElements.define('game-screen', Game);