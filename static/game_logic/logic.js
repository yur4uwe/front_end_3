import { GameEntities } from './declarations.js';

let fps = 0;

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

const acceptedKeys = ["w", "a", "s", "d"];

/**
 * @param {GameEntities} state 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} windowHeight
 * @param {number} windowWidth
 * @param {HTMLHeadingElement} warningElement
 * @param {HTMLHeadingElement} scoreElement
 */
const gameLoop = (state, ctx, windowHeight, windowWidth, warningElement, scoreElement) => {
    fps++;
    const capturedEvents = events.splice(0, events.length);

    ctx.clearRect(0, 0, windowWidth, windowHeight);

    if (!ctx) {
        console.error('Canvas not found');
        return;
    } else if (!state) {
        state = new GameEntities();
        setInterval(() => state.addEnemy(warningElement), 10000);
    }

    state = state
        .readEvents(capturedEvents.filter(event => event.type === 'keydown' || event.type === 'keyup'))
        .determineInteractions()
        .nextState()
        .drawState(ctx);

    eventCapturer();

    requestAnimationFrame(() => gameLoop(state, ctx, windowHeight, windowWidth));
};

export { gameLoop, drawFps };