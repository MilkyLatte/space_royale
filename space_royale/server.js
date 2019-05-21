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
    constructor(id, number) {
        this.id = id;
        this.ready = false;
        this.playerNumber = number;
        this.angle = 0;
        this.pos = new THREE.Vector2(1000, 0);
        this.mouse = new THREE.Vector2(0, 0);
        this.velocity = new THREE.Vector2(0, 0);
        this.acceleration = 3;
        this.change = false;
        this.bullets = [];
        this.health = 100;
    } 
}

class Bullet {
    constructor(pos, velocity, angle){
        this.damage = 10;
        this.velocity = velocity;
        this.pos = pos;
        this.distanceTravelled = 0;
        this.angle= angle;
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

    join(id) {
        let currentPlayer = this.players.length;
        let newPlayer = new Player(id, currentPlayer);
        this.players.push(newPlayer);
        return currentPlayer;
    }

    movePlayer() {
        for (let i = 0; i < this.players.length; i++) {
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
            for (let i = 0; i < this.players[p].bullets.length; i++){ 
                let v = this.players[p].bullets[i].velocity.clone();
                this.players[p].bullets[i].pos.add(
                  v.multiplyScalar(5));
                this.players[p].bullets[i].distanceTravelled += 1;
            }
        }
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
    let added = false;
    let GAMEID;
    let connected = false;
    let playerID;
    for (let i = 0; i < master.games.length; i++){
        if (master.games[i].players.length < master.games[i].capacity){
            playerID = master.games[i].join(socket.id);
            GAMEID = i;
            socket.emit('init', { playersInfo: master.games[i].players, gameId: i, player: playerID });
            added = true;
            break;
        }
    }
    if (!added){
        let newGame = new Game(2, master.games.length);
        newGame.playGame();
        playerID = newGame.join(socket.id);
        GAMEID = master.newGame(newGame);
        socket.emit('init', { playersInfo: newGame.players, gameId: GAMEID, player: playerID});
    }
    console.log(`ID: ${GAMEID}`)
    console.log('made socket connection', socket.id);

    socket.on('ready', function(data){
        console.log(
          `Player ${data.player} Ready, Game ID: ${data.gameId} `
        );
        master.games[data.gameId].players[data.player].ready = true;
        master.games[data.gameId].ready += 1;
        connected = true;
    })


    socket.on('state', function(data){
        let player = master.games[data.gameId].players[data.playerId];
        if (player.ready) {
            player.mouse.x = data.mouseInfo.x;
            player.mouse.y = data.mouseInfo.y;
            player.change = true;
        }
    })

    socket.on('fire', function(data){
        let p = master.games[GAMEID].players[playerID].pos.clone();
        let v = master.games[GAMEID].players[playerID].velocity.clone();
        let angle = master.games[GAMEID].players[playerID].angle;
        
        let bullet = new Bullet(
          p,
          v,
          angle
        );

        master.games[GAMEID].players[playerID].bullets.push(bullet);
    })

    setInterval(() => {
        if (connected) {
            // console.log(playerID)
            socket.emit("update", {
              readyPlayers: master.games[GAMEID].ready,
              playersInfo: master.games[GAMEID].players,
              playerId: playerID
            });
        }

    }, 1000/100)
});

