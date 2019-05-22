const express = require('express');
const bodyParser = require('body-parser');
const socket = require("socket.io");
const THREE = require("three");



const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/api/hello', (req, res) => {
    res.send({ express: Math.random()});
});
app.post('/api/world', (req, res) => {
    console.log(req.body);
    res.send(
        `I received your POST request. This is what you sent me: ${req.body.post}`,
    );
});

const server = app.listen(port, () => console.log(`Listening on port ${ port}`));


// Game Logic

class Player {
    constructor(type, id, number, acceleration, health, height, width, damage) {
        this.type = type;
        this.id = id;
        this.ready = false;
        this.playerNumber = number;
        this.angle = 0;
        this.pos = new THREE.Vector2(1000, 100);
        this.mouse = new THREE.Vector2(0, 0);
        this.velocity = new THREE.Vector2(0, 0);
        this.acceleration = acceleration ;
        this.change = false;
        this.bullets = [];
        this.health = health;
        this.dead = false;
        this.height = height;
        this.width = width;
        this.damage = damage;
    } 

    getBoundingBox(){
        let size = 15;
        let corners = {
          leftUp: {
            x: this.pos.x - size,
            y: this.pos.y - size
          },
          rightUp: {
            x: this.pos.x + size,
            y: this.pos.y - size
          },
          leftDown: { 
            x: this.pos.x - size,
            y: this.pos.y + size
          },
          rightDown: {
            x: this.pos.x + size,
            y: this.pos.y + size
          }
        }; 

        return corners;

    }
}

class Bullet {
    constructor(pos, velocity, angle, player){
        this.damage = 10;
        this.velocity = velocity;
        this.pos = pos;
        this.distanceTravelled = 0;
        this.angle= angle;
        this.player = player;
    }
}

class Game {
    constructor(playerCount, id) {
        this.ready = 0
        this.gameId = id;
        this.playing = false;
        this.gameOver = false;
        this.capacity = playerCount;
        this.players = [];
        this.size = new THREE.Vector3(2000, 1000);
        this.sockets = [];
    }

    join(id, type) {
        let currentPlayer = this.players.length;
        let newPlayer;
        switch (type) {
            case 0:
                newPlayer = new Player(0, id, currentPlayer, 4, 60, 50, 50, 10);
                
                break;
            case 1:
                newPlayer = new Player(1, id, currentPlayer, 3, 90, 60, 60, 15);
                break;
            case 2:
                newPlayer = new Player(2, id, currentPlayer, 2, 120, 100, 100, 30);
                break;
            case 3:
                newPlayer = new Player(3, id, currentPlayer, 2, 100, 90, 90, 20);
                break;
            default:
                break;
        }
        this.players.push(newPlayer);
        return currentPlayer;
    }

    movePlayer() {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].dead) continue;
            let difference = this.players[i].mouse.clone();
            if(this.players[i].change){
                difference.sub(this.players[i].pos);
                this.players[i].velocity = difference.clone();
                this.players[i].velocity.normalize();
                let v = this.players[i].velocity.clone();
                this.players[i].pos.add(v.multiplyScalar(this.players[i].acceleration));
                let newAngle = Math.atan2(difference.y, difference.x);
                this.players[i].angle = newAngle;
                if (this.players[i].pos.x < 0) {
                    this.players[i].pos.x = 0
                }
                if (this.players[i].pos.y < 0) {
                    this.players[i].pos.y = 0
                }
                if (this.players[i].pos.x > this.size.x) {
                    this.players[i].pos.x = this.size.x;
                }
                if (this.players[i].pos.y > this.size.y) {
                    this.players[i].pos.y = this.size.y;
                }
                this.players[i].change = false;
            } else {
                let v = this.players[i].velocity.clone();
                this.players[i].pos.add(
                  v.multiplyScalar(this.players[i].acceleration));
                if (this.players[i].pos.x < 0) {
                    this.players[i].pos.x = 0
                }
                if (this.players[i].pos.y < 0) {
                    this.players[i].pos.y = 0
                }
                if (this.players[i].pos.x > this.size.x) {
                    this.players[i].pos.x =  this.size.x;
                }
                if (this.players[i].pos.y >  this.size.y) {
                    this.players[i].pos.y =  this.size.y;
                }
            }
        }
    }

    moveBullets(){
        for (let p = 0; p < this.players.length; p++){
            if (this.players[p].dead) continue;
            for (let i = 0; i < this.players[p].bullets.length; i++){ 
                let v = this.players[p].bullets[i].velocity.clone();
                this.players[p].bullets[i].pos.add(
                  v.multiplyScalar(5));
                this.players[p].bullets[i].distanceTravelled += 1;
                let collision = this.checkCollision(p, this.players[p].bullets[i].pos);
                if  (collision !== -1){
                    this.players[collision].health -= this.players[p].bullets[i].damage;
                    if (this.players[collision].health <= 0) {
                        console.log(`PLAYER: ${this.players[collision].playerNumber} GAME OVER`)
                        this.players[collision].dead = true;
                        // this.players.splice(collision, 1);
                    }
                    this.players[p].bullets.splice(i, 1);

                }
            }  
        }
    }

    checkCollision(parent, pos){
        for (let i = 0; i < this.players.length; i++){
            if (i == parent || this.players[i].dead){
                continue;
            }
            let box  = this.players[i].getBoundingBox();

            if (pos.x >= box.leftUp.x && pos.y >= box.leftUp.y
                && pos.x <= box.rightUp.x && pos.y <= box.leftDown.y
                ){
                    return i;
                }
        }

        return -1
 
    }

    cleanUp(){
         for (let p = 0; p < this.players.length; p++){
            for (let i = 0; i < this.players[p].bullets.length; i++){ 
                if (this.players[p].bullets[i].distanceTravelled > 1000) {
                    this.players[p].bullets.splice(i, 1);
                }
            }
        }
    }

    

    update() {
        if (this.ready == this.capacity){
            this.movePlayer();
            this.moveBullets();
            this.cleanUp();
        }
    }

    playGame() {
        this.playing = true;
        this.update();
    }
}

// Master Game Server
class Master {
    constructor() {
        this.games = [];
    }

    newGame(game) {
        this.games.push(game);
        return this.games.length - 1
    }

    playGames(){
        setInterval(() => {
            this.games.forEach(game => {
                game.playGame();
            });
        }, 1000/100)
    }
}

let master = new Master();
master.playGames();

// Socket setup
var io = socket(server);

io.on('connection', function(socket){
    console.log("Connected");
    let GAMEID;
    let connected = false;
    let playing = false;
    let playerID;

    socket.on("choice", function(data){
        let added = false;
        for (let i = 0; i < master.games.length; i++){
            if (master.games[i].players.length < master.games[i].capacity){
                playerID = master.games[i].join(socket.id, data.type);
                GAMEID = i;
                if (master.games[GAMEID].players.length == master.games[i].capacity) {
                    master.games[GAMEID].playing = true;
                }
                socket.emit('init', { gameId: i, player: playerID });
                added = true;
                break;
            }
        }
        if (!added){
            let newGame = new Game(2, master.games.length);
            newGame.playGame();
            playerID = newGame.join(socket.id, data.type);
            GAMEID = master.newGame(newGame);
            socket.emit('init', { gameId: GAMEID, player: playerID});
        }
        master.games[GAMEID].players[playerID].ready = true;
        master.games[GAMEID].ready += 1;
        connected = true;
    })
    console.log(`ID: ${GAMEID}`)
    console.log('made socket connection', socket.id);

    socket.on('state', function(data){
        if (playing){
            let player = master.games[data.gameId].players[data.playerId];
            if (player.ready) {
                player.mouse.x = data.mouseInfo.x;
                player.mouse.y = data.mouseInfo.y;
                player.change = true;
            }
        }
    })

    socket.on('fire', function(data){
        let p1 = master.games[GAMEID].players[playerID].pos.clone();
        let p2 = master.games[GAMEID].players[playerID].pos.clone();

        let v = master.games[GAMEID].players[playerID].velocity.clone();
        let angle = master.games[GAMEID].players[playerID].angle;

        p1.x += 25 * Math.cos(angle) + 25 * Math.sin(angle);
        p1.y +=  - 25 * Math.cos(angle) +  25 * Math.sin(angle);
        let bullet = new Bullet(
          p1,
          v,
          angle,
          playerID
        );

        master.games[GAMEID].players[playerID].bullets.push(bullet);
    })

    let interval = setInterval(gameStart, 1000/100);

    function gameStart(){
        if (connected){
            if (master.games[GAMEID].playing){
                playing = true;
                socket.emit("play", {playersInfo: master.games[GAMEID].players})
                console.log("INTERVAAAAL");
                clearInterval(interval);
            }
        }
    }

    let mainLoop = setInterval(updater, 1000/100)
    function updater(){
        if (playing) {
            if (master.games[GAMEID].players[playerID].dead){
                console.log("HERE");
                socket.emit("gameover", {gameOver: true});
            }
            socket.emit("update", {
              playersInfo: master.games[GAMEID].players,
            });
        }
        if (socket.disconnected) {
            socket.disconnect();
            console.log("DISCONNECTED");
            clearInterval(mainLoop);
        }

    }
});

