const GRAVITY = 1;
const JUMP = 20;

const plungingAttack = (x, y, width, height) => {
    return new Entity({
        x: x - 100,
        y: y + 20,
        width: width + 200,
        height: height - 20,
        color: 'yellow',
    });
}

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

/**
 * @param {Entity} entity
 * @param {{left: number, right: number, top: number, bottom: number}} platform
 * @returns {boolean} 
 */
const isTouchingGround = (entity, platform) => {
    return entity.y < platform.top && entity.y + entity.height >= platform.top;
}


class Entity {
    /**
     * @param {{x: number, y: number, width: number, height: number, color: string, movement_x: number, movement_y: number }} param0 
     */
    constructor({ x, y, width, height, color, movement_x = 0, movement_y = 0, HORIZONTAL_SPEED = 6 }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.movement_y = movement_y;
        this.HORIZONTAL_SPEED = HORIZONTAL_SPEED;
        this.horizontalMovementStack = [movement_x, 0]; // Initialize the horizontal movement stack
        this.isImmune = false;
        this.isScripted = false;
        this.isPlunging = false;
        this.attack = null;
        this.activeScript = null;
        this.ignoresGravity = false;
        this.dashOnCooldown = false;
    }

    /**
     * @param {number} groundLevel
     * @param {{left: number, right: number, top: number, bottom: number}[]} obstacles
     * @returns {Entity}
     */
    nextPosition(groundLevel, obstacles, enemyKilled, ignoresObstacles = false) {
        if (this.activeScript === null) {
            this.isScripted = false;
            this.activeScript = null;
            this.ignoresGravity = false;
        }
        if (this.isScripted) {
            this.activeScript();
        }

        const relevantObstacles = obstacles.filter(obstacle => obstacle.left <= this.x + this.width && obstacle.right >= this.x);

        const onGround = relevantObstacles.some(obstacle => isTouchingGround(this, obstacle));
        const underCeiling = relevantObstacles.some(obstacle => obstacle.top <= this.y && obstacle.bottom >= this.y) && this.movement_y < 0;

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

        if (((this.y + this.height < groundLevel && !onGround) || ignoresObstacles) && !this.ignoresGravity) {
            if (this.isPlunging) {
                this.movement_y += 1;
            }
            this.movement_y += GRAVITY;
        } else if ((this.movement_y === -1 && groundLevel <= this.y + this.height) || enemyKilled) {
            this.movement_y = -JUMP;
        } else if (this.y + this.height > groundLevel && !ignoresObstacles) {
            this.movement_y = 0;
            this.y = groundLevel - this.height;

            if (this.isPlunging) {
                this.makeAttack(plungingAttack(this.x, this.y, this.width, this.height));
                this.isPlunging = false;
            }
        }

        if ((this.movement_y === -1 && onGround) || enemyKilled) {
            this.movement_y = -JUMP;
        } else if (onGround && !ignoresObstacles) {
            this.movement_y = 0;
            for (const obstacle of relevantObstacles) {
                if (!isTouchingGround(this, obstacle)) {
                    continue;
                }

                this.y = obstacle.top - this.height;

                if (this.isPlunging) {
                    this.makeAttack(plungingAttack(this.x, this.y, this.width, this.height));
                    this.isPlunging = false;
                }
                break;
            }
        } else if (underCeiling && !ignoresObstacles) {
            this.movement_y = GRAVITY;
        }

        this.y += !this.ignoresGravity ? this.movement_y : 0;

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
            isTouchingGround(this, obstacle)
        );


        this.isPlunging = (movement_y === 1 && !onGround) || this.isPlunging;
        this.movement_y = movement_y !== null && onGround ? movement_y : this.movement_y;

        return this;
    }

    /**
     * 
     * @param {Entity} entity 
     */
    checkCollision(entity) {
        if (this.isImmune || entity.isImmune) {
            return false;
        }
        return this.x < entity.x + entity.width &&
            this.x + this.width > entity.x &&
            this.y < entity.y + entity.height &&
            this.y + this.height > entity.y;
    }

    /**
     * @param {Entity} entity 
     */
    makeAttack(entity) {
        this.attack = entity;

        setTimeout(() => this.attack = null, 100);
    }

    /**
     * @param {string} type 
     */
    script(type, framesNumber) {
        let activeScript = null;

        switch (type) {
            case 'dash':
                this.HORIZONTAL_SPEED = 24;
                this.isImmune = true;
                this.dashOnCooldown = true;
                this.ignoresGravity = true;
                activeScript = () => {
                    framesNumber -= 1;
                    if (framesNumber === 0) {
                        this.isScripted = false;
                        this.activeScript = null;
                        this.ignoresGravity = false;
                        this.isImmune = false;
                        this.HORIZONTAL_SPEED = 6;
                        this.horizontalMovementStack[0] = this.horizontalMovementStack[1];
                        this.horizontalMovementStack[1] = 0;
                        setTimeout(() => this.dashOnCooldown = false, 2000);
                    }
                };
                break;
        }


        return activeScript;
    }
}

const keyToMovement = {
    w: { y: -1 },
    a: { x: -1 },
    s: { y: 1 },
    d: { x: 1 },
    A: { x: -2 },
    D: { x: 2 },
    Shift: { x: 2 },
    ' ': { y: -1 },
};

class Player extends Entity {
    constructor(params) {
        super(params);
        this.lives = 1;
        this.score = 0;
    }

    substractLife() {
        this.lives -= 1;

        if (this.lives === 0) {
            console.log('Game over');
        }

        this.isImmune = true;
        setTimeout(() => { this.isImmune = false }, 1000);
    }

    /**
     * @param {Event[]} events 
     * @param {number} groundLevel
     * @param {{left: number, right: number, top: number, bottom: number}[]} obstacles
     * @returns {Player}
     */
    readEvents(events, groundLevel, obstacles) {

        for (const event of events) {
            const key = event.key;
            const movement = keyToMovement[key];
            // console.log('Key pressed', key);
            if (movement === undefined) {
                console.log('Invalid key pressed', event.key);
                continue;
            }

            if (event.type === 'keydown') {
                if (movement.x !== undefined) {
                    if (this.horizontalMovementStack[0] === 0 && Math.abs(movement.x) === 1) {
                        this.horizontalMovementStack[0] = movement.x;
                    } else if (!this.dashOnCooldown && Math.abs(movement.x) === 2 && Math.abs(this.horizontalMovementStack[0]) === 1) {
                        this.activeScript = this.script("dash", 15);
                        this.isScripted = true;
                        this.horizontalMovementStack[1] = this.horizontalMovementStack[0];
                    } else if (this.horizontalMovementStack[1] === 0 && this.horizontalMovementStack[0] !== movement.x) {
                        this.horizontalMovementStack[1] = movement.x;
                    }
                }

                this.newMovement(movement.y || null, groundLevel, obstacles);
            } else if (event.type === 'keyup') {
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
        this.ignoresObstacles = false;
        this.isScripted = true;
    }

    /**
     * @param {number} groundLevel
     * @param {{left: number, right: number, top: number, bottom: number}[]} obstacles
     * @returns {Entity}
     */
    movementPattern(groundLevel, obstacles) {
        if (this.x <= 0 || this.x + this.width >= window.innerWidth) {
            if (this.x < 0) {
                this.x = 0;
            } else if (this.x + this.width > window.innerWidth) {
                this.x = window.innerWidth - this.width;
            }
            this.horizontalMovementStack[0] *= -1;
        }

        return this.nextPosition(groundLevel, obstacles, false, this.ignoresObstacles);
    }

    /**
     * @param {string} type
     * @returns {() => {x: number, y: number} | null}
     */
    script(type) {
        let activeScript = null;

        switch (type) {
            case 'death':
                this.ignoresObstacles = true;
                console.log('Enemy killed');
                break;
            case 'movement':
                activeScript = () => { return { x: 0, y: 0 } };
                break;
        }

        return activeScript;
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
        /**
         * @type {Player} player
         */
        this.player = new Player(playerInitPosition);
        this.enemyKilled = false;
        /**
         * @type {Enemy[]} enemies
         */
        this.enemies = [];
        this.enemiesToSpawn = [];
        /**
         * @type {Obstacle} ground
         */
        this.ground = new Obstacle({
            x: 0,
            y: 2 * window.innerHeight / 3,
            width: window.innerWidth,
            height: window.innerHeight / 3,
            color: 'green'
        });
        /**
         * @type {Obstacle[]} platforms
         */
        this.platforms = [
            new Obstacle({
                x: 300,
                y: this.ground.y - 150,
                width: 300,
                height: 10,
                color: 'black'
            }),
            new Obstacle({
                x: 700,
                y: this.ground.y - 300,
                width: 200,
                height: 10,
                color: 'black'
            }),
            new Obstacle({
                x: 300,
                y: this.ground.y - 450,
                width: 100,
                height: 10,
                color: 'black'
            }),
            new Obstacle({
                x: window.innerWidth - 900,
                y: this.ground.y - 300,
                width: 200,
                height: 10,
                color: 'black'
            }),
            new Obstacle({
                x: window.innerWidth - 600,
                y: this.ground.y - 150,
                width: 300,
                height: 10,
                color: 'black'
            })
        ];
    }

    /**
     * 
     * @param {Enemy} enemy 
     */
    registerKill(enemy) {
        enemy.isImmune = true;
        enemy.isScripted = true;
        enemy.activeScript = enemy.script('death');
        setTimeout(() => this.enemies = this.enemies.filter(e => e !== enemy), 1000);
        this.enemyKilled = true;
    }

    /**
     * 
     * @param {HTMLHeadingElement} warningBox 
     */
    addEnemy(warningBox) {
        if (this.enemiesToSpawn.length > 0 || this.enemies.length > 20) {
            return;
        }
        const enemy = new Enemy({
            x: Math.random() * window.innerWidth - 50,
            y: 1,
            width: 50,
            height: 50,
            color: 'blue',
            movement_x: Math.random() * 2 - 1,
        });
        warningBox.innerText = 'Enemy incoming!';
        this.enemiesToSpawn.push(enemy.x);
        setTimeout(() => {
            this.enemies.push(enemy);
            this.enemiesToSpawn = this.enemiesToSpawn.filter(e => e !== enemy.x);
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
        const player = this.player;
        const attack = player.attack;

        if (player.isImmune) {
            return this;
        }

        const enemyWhoCollided = this.enemies[this.enemies.findIndex(enemy => enemy.checkCollision(player))];
        const enemiesHit = attack ? this.enemies.filter(enemy => enemy.checkCollision(attack)) : [];

        if (enemyWhoCollided !== undefined) {
            const yDiff = player.y - enemyWhoCollided.y;

            if (player.movement_y > 0) {
                // Collision from the top or bottom
                player.score += 1;
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
        }

        if (enemiesHit.length > 0) {
            enemiesHit.forEach(enemy => this.registerKill(enemy));
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
        ctx.fillStyle = this.player.attack ? this.player.attack.color : 'transparent';
        if (this.player.attack) {
            ctx.fillRect(this.player.attack.x, this.player.attack.y, this.player.attack.width, this.player.attack.height);
        }

        this.enemiesToSpawn.forEach(x_coord => {
            ctx.strokeStyle = "red";
            ctx.strokeRect(x_coord, 0, 50, 50);

            ctx.fillStyle = "red";
            ctx.fillText('!', x_coord + 22, 28);
        });

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

        this.drawHP(ctx, this.player.lives);

        this.drawCooldown(ctx, this.player.dashOnCooldown);

        ctx.font = '20px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(`Score: ${this.player.score}`, 5, 50);

        return this;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} lives 
     */
    drawHP(ctx, lives) {
        const heartSize = 20;
        const heartPadding = 5;
        const color = 'red';

        let x = heartPadding + 10;
        let y = heartPadding;

        for (let i = 0; i < lives; i++) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, y + heartSize / 4);
            ctx.quadraticCurveTo(x, y, x - heartSize / 4, y);
            ctx.quadraticCurveTo(x - heartSize / 2, y, x - heartSize / 2, y + heartSize / 4);
            ctx.quadraticCurveTo(x - heartSize / 2, y + heartSize / 2, x, y + heartSize);
            ctx.quadraticCurveTo(x + heartSize / 2, y + heartSize / 2, x + heartSize / 2, y + heartSize / 4);
            ctx.quadraticCurveTo(x + heartSize / 2, y, x + heartSize / 4, y);
            ctx.quadraticCurveTo(x, y, x, y + heartSize / 4);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.restore();

            x += heartSize + heartPadding
        }
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Player} player 
     */
    drawCooldown(ctx, isOnCooldown) {
        if (isOnCooldown) {
            ctx.fillStyle = 'red';
            ctx.fillText('Dash on cooldown', 5, 100);
        }
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