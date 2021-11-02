const canvas = document.querySelector('canvas');
canvas.width = innerWidth;
canvas.height = innerHeight;

const c = canvas.getContext('2d');
c.fillStyle = 'rgba(0,0,0)';
c.fillRect(0, 0, canvas.width, canvas.height);

let startButton = document.getElementById('begin');
let popUp = document.getElementById('popUp');
let points = document.getElementById('points');
let logo = document.getElementById('logo');

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
        c.fillStyle = this.color;
        c.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 15, 'white');

let projs = []
let enemies = []
let particles = []

let enemyVecMul = 1;
function updateVel(){
    enemyVecMul++;
}
let velInterval = setInterval(updateVel, 90000);

function spawnEnemies() {
    setInterval(() => {
        let radius = Math.random() * (35 - 10) + 10;

        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() * canvas.width;
            y = (Math.random() < 0.5) ? 0 - radius : canvas.height + radius;
        }
        else {
            x = (Math.random() < 0.5) ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            x: enemyVecMul * Math.cos(angle),
            y: enemyVecMul * Math.sin(angle)
        }

        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000)
}

let animationId;
let score = 0;
let val = document.getElementById('val')
function animate() {
    animationId = requestAnimationFrame(animate);

    c.fillStyle = 'rgba(0,0,0,0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particles.forEach((particle, idx) => {
        if (particle.alpha <= 0) {
            particles.splice(idx, 1);
        }
        else particle.update();
    })

    projs.forEach((proj, idx) => {
        proj.update();

        if (proj.x + proj.radius < 0 || proj.x - proj.radius > canvas.width || proj.y + proj.radius < 0 || proj.y - proj.radius > canvas.height) {
            setTimeout(() => {
                projs.splice(idx, 1);
            }, 0)
        }
    });

    enemies.forEach((enemy, i) => {
        enemy.update();

        const distPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        //Detect collision between player and enemies and end game
        if (distPlayer - enemy.radius - player.radius < 0.2) {
            cancelAnimationFrame(animationId);
            popUp.style.display = "block";
            popUp.style.backgroundColor = "rgba(0,0,0,0.75)";
            points.innerHTML = score;
            startButton.innerHTML = "Restart"
        }


        projs.forEach((proj, j) => {
            const dist = Math.hypot(proj.x - enemy.x, proj.y - enemy.y);

            //Detect collision between enemies and projectiles
            if (dist - enemy.radius - proj.radius < 0.2) {

                //Create explosions
                for (let i = 0; i < enemy.radius; i++) {
                    particles.push(new Particle(proj.x, proj.y, Math.random() * 3, enemy.color, { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 6 }))
                }

                if (enemy.radius - 10 > 10) {
                    gsap.to(enemy, {
                        radius: enemy.radius - 10,
                    })
                    setTimeout(() => {
                        projs.splice(j, 1);
                        score += 5;
                        val.innerHTML = score;
                    }, 0);
                }
                else {
                    setTimeout(() => {
                        enemies.splice(i, 1);
                        projs.splice(j, 1);
                        score += 10;
                        val.innerHTML = score;
                    }, 0);
                }
            }
        })
    })
}

addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    projs.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', { x: 5 * Math.cos(angle), y: 5 * Math.sin(angle) }));
})

startButton.addEventListener('click', function(){
    if(startButton.innerHTML == "Start"){
        popUp.style.display = "none";
        logo.style.display = "none";
        popUp.style.marginTop = "-200px";
        animate();
        spawnEnemies();
    }
    else{
        popUp.style.display = "none";
        score = 0;
        points.innerHTML = score;
        val.innerHTML = score;
        projs = [];
        enemies = [];
        particles = [];
        enemyVecMul = 1;
        animate();
        // spawnEnemies();
        clearInterval(velInterval);
        velInterval = setInterval(updateVel, 90000);
    }
})