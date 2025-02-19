document.addEventListener('DOMContentLoaded', function () {
    const router = () => {
        const path = window.location.pathname;
        const routes = ["/", "/game", "/scoreboard"];
        const main = document.getElementById("main");

        if (routes.includes(path)) {
            const page = path === "/" ? "home" : path.split("/")[1];
            switch (page) {
                case "home":
                    main.appendChild(document.createElement("game-home"));
                    break;
                case "game":
                    main.appendChild(document.createElement("game-screen"));
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
});

const navigate = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
};