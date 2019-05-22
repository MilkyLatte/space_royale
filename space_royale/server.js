const express = require('express');
const bodyParser = require('body-parser');
const socket = require("socket.io");
const THREE = require("three");
const sqlite3 = require("sqlite3").verbose();
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const color = require('colors');

var ships = {};
var hpBars = {};
var bulletCounter = {};



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

function convertImage(imagePath) {
    return fs.readFileAsync(__dirname + imagePath, 'base64')
}

// convert ships to base 64
function convertAllShipsImages() {
    var promises = [];
    const size = Object.keys(ships).length;

    for (var i = 1; i <= size; i++) {
        promises[i - 1] = convertImage(ships[i]);
    }
    return Promise.all(promises);
}

// convert hp bars to base 64

function convertAllhpImages() {
    var promises = [];
    const size = Object.keys(hpBars).length;

    for (var i = 1; i <= size; i++) {
        promises[i - 1] = convertImage(hpBars[i]);
    }

    return Promise.all(promises);

}

// Client requesting ship information //////////////
app.get('/api/ships', (req, res) => {

    convertAllShipsImages().then(function(imageJSON) {
        res.send({express: imageJSON});
        console.log("Sent ships to client".blue)
    }, function(err) {
        throw(err);
    });
});

// Client requesting hp bars //////////////////////

app.get('/api/hp', (req, res) => {
    convertAllhpImages().then(function(imageJSON) {
        res.send({express:imageJSON});
        console.log("Sent hp bars to client".blue);
    }, function(err) {
        throw(err);
    });
    
}); 

app.get('/api/bulletCounter', (req, res) => {
    var sendInfo = {};

    fs.readFile(__dirname + bulletCounter[0], 'base64', (err, base64Image) => {
        res.send({express: base64Image});
        console.log("Sent bullet counter to client".blue)
    });
})


////////////////////////////////////////////////////

// Database Connection//////////////////////////////
let db = new sqlite3.Database('./Database/game_database', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error(err.message);
    }

    console.log('Connected to the game database'.blue);
});
const server = app.listen(port, () => console.log(`Listening on port ${ port}`));
//////t////////////////////////////////////////////////


// Access ships and table /////////////////
let ship_table = 'SELECT ID, File FROM ShipsBullet ORDER BY ID';

db.each(ship_table, (err, row) => {
    if (err) {
        throw err;
    };

    ships[row.ID] = row.File;
});

////////////////////////////////////////////

let hp_Bar_Table = 'SELECT id, filePath FROM UI_HP_Bars_And_Bullets ORDER BY id';

// Access hp bar and bullet counter database
db.each(hp_Bar_Table, (err, row) =>  {
    if (err) {
        throw err;
    }

    if (row.id != 12) hpBars[row.id] = row.filePath;
    else {
        bulletCounter[0] = row.filePath;
        console.log(bulletCounter[0]);
    }
});
/////////////////////////////////////////////////

// Close database connection ///////////////////////
db.close((err) => {
    if (err) {
        console.error(err.message);
    }

    console.log('Closed the database connection'.blue);
})

// Game Logic

class Player {
    constructor(type, id, number, acceleration, health, height, width, damage, bulletCooldown) {
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
        this.bulletCooldown = bulletCooldown; //Cooldown in milliseconds
    } 

    getPackedData(){
        let packet = {
            type: this.type,
            angle: this.angle,
            pos: {
                x: this.pos.x,
                y: this.pos.y
            },
            bullets: this.bullets,
            health: this.health,
            dead: this.dead
        }
        return packet;
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
                newPlayer = new Player(0, id, currentPlayer, 4, 60, 50, 50, 10, 200);
                
                break;
            case 1:
                newPlayer = new Player(1, id, currentPlayer, 3, 90, 60, 60, 15, 200);
                break;
            case 2:
                newPlayer = new Player(2, id, currentPlayer, 2, 100, 100, 100, 30, 200);
                break;
            case 3:
                newPlayer = new Player(3, id, currentPlayer, 2, 100, 90, 90, 20, 200);
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
    let lastBullet = 0; 

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
        let now = (new Date).getTime();
        if (now - lastBullet > master.games[GAMEID].players[playerID].bulletCooldown) {
            console.log("HERE");
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
            lastBullet = now;
        }
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
                socket.emit("gameover", {gameOver: true});
            }
            let players = []
            master.games[GAMEID].players.forEach(player => {
                players.push(player.getPackedData());
            });
            socket.emit("update", {
              playersInfo: players,
            });
        }
        if (socket.disconnected) {
            socket.disconnect();
            console.log("DISCONNECTED");
            clearInterval(mainLoop);
        }

    }
});

