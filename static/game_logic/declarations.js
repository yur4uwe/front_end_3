const GRAVITY = 1;
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
        return this.x <= entity.x + entity.width &&
            this.x + this.width >= entity.x &&
            this.y <= entity.y + entity.height &&
            this.y + this.height >= entity.y;
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
    constructor({ x, y, width, height, color, movement_x = 0, movement_y = 0, HORIZONTAL_SPEED = 5 }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.movement_y = movement_y;
        this.HORIZONTAL_SPEED = HORIZONTAL_SPEED;
        this.horizontalMovementStack = [movement_x, 0]; // Initialize the horizontal movement stack
    }

    /**
     * @param {number} groundLevel
     * @param {{left: number, right: number, top: number, bottom: number}[]} obstacles
     * @returns {Entity}
     */
    nextPosition(groundLevel, obstacles, enemyKilled) {
        const relevantObstacles = obstacles.filter(obstacle => obstacle.left <= this.x + this.width && obstacle.right >= this.x);

        const onGround = relevantObstacles.some(obstacle => obstacle.top <= this.y + this.height + 1 && obstacle.bottom >= this.y + this.height + 1);
        const underCeiling = relevantObstacles.some(obstacle => obstacle.top <= this.y && obstacle.bottom >= this.y);

        if (this.x < 0 || this.x + this.width > window.innerWidth) {
            this.horizontalMovementStack = [0, 0];
            if (this.x < 0) {
                this.x = 0;
            }
            if (this.x + this.width > window.innerWidth) {
                this.x = window.innerWidth - this.width;
            }
        }

        this.x += this.horizontalMovementStack[0] * this.HORIZONTAL_SPEED;

        if (this.y + this.height < groundLevel && !onGround) {
            this.movement_y += GRAVITY;
        } else if ((this.movement_y === -1 && groundLevel <= this.y + this.height) || enemyKilled) {
            this.movement_y = -JUMP;
        } else if (this.y + this.height > groundLevel) {
            this.movement_y = 0;
            this.y = groundLevel - this.height;
        }

        if ((this.movement_y === -1 && onGround) || enemyKilled) {
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
     * @param {number} movement_y 
     * @param {number} ground
     * @returns {Entity}
     */
    newMovement(movement_y, groundLevel, obstacles) {
        const onGround = this.y + this.height >= groundLevel || obstacles.some(obstacle =>
            obstacle.top <= this.y + this.height && obstacle.bottom >= this.y + this.height &&
            obstacle.left <= this.x + this.width && obstacle.right >= this.x
        );

        this.movement_y = movement_y !== null && onGround ? movement_y : this.movement_y;

        return this;
    }

    /**
     * 
     * @param {Entity} entity 
     */
    checkCollision(entity) {
        return this.x < entity.x + entity.width &&
            this.x + this.width > entity.x &&
            this.y < entity.y + entity.height &&
            this.y + this.height > entity.y;
    }
}

const keyToMovement = {
    w: { y: -1 },
    a: { x: -1 },
    s: { y: 1 },
    d: { x: 1 }
};

class Player extends Entity {
    constructor(params) {
        super(params);
    }

    substractLife() {
        console.log('Player hit');
    }

    /**
     * @param {Event[]} events 
     * @param {number} groundLevel
     * @param {{left: number, right: number, top: number, bottom: number}[]} obstacles
     * @returns {Player}
     */
    readEvents(events, groundLevel, obstacles) {
        for (const event of events) {
            if (event.type === 'keydown') {
                const key = event.key;
                const movement = keyToMovement[key];
                if (movement.x !== undefined) {
                    if (this.horizontalMovementStack[0] === 0) {
                        this.horizontalMovementStack[0] = movement.x;
                    } else if (this.horizontalMovementStack[1] === 0 && this.horizontalMovementStack[0] !== movement.x) {
                        this.horizontalMovementStack[1] = movement.x;
                    }
                }

                this.newMovement(movement.y || null, groundLevel, obstacles);
            } else if (event.type === 'keyup') {
                const key = event.key;
                const movement = keyToMovement[key];
                if (movement.x !== undefined) {
                    if (this.horizontalMovementStack[0] === movement.x) {
                        this.horizontalMovementStack[0] = this.horizontalMovementStack[1];
                        this.horizontalMovementStack[1] = 0;
                    } else if (this.horizontalMovementStack[1] === movement.x) {
                        this.horizontalMovementStack[1] = 0;
                    }
                }

                this.newMovement(movement.y ? 0 : null, groundLevel, obstacles);
            }
        }
        return this;
    }
}

class Enemy extends Entity {
    constructor(params) {
        super(params);
    }

    /**
     * @param {number} groundLevel
     * @param {{left: number, right: number, top: number, bottom: number}[]} obstacles
     * @returns {Entity}
     */
    movementPattern(groundLevel, obstacles) {
        if (this.x <= 0 || this.x + this.width >= window.innerWidth) {
            this.horizontalMovementStack[0] *= -1;
        }

        this.x += this.horizontalMovementStack[0] * this.HORIZONTAL_SPEED;

        const relevantObstacles = obstacles.filter(obstacle => obstacle.left <= this.x + this.width && obstacle.right >= this.x);

        const onGround = relevantObstacles.some(obstacle => obstacle.top <= this.y + this.height && obstacle.bottom >= this.y + this.height);

        if (this.y + this.height < groundLevel && !onGround) {
            this.movement_y += GRAVITY;
        } else if (this.y + this.height > groundLevel) {
            this.movement_y = 0;
            this.y = groundLevel - this.height;
        }

        if (onGround) {
            this.movement_y = 0;
            relevantObstacles.forEach(obstacle => {
                if (obstacle.top <= this.y + this.height && obstacle.bottom >= this.y + this.height) {
                    this.y = obstacle.top - this.height;
                }
            });
        }

        this.y += this.movement_y;

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



class GameEntities {
    constructor() {
        console.log('GameEntities constructor');
        this.player = new Player(playerInitPosition);
        this.enemyKilled = false;
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
    }

    registerKill(enemy) {
        console.log('Enemy killed');
        this.enemies = this.enemies.filter(e => e !== enemy);
        this.enemyKilled = true;
    }

    /**
     * 
     * @param {HTMLHeadingElement} warningBox 
     */
    addEnemy(warningBox) {
        const enemy = new Enemy({
            x: Math.random() * window.innerWidth - 50,
            y: 1,
            width: 50,
            height: 50,
            color: 'blue',
            movement_x: Math.random() * 2 - 1,
        });
        warningBox.innerText = 'Enemy incoming!';
        setTimeout(() => {
            this.enemies.push(enemy);
            warningBox.innerText = '';
        }, 3000);
    }

    nextState() {
        const platformParams = this.platforms.map(platform => platform.size());
        const groundLevel = this.ground.size().top;

        this.player.nextPosition(groundLevel, platformParams, this.enemyKilled);
        this.enemies.forEach(enemy => enemy.movementPattern(groundLevel, platformParams));

        this.enemyKilled = false;

        return this;
    }

    determineInteractions() {
        console.log('Determining interactions');
        const enemyWhoCollided = this.enemies[this.enemies.findIndex(enemy => enemy.checkCollision(this.player))];
        const player = this.player;

        if (enemyWhoCollided === undefined) {
            return this
        }

        console.log('Enemy who collided:', enemyWhoCollided);

        const yDiff = player.y - enemyWhoCollided.y;

        console.log('yDiff:', yDiff);

        if (yDiff < -25 && player.movement_y > 0) {
            // Collision from the top or bottom
            player.newMovement(-1, this.ground.size().top, this.platforms.map(platform => platform.size()));
            this.registerKill(enemyWhoCollided);
        } else {
            // Collision from the sides
            player.substractLife();

            if (player.horizontalMovementStack[0] * enemyWhoCollided.horizontalMovementStack[0] > 0) {
                player.x += enemyWhoCollided.horizontalMovementStack[0] * -50;
            } else {
                enemyWhoCollided.horizontalMovementStack[0] *= -1;
                player.x += enemyWhoCollided.horizontalMovementStack[0] * -25;
            }

            enemyWhoCollided.x += enemyWhoCollided.horizontalMovementStack[0] * 25;

        }

        return this
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
        const platformParams = this.platforms.map(platform => platform.size());
        const groundLevel = this.ground.size().top;

        this.player.readEvents(events, groundLevel, platformParams);
        return this;
    }
}

export { GameEntities, Player, Enemy, Entity };