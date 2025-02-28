import { GameEntities } from './declarations.js';

let fps = 0;
let animationFrameId = null;

/**
 * @param {HTMLHeadingElement} element 
 */
const drawFps = (element) => {
    element.innerText = `FPS: ${fps}`;
    fps = 0;
};

/**
 * @type {Event[]} events
 */
const events = [];
const eventClearer = () => events.splice(0, events.length);
const eventCapturer = () => {
    document.addEventListener('keydown', (event) => acceptedKeys.includes(event.key) ? events.push(event) : null);
    document.addEventListener('keyup', (event) => acceptedKeys.includes(event.key) ? events.push(event) : null);
    document.addEventListener('mousedown', (event) => events.push(event));
    document.addEventListener('mouseup', (event) => events.push(event));
};

const acceptedKeys = ["w", "a", "s", "d", "A", "D", "escape", " ", "Shift"];

let enemySpawnInterval = null;

/**
 * @param {GameEntities} state 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} windowHeight
 * @param {number} windowWidth
 * @param {HTMLHeadingElement} warningElement
 * @param {HTMLElement} parentElement
 */
const gameLoop = (state, ctx, windowHeight, windowWidth, warningElement, parentElement) => {
    fps++;
    const capturedEvents = events.splice(0, events.length);

    ctx.clearRect(0, 0, windowWidth, windowHeight);

    if (!ctx) {
        console.error('Canvas not found');
        return;
    } else if (!state) {
        state = new GameEntities();
        enemySpawnInterval = setInterval(() => state.addEnemy(warningElement), 8000);
    }

    state = state
        .readEvents(capturedEvents.filter(event => event.type === 'keydown' || event.type === 'keyup'))
        .determineInteractions()
        .nextState()
        .drawState(ctx);

    if (state.player.lives <= 0) {
        clearInterval(enemySpawnInterval);
        cancelAnimationFrame(animationFrameId);
        parentElement.gameEnd(state.player.score);
        return;
    }

    eventCapturer();

    animationFrameId = requestAnimationFrame(() => gameLoop(state, ctx, windowHeight, windowWidth, warningElement, parentElement));
};

export { gameLoop, drawFps };