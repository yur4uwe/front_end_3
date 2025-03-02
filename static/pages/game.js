import { gameLoop, drawFps, resumeGame } from '../game_logic/logic.js';
import { navigate } from '../api/router.js';
import API from '../api/requester.js';
import { GameEntities } from '../game_logic/declarations.js';

class Game extends HTMLElement {
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
                    font-family: 'Arial', sans-serif;
                }
                canvas {
                    display: block;
                    width: 100%;
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
            <h2 id="warning"></h2>
            <canvas id="game"></canvas>
        `;
    }

    connectedCallback() {
        this.startGameLoop(this.state);
    }

    /**
     * 
     * @param {number} score 
     */
    gameEnd(score) {
        console.log("Game ended");

        this.gameMenu(false, score);
    }

    /**
     * 
     * @param {number} score 
     * @param {GameEntities} state 
     */
    gamePause(score, state) {
        console.log("Game paused");

        this.gameMenu(true, score, state);
    }

    /**
     * 
     * @param {GameEntities} state 
     */
    async startGameLoop(state) {
        const canvas = this.shadowRoot.getElementById('game');

        // Set the canvas size to match the display size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const ctx = canvas.getContext('2d');

        console.log("Game screen loaded, starting game loop");
        setInterval(() => drawFps(this.shadowRoot.getElementById("fps")), 1000);
        gameLoop(state, ctx, window.innerHeight, window.innerWidth, this.shadowRoot.getElementById("warning"), this, true);
    }

    /**
     * @param {boolean} isPaused
     * @param {boolean} score  true if game is paused, false if game is over
     * @param {GameEntities | null} state 
     */
    gameMenu(isPaused, score, state = null) {
        console.log("Game menu");
        const canvas = this.shadowRoot.getElementById("game");
        /**
         * @type {CanvasRenderingContext2D} ctx
         */
        const ctx = canvas.getContext('2d');

        ctx.filter = 'blur(50px)';
        ctx.drawImage(canvas, 0, 0);

        const gameMenu = document.createElement('div');
        gameMenu.id = 'gameMenu';
        gameMenu.style = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            padding: 10px;
        `;

        const endGameText = document.createElement('h1');
        endGameText.innerText = isPaused ? "Game Paused" : 'Game Over';

        gameMenu.appendChild(endGameText);

        const scoreEl = document.createElement('h2');
        scoreEl.innerText = `Score: ${score}`;

        gameMenu.appendChild(scoreEl);

        const gameWillProceed = document.createElement('button');
        gameWillProceed.innerText = isPaused ? 'Resume' : 'Restart';
        gameWillProceed.addEventListener('click', () => {
            ctx.filter = 'none';
            if (isPaused) {
                this.shadowRoot.getElementById("gameMenu").remove();
                resumeGame(state, ctx, window.innerHeight, window.innerWidth, this.shadowRoot.getElementById("warning"), this);
            } else {
                navigate("/game", state);
            }
        });

        const Exit = document.createElement('button');
        Exit.innerText = 'Exit';
        Exit.addEventListener('click', () => {
            ctx.filter = 'none';
            navigate("/");
        });

        gameWillProceed.style = `
            width: 100px; 
            height: 30px;
            margin: 5px;
        `;
        Exit.style = `
            width: 100px; 
            height: 30px;
            margin: 5px;
        `;

        const container = document.createElement('div');
        container.style = `
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-around;
            width: 100%;
        `;

        container.appendChild(gameWillProceed);
        container.appendChild(Exit);

        gameMenu.appendChild(container);

        this.shadowRoot.appendChild(gameMenu);

        if (!isPaused) {
            const username = localStorage.getItem('username');

            API.requestBuilder()
                .url('/api/score')
                .method('POST')
                .body({ username, score, time: new Date().toISOString() })
                .send()
                .then(() => console.log('Score sent to server'))
                .catch((err) => console.error(err));
        }
    }
}

customElements.define('game-screen', Game);