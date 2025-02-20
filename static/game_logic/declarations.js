
class Entity {
    /**
     * @param {{x: number, y: number, width: number, height: number, color: string, movement_x: number, movement_y: number }} param0 
     */
    constructor({ x, y, width, height, color, movement_x = 0, movement_y = 0 }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.movement_x = movement_x;
        this.movement_y = movement_y;
    }
    /**
     * @returns {Entity}
     */
    nextPosition() {
        this.x += this.movement_x;
        this.y += this.movement_y;

        return this;
    }

    /**
     * @param {number} movement_x 
     * @param {number} movement_y 
     * @returns {Entity}
     */
    newMovement(movement_x, movement_y) {
        this.movement_x = movement_x;
        this.movement_y = movement_y;

        return this;
    }
}

const playerInitPosition = {
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    color: 'red'
};

const keyToMovement = {
    w: { y: -1 },
    a: { x: -1 },
    s: { y: 1 },
    d: { x: 1 }
};

class GameEntities {
    constructor() {
        console.log('GameEntities constructor');
        this.player = new Entity(playerInitPosition);
        this.enemies = [];
    }

    addEnemy() {
        const enemy = new Entity({
            x: Math.random() * 100,
            y: Math.random() * 100,
            width: 50,
            height: 50,
            color: 'blue'
        });
        this.enemies.push(enemy);
    }

    nextState() {
        this.player.nextPosition();
        this.enemies.forEach(enemy => enemy.nextPosition());

        return this;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @returns {GameEntities}
     */
    drawState(ctx) {
        ctx.fillStyle = this.player.color;
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        this.enemies.forEach(enemy => {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });

        return this;
    }

    /**
     * @param {Event[]} events 
     * @returns {GameEntities}
     */
    readEvents(events) {
        for (const event of events) {
            if (event.type === 'keydown') {
                const key = event.key;
                const movement = keyToMovement[key];
                this.player.newMovement(movement.x || 0, movement.y || 0);
            } else if (event.type === 'keyup') {
                this.player.newMovement(0, 0);
            }
        }
        return this;
    }
}

export { GameEntities, Entity };