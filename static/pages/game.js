import { gameLoop, drawFps } from '../game_logic/logic.js';

class Game extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                canvas {
                    display: block;
                    margin: 0 auto;
                    width: calc(100vw - 20px);
                    height: calc(100vh - 20px);
                }
                #fps {
                    position: absolute;
                    top: 0;
                    right: 0;
                    margin: 10px;
                    font-family: 'Arial', sans-serif;
                }
                #score {
                    position: absolute;
                    top: 0;
                    left: 0;
                    margin: 10px;
                    font-family: 'Arial', sans-serif;
                }
                #warning {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-family: 'Arial', sans-serif;
                    color: red;
                }
            </style>
            <h3 id="fps"></h3>
            <h3 id="score"></h3>
            <h2 id="warning"></h2>
            <canvas id="game"></canvas>
        `;

        /**
         * @type {HTMLCanvasElement} canvas
         */
        const canvas = this.shadowRoot.getElementById('game');

        // Set the canvas size to match the display size
        canvas.width = window.innerWidth - 20;
        canvas.height = window.innerHeight - 20;

        const ctx = canvas.getContext('2d');

        console.log("Game screen loaded, starting game loop");
        setInterval(() => drawFps(this.shadowRoot.getElementById("fps")), 1000);
        gameLoop(null, ctx, window.innerHeight, window.innerWidth, this.shadowRoot.getElementById("warning"), this.shadowRoot.getElementById("score"));
    }
}

customElements.define('game-screen', Game);