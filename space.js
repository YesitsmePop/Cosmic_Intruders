//board size definitions
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let context;

//ship
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*2;

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight,
    upgrade: "normal"
}

let shipImg;
let shipVelocityX = tileSize;

//aliens
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 3;
let alienColumns = 3;
let alienCount = 0; // total aliens
let alienVelocityX = 1;

let bonusAlien = {};
let bonusAlienVelocityX;
let bonusAlienImage;

let gunAlien = {};
let gunAlienVelocityX;
let gunAlienImage;

let bulletArray = [];
let bulletVelocityY = -10;
let bulletOffset = 15;

let score = 0;
let gameOver = false;

window.onload = function(){
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext('2d');

    shipImg = new Image();
    shipImg.src = "./ship.png";
    shipImg.onload = function(){
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg = new Image();
    alienImg.src = "./alien.png";
    createAliens();

    bonusAlienImage = new Image();
    bonusAlienImage.src = "./alien-cyan.png";

    gunAlienImage = new Image();
    gunAlienImage.src = "./alien-yellow.png";

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);

}

function createBonusAlien(){
    bonusAlien = {
        x: tileSize,
        y: 0,
        width: tileSize * 2,
        height: tileSize,
        alive: true
    }
    bonusAlienVelocityX = 2.5;
}

function createGunAlien(){
    gunAlien = {
        x: tileSize,
        y: 0,
        width: tileSize * 2,
        height: tileSize,
        alive: true
    }
    gunAlienVelocityX = 3;
}

function update(){
    requestAnimationFrame(update);
    if(gameOver){
        return;
    }

    switch(ship.upgrade){
        case "normal":
            shipImg.src = "./ship.png";
            bulletOffset = 15;
            break;
        case "gun":
            shipImg.src = "./ship-2.png";
            bulletOffset = 10;
            setTimeout(() => {
                ship.upgrade = "normal";
            }, 15000);
            break;
    }

    context.clearRect(0, 0, boardWidth, boardHeight);
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    for(let i = 0; i < alienArray.length; i++){
        let alien = alienArray[i];
        if(alien.alive){
            alien.x += alienVelocityX;
            if(alien.x + alien.width >= board.width || alien.x <= 0){
                alienVelocityX *= -1;
                alien.x += alienVelocityX * 2;

                for(let j = 0; j < alienArray.length; j++){
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if(alien.y >= ship.y){
                gameOver = true;
            }
        }
    }
    for(let i = 0; i < bulletArray.length; i++){
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        if(!bullet.used && bonusAlien.alive && detectCollision(bullet, bonusAlien)){
            bullet.used = true;
            bonusAlien.alive = false;
            score += 500;
        }

        if(!bullet.used && gunAlien.alive && detectCollision(bullet, gunAlien)){
            bullet.used = true;
            gunAlien.alive = false;
            ship.upgrade = "gun";
            score += 200;
        }

        for(let j = 0; j < alienArray.length; j++){
            let alien = alienArray[j];
            if(!bullet.used && alien.alive && detectCollision(bullet, alien)){
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }

    }

    while(bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)){
        bulletArray.shift();
    }

    if(alienCount === 0){
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
        alienRows = Math.min(alienRows + 1, rows - 4);
        alienVelocityX += 0.2;
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    context.fillStyle = "white";
    context.font="16px courier";
    context.fillText(score, 5, 20);

    if(bonusAlien.alive){
        bonusAlien.x += bonusAlienVelocityX;
        if(bonusAlien.x + bonusAlien.width >= board.width){
            bonusAlien.alive = false;
        } else {
            context.drawImage(bonusAlienImage, bonusAlien.x, bonusAlien.y, bonusAlien.width, bonusAlien.height);
        }
    }

    if(gunAlien.alive){
        gunAlien.x += gunAlienVelocityX;
        if(gunAlien.x + gunAlien.width >= board.width){
            gunAlien.alive = false;
        } else {
            context.drawImage(gunAlienImage, gunAlien.x, gunAlien.y, gunAlien.width, gunAlien.height);
        }
    }

}

setInterval(() => {
    if(Math.random() < 0.5){
        createBonusAlien();
    } else{
        createGunAlien();
    }
}, 10000);

function moveShip(e){
    if(gameOver){
        return;
    }
    if(e.code === "KeyA" && ship.x - shipVelocityX >= 0){
        ship.x -= shipVelocityX;
    } else if(e.code === "KeyD" && ship.x + shipVelocityX + ship.width <= boardWidth){
        ship.x += shipVelocityX;
    }
}

function createAliens(){
    for(let c = 0; c < alienColumns; c++){
        for(let r = 1; r < alienRows; r++){
            let alien = {
                img: alienImg,
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            }

            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e){
    if(gameOver){
        return;
    }
    if(e.code === "Space" || e.code === "KeyW"){
        let bullet = {
            x: ship.x + shipWidth * bulletOffset/32,
            y: ship.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false
        }
        let bullet2;
        if(ship.upgrade === "gun"){
            bullet2 = {
                x: ship.x + shipWidth * 20/32,
                y: ship.y,
                width: tileSize / 8,
                height: tileSize / 2,
                used: false
            }
        }
        bulletArray.push(bullet);
        if(ship.upgrade === "gun"){
            bulletArray.push(bullet2);
        }
    }
}

function detectCollision(a, b){
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function reset(){
    location.reload();
}

