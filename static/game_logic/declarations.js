
const GRAVITY = 0.98;
const JUMP = 20;

class Obstacle {
    /**
     * @param {{x: number, y: number, width: number, height: number, color: string}} param0 
     */
    constructor({ x, y, width, height, color }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    /**
     * @param {Entity} entity 
     * @returns {boolean} 
     */
    checkCollision(entity) {
        return this.x < entity.x + entity.width &&
            this.x + this.width > entity.x &&
            this.y < entity.y + entity.height &&
            this.y + this.height > entity.y;
    }

    level() {
        return this.y;
    }

    onGround(entity) {
        return this.y <= entity.y + entity.height;
    }
}

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
     * @param {number} groundLevel
     * @returns {Entity}
     */
    nextPosition(groundLevel) {
        console.log('nextPosition:', this.x, this.y, this.movement_x, this.movement_y);
        this.x += this.movement_x;

        if (this.movement_y === -JUMP && groundLevel <= this.y + this.height) {
            console.log('jump');
            this.movement_y = -JUMP;
            this.y += this.movement_y;
        } else if (this.movement_y !== -1 && this.movement_y !== -1 + GRAVITY) {
            this.y = groundLevel < this.y + this.height + 2 ? groundLevel - this.height : this.y + this.movement_y;
        }

        if (groundLevel <= this.y + this.height) {
            this.movement_y = 0;
        } else {
            this.movement_y += GRAVITY;
        }

        return this;
    }

    /**
     * @param {number} movement_x 
     * @param {number} movement_y 
     * @param {number} ground
     * @returns {Entity}
     */
    newMovement(movement_x, movement_y, groundLevel) {
        //console.log('newMovement:', movement_x, movement_y);

        this.movement_x = movement_x !== null ? movement_x : this.movement_x;

        if (movement_y === -1 && groundLevel <= this.y + this.height) {
            movement_y = -JUMP;
        }

        this.movement_y = movement_y !== null ? movement_y : this.movement_y;

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
        this.ground = new Obstacle({
            x: 0,
            y: 2 * window.innerHeight / 3,
            width: window.innerWidth,
            height: window.innerHeight / 3,
            color: 'green'
        });
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
        this.player.nextPosition(this.ground.level());
        this.enemies.forEach(enemy => enemy.nextPosition(this.ground.level()));
        this.ground.checkCollision(this.player) ? this.player.newMovement(null, 0, this.ground.level()) : null;

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

        ctx.fillStyle = this.ground.color;
        ctx.fillRect(this.ground.x, this.ground.y, this.ground.width, this.ground.height);

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
                this.player.newMovement(movement.x || null, movement.y || null, this.ground.level());
            } else if (event.type === 'keyup') {
                const key = event.key;
                const movement = keyToMovement[key];
                this.player.newMovement(movement.x ? 0 : null, movement.y ? 0 : null, this.ground.level());
            }
        }
        return this;
    }
}

export { GameEntities, Entity };