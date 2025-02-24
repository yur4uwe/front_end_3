
const GRAVITY = 1;
const JUMP = 20;
const HORIZONTAL_SPEED = 5;

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

    size() {
        return { left: this.x, right: this.x + this.width, top: this.y, bottom: this.y + this.height };
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
     * @param {{left: number, right: number, top: number, bottom: number}[]} obstacles
     * @returns {Entity}
     */
    nextPosition(groundLevel, obstacles) {
        //console.log('nextPosition:', this.x, this.y, this.movement_x, this.movement_y);

        const relevantObstacles = obstacles.filter(obstacle => obstacle.left <= this.x + this.width && obstacle.right >= this.x);

        const onGround = relevantObstacles.some(obstacle => obstacle.top <= this.y + this.height + 1 && obstacle.bottom >= this.y + this.height + 1);
        const underCeiling = relevantObstacles.some(obstacle => obstacle.top <= this.y && obstacle.bottom >= this.y);

        this.x += this.movement_x * HORIZONTAL_SPEED;

        if (this.y + this.height < groundLevel && !onGround) {
            this.movement_y += GRAVITY;
        } else if (this.movement_y === -1 && groundLevel <= this.y + this.height) {
            this.movement_y = -JUMP;
        } else if (this.y + this.height > groundLevel) {
            this.movement_y = 0;
            this.y = groundLevel - this.height;
        }

        if (this.movement_y === -1 && onGround) {
            this.movement_y = -JUMP;
        } else if (onGround) {
            this.movement_y = 0;
            relevantObstacles.forEach(obstacle => {
                if (obstacle.top <= this.y + this.height && obstacle.bottom >= this.y + this.height) {
                    this.y = obstacle.top - this.height;
                }
            });
        }

        if (underCeiling) {
            this.movement_y = GRAVITY;
        }

        this.y += this.movement_y;

        return this;
    }

    /**
     * @param {number} movement_x 
     * @param {number} movement_y 
     * @param {number} ground
     * @returns {Entity}
     */
    newMovement(movement_x, movement_y, groundLevel, obstacles) {
        // console.log("input Movement:", movement_x, movement_y);
        //console.log('current Movement:', this.movement_x, this.movement_y);

        this.movement_x = movement_x !== null ? movement_x : this.movement_x;

        const onGround = this.y + this.height >= groundLevel || obstacles.some(obstacle =>
            obstacle.top <= this.y + this.height && obstacle.bottom >= this.y + this.height &&
            obstacle.left <= this.x + this.width && obstacle.right >= this.x
        );
        // const isJumping = this.movement_y < 0;
        // const isFalling = this.movement_y > 0;

        this.movement_y = movement_y !== null && onGround ? movement_y : this.movement_y;

        return this;
    }

    /**
     * @param {function callback() {}} callback 
     * @returns 
     */
    movementPattern(callback) {

        return this
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
        this.platforms = [new Obstacle({
            x: 100,
            y: this.ground.y - 150,
            width: 300,
            height: 10,
            color: 'black'
        })];

        setInterval(() => this.addEnemy(), 1000 * 10);
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
        const platformParams = this.platforms.map(platform => platform.size());
        const groundLevel = this.ground.size().top;

        this.player.nextPosition(groundLevel, platformParams);
        this.enemies.forEach(enemy => enemy.nextPosition(groundLevel, platformParams));

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

        this.platforms.forEach(platform => {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
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
                this.player.newMovement(movement.x || null, movement.y || null, this.ground.size().top, this.platforms.map(platform => platform.size()));
            } else if (event.type === 'keyup') {
                const key = event.key;
                const movement = keyToMovement[key];
                this.player.newMovement(movement.x ? 0 : null, movement.y ? 0 : null, this.ground.size().top, this.platforms.map(platform => platform.size()));
            }
        }
        return this;
    }
}

export { GameEntities, Entity };