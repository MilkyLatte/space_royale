const express = require('express');
const bodyParser = require('body-parser');
const socket = require("socket.io");
const THREE = require("three");
const sqlite3 = require("sqlite3").verbose();
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const color = require('colors');
const sizeof = require("object-sizeof");
const passport = require('passport');
const localstrategy = require('passport-local');
const Cors = require('cors');
const logger = require('morgan');
const withAuth = require('./middleware');

const Config = require('./config/passport');


var ships = {};
var hpBars = {};
var bulletCounter = {};
var background = {}


const app = express();
const port = process.env.PORT || 5000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(Cors());
app.use(logger('dev'));
app.use(passport.initialize());

require("./routes/loginUser")(app);
require("./routes/loginGoogleUser")(app);
require("./routes/registerUser")(app);
require("./routes/registerGoogleUser")(app);
// require("./routes/findUser")(app);
// require("./routes/deleteUser")(app);
// require("./routes/updateUser")(app);


app.get('/api/hello', (req, res) => {
    res.send({ express: Math.random()});
});
app.post('/api/world', (req, res) => {
    console.log(req.body);
    res.send(
        `I received your POST request. This is what you sent me: ${req.body.post}`,
    );
});

function hashPassword(data){

    return new Promise((fulfill, reject) => {
        bcrypt.hash(data, saltRounds, (err, hashed) => {
            if (err) reject(err)
            else fulfill(hashed);
        });
    })
}

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
    }, function(err) {
        throw err;
    });
});

// Client requesting hp bars //////////////////////

app.get('/api/hp', (req, res) => {
    convertAllhpImages().then(function(imageJSON) {
        res.send({express:imageJSON});
    }, function(err) {
        throw err;
    });
    
}); 

app.get('/api/bulletCounter', (req, res) => {

    fs.readFile(__dirname + bulletCounter[0], 'base64', (err, base64Image) => {
        res.send({express: base64Image});
    });
})

app.get('/api/background', (req, res) => {
    fs.readFile(__dirname + background[0], 'base64', (err, base64Image) => {
        
        if (err) throw err;

        res.send({express: base64Image});
    });
})

app.get('/checkToken', withAuth, (req, res) => {
    res.sendStatus(200);
})

// app.post('/api/googleRegister', (req, res) => {
//     const { id, username, email } = req.body;
    
//     hashPassword(username).done((hashedUserName) => {
//         hashPassword(email).done((hashedemail) => {
//             insertGoogleUser(id, hashedUserName, hashedemail).done((success) => {
//                 res.send(success);
//             });
//             // res.send({id: hashedId, name: hashedName, email: hashedemail});
//         });
//     });
// })

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

let hp_Bar_Table = 'SELECT id, filePath FROM UI_HP_Bar_Bullets_Background ORDER BY id';

// Access hp bar and bullet counter database
db.each(hp_Bar_Table, (err, row) =>  {
    if (err) {
        throw err;
    }

    if (row.id != 12 && row.id != 13) hpBars[row.id] = row.filePath;
    if (row.id == 12) {
        bulletCounter[0] = row.filePath;
        console.log(bulletCounter[0].blue);
    }
    if (row.id == 13) {
        background[0] = row.filePath;
        console.log(background[0].blue);
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
///////////////////////////////////////////////////

// Check if user is already in database //////////
// function checkExist(id, db, table) {
    
//     let googleTable = 'SELECT EXISTS(SELECT 1 FROM ' + table + ' WHERE id =' + id + ')';
//     let check = 'EXISTS(SELECT 1 FROM Google_User WHERE id =' + id + ')';
    
//     return new Promise((fulfill, reject) => {
//         db.serialize( function() {
//             db.each(googleTable, (err, row) => {
//                 if (err) {
//                     console.error(err.message);
//                     reject(err);
//                 };
//                 console.log(row);
//                 if (row[check] == 1) {
//                     fulfill({exist:true});
//                 } else {
//                     fulfill({exist: false});
//                 }
//             });
//         });
//     });    
// }
    

// // Insert user to database ///////////////////////
// function insertGoogleUser(id, username, email) {
//     // Database connection
//     return new Promise((fulfill, reject) => {
        
//         let db = new sqlite3.Database('./Database/game_database', (err) => {
//             if (err) {
//                 console.error(err.message);
//                 reject(err);
//             };
        
//             console.log('Connected to the google login database'.blue);
//         });
    
//         checkExist(id, db, 'Google_User')
//             .then(res => {
//                 if (res.exist == true) {
//                     fulfill({exist: true, inserted: false});
//                 }
//                 else {
//                     console.log("Here");
//                     db.run('INSERT INTO Google_User VALUES(?, ?, ?)', [id, username, email], (err) => {
//                         if (err) {
//                             console.error(err.message);
//                             reject(err);
//                         }
//                         console.log("Added new user to google database".blue);
//                         fulfill({exist: false, inserted: true});
//                     })
//                     db.close((err) => {
//                         if (err) {
//                             console.error(err.message);
//                             reject(err);
//                         };
                
//                         console.log('Closed google database'.blue);
//                     }); 
//                 }
//             })
//             .catch((err) => {
//                 console.error(err.message);
//                 reject(err);
//             })

//     });

// };
/////////////////////////////////////////////

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
            x: this.pos.x - (this.width-50)/2,
            y: this.pos.y - (this.height-50)/2
          },
          rightUp: {
            x: this.pos.x + (this.width-50)/2,
            y: this.pos.y - (this.height-50)/2
          },
          leftDown: { 
            x: this.pos.x - (this.width-50)/2,
            y: this.pos.y + (this.height-50)/2
          },
          rightDown: {
            x: this.pos.x + (this.width-50)/2,
            y: this.pos.y + (this.height-50)/2
          }
        }; 
        return corners;
    }

    shoot(){
        switch (this.type) {
            case 0:
            {
                let p1 = this.pos.clone();
                let v = this.velocity.clone();
                
                p1.x += 60 * Math.cos(this.angle) + 10 * Math.sin(this.angle);
                p1.y += -10 * Math.cos(this.angle) + 60 * Math.sin(this.angle);
                
                let b = new Bullet(p1, v, this.angle, this.playerNumber, 10, 10)
                this.bullets.push(b);
                break;
            }
            case 1:
            {
                let p1 = this.pos.clone();
                let v = this.velocity.clone();
                
                p1.x += 60 * Math.cos(this.angle) + 10 * Math.sin(this.angle);
                p1.y += -10 * Math.cos(this.angle) + 60 * Math.sin(this.angle);
                
                let b = new Bullet(p1, v, this.angle, this.playerNumber, 10, 10)
                this.bullets.push(b);
                break;
            }
            case 2:
            {
                let p1 = this.pos.clone();
                let p2 = this.pos.clone();
                let p3 = this.pos.clone();
                let p4 = this.pos.clone();
                let v = this.velocity.clone();
                
                p1.x += 20 * Math.cos(this.angle) + 50 * Math.sin(this.angle);
                p1.y += -50 * Math.cos(this.angle) + 20 * Math.sin(this.angle);

                p2.x += 20 * Math.cos(this.angle) + 70 * Math.sin(this.angle);
                p2.y += -70 * Math.cos(this.angle) + 20 * Math.sin(this.angle);

                p3.x += 20 * Math.cos(this.angle) - 30 * Math.sin(this.angle);
                p3.y += 30 * Math.cos(this.angle) + 20 * Math.sin(this.angle);

                p4.x += 20 * Math.cos(this.angle) - 50 * Math.sin(this.angle);
                p4.y += 50 * Math.cos(this.angle) + 20 * Math.sin(this.angle);
                
                
                let b = new Bullet(p1, v, this.angle, this.playerNumber, 6, 5)
                let b1 = new Bullet(p2, v, this.angle, this.playerNumber, 6, 5)
                let b2 = new Bullet(p3, v, this.angle, this.playerNumber, 6, 5)
                let b3 = new Bullet(p4, v, this.angle, this.playerNumber, 6, 5)

                this.bullets.push(b);
                this.bullets.push(b1);
                this.bullets.push(b2);
                this.bullets.push(b3);

                break;
            }
            case 3:
            {
                let p1 = this.pos.clone();
                let p2 = this.pos.clone();

                let v = this.velocity.clone();
                
                p1.x += 100 * Math.cos(this.angle) + 65 * Math.sin(this.angle);
                p1.y += -65 * Math.cos(this.angle) + 100 * Math.sin(this.angle);

                p2.x += 100 * Math.cos(this.angle) - 50 * Math.sin(this.angle);
                p2.y += 50 * Math.cos(this.angle) + 100 * Math.sin(this.angle);
                
                let b = new Bullet(p1, v, this.angle, this.playerNumber, 10, 10)
                let b1 = new Bullet(p2, v, this.angle, this.playerNumber, 10, 10)

                this.bullets.push(b);
                this.bullets.push(b1);


                break;
            }
        
            default:
                break;
        }
    }
}

class Bullet {
    constructor(pos, velocity, angle, player, acceleration, damage){
        this.damage = damage;
        this.acceleration = acceleration;
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
        this.disconnected = 0;
        this.gameId = id;
        this.playing = false;
        this.gameOver = false;
        this.capacity = playerCount;
        this.players = [];
        this.size = new THREE.Vector3(2000, 2000);
        this.sockets = [];
        this.alivePlayers = playerCount;
    }

    join(id, type) {
        let currentPlayer = this.players.length;
        let newPlayer;
        switch (type) {
            case 0:
                newPlayer = new Player(0, id, currentPlayer, 4, 60, 100, 100, 10, 200);
                
                break;
            case 1:
                newPlayer = new Player(1, id, currentPlayer, 3, 90, 125, 125, 15, 200);
                break;
            case 2:
                newPlayer = new Player(2, id, currentPlayer, 2, 100, 150, 150, 30, 200);
                break;
            case 3:
                newPlayer = new Player(3, id, currentPlayer, 2, 100, 200, 200, 20, 100);
                break;
            default:
                break;
        }
        this.players.push(newPlayer);
        return currentPlayer;
    }

    movePlayer() {
        let wall = 100;
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
                if (this.players[i].pos.x < wall) {
                    this.players[i].pos.x = wall
                }
                if (this.players[i].pos.y < wall) {
                    this.players[i].pos.y = wall
                }
                if (this.players[i].pos.x > this.size.x-wall) {
                    this.players[i].pos.x = this.size.x-wall;
                }
                if (this.players[i].pos.y > this.size.y-wall) {
                    this.players[i].pos.y = this.size.y-wall;
                }
                this.players[i].change = false;
            } else {
                let v = this.players[i].velocity.clone();
                this.players[i].pos.add(
                  v.multiplyScalar(this.players[i].acceleration));
                if (this.players[i].pos.x < wall) {
                    this.players[i].pos.x = wall
                }
                if (this.players[i].pos.y < wall) {
                    this.players[i].pos.y = wall
                }
                if (this.players[i].pos.x > this.size.x-wall) {
                    this.players[i].pos.x =  this.size.x-wall;
                }
                if (this.players[i].pos.y >  this.size.y-wall) {
                    this.players[i].pos.y =  this.size.y-wall;
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
                  v.multiplyScalar(this.players[p].bullets[i].acceleration)
                );
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
                if (this.players[p].bullets[i].distanceTravelled > 100) {
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
        // this.playing = true;
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
            for (let i = 0; i < this.games.length; i++){
                if (this.games[i].disconnected == this.games[i].capacity) continue;
                this.games[i].playGame();
            }

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
                console.log(master.games[GAMEID].players.length);
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
            if (master.games[GAMEID].players.length == master.games[GAMEID].capacity) {
                master.games[GAMEID].playing = true;
            }
            socket.emit('init', { gameId: GAMEID, player: playerID});
        }
        master.games[GAMEID].players[playerID].ready = true;
        master.games[GAMEID].ready += 1;
        connected = true;
    })
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
        if (now - lastBullet > master.games[GAMEID].players[playerID].bulletCooldown){
            master.games[GAMEID].players[playerID].shoot();
            lastBullet = now;
        }
    })

    let interval = setInterval(gameStart, 1000/100);

    function gameStart(){
        if (connected){
            if (master.games[GAMEID].playing){
                socket.emit("play", {playersInfo: master.games[GAMEID].players})
                playing = true;
                clearInterval(interval);
            }
        }
    }
    
    let mainLoop = setInterval(updater, 1000/100)
    function updater(){
        if (playing) {
            if (
              master.games[GAMEID].alivePlayers == 1 &&
              !master.games[GAMEID].players[playerID].dead
            ) {
                socket.emit("gameover", {gameOver: true, winner: true});
            }
            if (master.games[GAMEID].players[playerID].dead) {
                socket.emit("gameover", { gameOver: true, winner: false});
            }

            let players = []
            master.games[GAMEID].players.forEach(player => {
                players.push(player.getPackedData());
            });
            socket.emit("update", {
              playersInfo: players,
            });
            if (socket.disconnected) {
                master.games[GAMEID].alivePlayers -= 1;
                master.games[GAMEID].disconnected += 1;
                socket.disconnect();
                console.log("DISCONNECTED");
                clearInterval(mainLoop); 
            }
        }

    }
});
