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
                h3 {
                    position: absolute;
                    top: 0;
                    right: 0;
                    margin: 10px;
                    font-family: 'Arial', sans-serif;
                }
            </style>
            <h3 id="fps"></h3>
            <canvas id="game"></canvas>
        `;

        /**
         * @type {HTMLCanvasElement} canvas
         */
        const canvas = this.shadowRoot.getElementById('game');
        const ctx = canvas.getContext('2d');

        console.log("Game screen loaded, starting game loop");
        setInterval(() => drawFps(this.shadowRoot.getElementById("fps")), 1000);
        gameLoop(null, ctx, window.innerHeight, window.innerWidth);
    }
}

customElements.define('game-screen', Game);