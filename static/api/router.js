import { GameEntities } from "../game_logic/declarations.js";

document.addEventListener('DOMContentLoaded', function () {
    /**
     * 
     * @param {PopStateEvent} event 
     */
    const router = (event) => {
        const path = window.location.pathname;
        const routes = ["/", "/game", "/scoreboard"];
        const main = document.getElementById("main");
        main.innerHTML = "";

        if (routes.includes(path)) {
            const page = path === "/" ? "home" : path.split("/")[1];
            switch (page) {
                case "home":
                    main.appendChild(document.createElement("game-home"));
                    break;
                case "game":
                    let gameState = null;

                    if (!event) {
                        console.log("No event");
                        console.log(event);
                        gameState = new GameEntities();
                    } else {
                        console.log("Event");
                        console.log(event.state);
                        gameState = event.state || new GameEntities();
                    }

                    const gameScreen = document.createElement("game-screen");
                    gameScreen.state = gameState;
                    main.appendChild(gameScreen);
                    break;
                case "scoreboard":
                    main.appendChild(document.createElement("game-scoreboard"));
                    break;
                default:
                    break;
            }
        } else {
            navigate("/");
        }
    }

    window.addEventListener("popstate", router);

    router();
});

/**
 * @param {string} path 
 * @param {GameEntities | null} state 
 */
const navigate = (path, state = null) => {
    window.history.pushState(state, '', path);
    window.dispatchEvent(new PopStateEvent('popstate', { state }));
};

export { navigate };