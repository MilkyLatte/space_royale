import React from "react";
import ReactDOM from "react-dom";
import "../App.css";
import spaceship from "./rocket.png";
import background from "./map.png";
import bullet from "./bullet.png"
import { Vector2 } from "three";
import { resolve } from "url";
import io from "socket.io-client";

class Ship {
  constructor(width, height, img){
    this.width = width;
    this.height = height;
    this.image = img; 
  }
}




class Game extends React.Component {
  constructor(props) {
    super(props);
    this.playing = true;
    this.game_data = {
      bullet: {
        sprites: 0,
        width: 5,
        height: 10
      },
      canvas: {
        width: 800,
        height: 500
      },
      background: { 
        size: {
          x: 2000,
          y: 1000
        },
        sprites: 0
      },
      ships: {
        fast: {
          size: 50,
          sprites: 0
        }
      },
      rockets: []
      
    };
    this.players = [];
    this.placeholder = [];

    this.mouse = new Vector2(50, 100);
    this.change = false;
    this.playerNumber = 0;
    this.socket = io.connect("http://localhost:5000");
    this.gameId = 0;
    this.gameOver = false;
  }

  state = {
    renderResponse: ""
  };

  getResponse = async () => {
    const response = await fetch("/api/hello");
    // console.log(response);
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };


  onMouseMove = e => {
    if (this.playing && !this.gameOver) {
      let halfx = this.game_data.canvas.width / 2;
      let halfy = this.game_data.canvas.height / 2;
      let leftCornerx = Math.min(
        Math.max(0, this.players[this.playerNumber].pos.x - halfx),
        this.game_data.background.size.x - this.game_data.canvas.width
      );
      let leftCornery = Math.min(
        Math.max(0, this.players[this.playerNumber].pos.y - halfy),
        this.game_data.background.size.y - this.game_data.canvas.height
      );
      let m = new Vector2(
        e.nativeEvent.offsetX + leftCornerx,
        e.nativeEvent.offsetY + leftCornery
      );

      this.mouse = m;
      // console.log(m);
      this.change = true;
      this.socket.emit("state", {
        gameId: this.gameId,
        playerId: this.playerNumber,
        mouseInfo: m
      });
    }
  };

  drawPlayers = () => {
    let halfx = this.game_data.canvas.width / 2;
    let halfy = this.game_data.canvas.height / 2;
    const ctx = this.refs.canvas.getContext("2d");
    ctx.fillStyle = "green";
    ctx.fillRect(
      0,
      0,
      this.game_data.canvas.width,
      this.game_data.canvas.height
    );
    let dx;
    let dy;
    if (this.players[this.playerNumber].pos.x < halfx) {
      dx = 0;
    } else if (
      this.players[this.playerNumber].pos.x >
      this.game_data.background.size.x - halfx
    ) {
      dx = this.game_data.background.size.x - this.game_data.canvas.width;
    } else {
      dx = this.players[this.playerNumber].pos.x - halfx;
    }

    if (this.players[this.playerNumber].pos.y < halfy) {
      dy = 0;
    } else if (
      this.players[this.playerNumber].pos.y >
      this.game_data.background.size.y - halfy
    ) {
      dy = this.game_data.background.size.y - this.game_data.canvas.height;
    } else {
      dy = this.players[this.playerNumber].pos.y - halfy;
    }

    ctx.drawImage(
      this.game_data.background.sprites,
      dx,
      dy,
      this.game_data.canvas.width,
      this.game_data.canvas.height,
      0,
      0,
      this.game_data.canvas.width,
      this.game_data.canvas.height
    );

    let leftCornerx = 0;
    let leftCornery = 0;
    if (this.game_data.rockets[0].image !== 0) {
      if (this.players[this.playerNumber].pos.x > this.game_data.background.size.x - halfx) {
        leftCornerx = this.players[this.playerNumber].pos.x - (this.game_data.background.size.x - this.game_data.canvas.width);
      } else if (this.players[this.playerNumber].pos.x < halfx) {
        leftCornerx = this.players[this.playerNumber].pos.x;
      } else {
        leftCornerx = halfx;
      }

      if (
        this.players[this.playerNumber].pos.y >
        this.game_data.background.size.y - halfy
      ) {
        leftCornery =
          this.players[this.playerNumber].pos.y -
          (this.game_data.background.size.y - this.game_data.canvas.height);
      } else if (this.players[this.playerNumber].pos.y < halfy) {
        leftCornery = this.players[this.playerNumber].pos.y;
      } else {
        leftCornery = halfy;
      }
      // console.log(leftCornerx);

      ctx.save();
      ctx.translate(leftCornerx, leftCornery);

      ctx.rotate(this.players[this.playerNumber].angle + 90 * (Math.PI / 180));
      ctx.translate(-50, -50);

      ctx.drawImage(this.game_data.rockets[this.players[this.playerNumber].type].image, 0, 0, 100, 100);
      ctx.restore();
    }

    let canvas = this.getCavasPosition();

    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].dead) continue;
      if (i !== this.playerNumber) {
        if (this.inCanvas(this.players[i].pos)) {
          ctx.save();
          // ctx.translate(tcanvas.x, canvas.y);
          ctx.translate(this.players[i].pos.x - canvas.x, this.players[i].pos.y - canvas.y);
          // console.log(this.players[i].pos);

          ctx.rotate(this.players[i].angle + 90 * (Math.PI / 180));
          ctx.translate(-25, -25);

          ctx.drawImage(
            this.game_data.rockets[this.players[i].type].image,0,0,100,100
          );
          ctx.restore();
        }
          // console.log("HERE");
        
      }
    }
  };

  getCavasPosition = () => {
    let halfx = this.game_data.canvas.width / 2;
    let halfy = this.game_data.canvas.height / 2;
    let canvasx;
    let canvasy;
    if (this.players[this.playerNumber].pos.x < halfx) {
      canvasx = 0;
    } else if (
      this.players[this.playerNumber].pos.x >
      this.game_data.background.size.x - halfx
    ) {
      canvasx =
        this.game_data.background.size.x -
        this.game_data.canvas.width;
    } else {
      canvasx = this.players[this.playerNumber].pos.x - halfx;
    }

    if (this.players[this.playerNumber].pos.y < halfy) {
      canvasy = 0;
    } else if (
      this.players[this.playerNumber].pos.y >
      this.game_data.background.size.y - halfy
    ) {
      canvasy =
        this.game_data.background.size.y -
        this.game_data.canvas.height;
    } else {
      canvasy = this.players[this.playerNumber].pos.y - halfy;
    }

    return {x: canvasx, y: canvasy}
  }

  inCanvas = (pos) => {
    let canvas = this.getCavasPosition();
    if (  pos.x >= canvas.x &&
          pos.x <= canvas.x + this.game_data.canvas.width &&
          pos.y >= canvas.y &&
          pos.y <= canvas.y + this.game_data.canvas.height){
            return true;
          } else {
            return false;
          }
  }

  drawBullets = () => {
    const ctx = this.refs.canvas.getContext("2d");
    for (let i = 0; i < this.players.length; i++) {
      for (let b = 0; b < this.players[i].bullets.length; b++){
        if (this.inCanvas(this.players[i].bullets[b].pos)){
          let canvas = this.getCavasPosition();
          ctx.save();
          ctx.translate(
            this.players[i].bullets[b].pos.x - canvas.x,
            this.players[i].bullets[b].pos.y - canvas.y
          );
  
          ctx.rotate(
            this.players[i].bullets[b].angle +
              90 * (Math.PI / 180)
          );
  
          ctx.drawImage(this.game_data.bullet.sprites, 0, 0, 20, 40);
  
          ctx.restore();

        }

      }
    }

  }

  update = () => {
    // this.game_data.canvas.width = window.innerWidth;
    // this.game_data.canvas.height = window.innerHeight;
    // console.log(this.players); 
    if (this.gameOver) console.log("GAMEOVER");
    if (this.playing && !this.gameOver){
        this.drawPlayers();
        this.drawBullets();
    }
  };

  fire = e => {
    if (e.code === "Space"){
      this.socket.emit("fire", {player: this.playerNumber});
    }
  }

  loadCharacter = img => {
    this.game_data.rockets.push(new Ship(50, 50, img))
    // this.game_data.ships.fast.sprites = img;
    // this.setState({image: img})
  };

  loadMap = img => {
    this.game_data.background.sprites = img;
  };

  loadBullet = img => {
    this.game_data.bullet.sprites = img;
  }

  onMouseEnter = e => {
    this.change = true;
  };

  onMouseLeave = e => {
    this.setState({ change: false });
  };

  updateGame = data => {
    this.players = data.playersInfo;
  }

  dead = data => {
    console.log("FINISHED");
    this.gameOver = true;
  }

  initGame = data => {
    this.gameId = data.gameId;
    this.playerNumber = data.player;
  };

  play = data => {
    this.players = data.playersInfo;
    this.playing = true;

    this.socket.on("update", this.updateGame);
    this.socket.on("gameover", this.dead);
    document.addEventListener("keydown", this.fire, false);
    setInterval(() => {
      this.update();
    }, 1000 / 100);
  }

  

  componentDidMount() {

    // img.src = spaceship;

    let bg = new Image();
    bg.onload = this.loadMap(bg);
    bg.src = background;

    for (let i = 0; i < 5; i++){
      if (i == 4){
        let b = new Image();
        b.onload = this.loadBullet(b);
        fetch("api/ships")
          .then(res => res.json())
          .then(data => {
            b.src = `data:image/svg+xml;base64, ${
              data.express[i]
            }`;
          });
          continue;
      }
      let img = new Image();
      img.onload = this.loadCharacter(img);
      fetch("api/ships")
        .then(res => res.json())
        .then(data => {
          img.src = `data:image/svg+xml;base64, ${data.express[i]}`});
    }

    fetch("api/hello")
      .then(res => res.json())
      .then(data => this.setState({ renderResponse: data }))
      .catch(err => console.log(err));
    
    this.socket.emit("choice", {type: Math.floor(Math.random() * 4) });
    this.socket.on("play", this.play);
    this.socket.on("init", this.initGame);
  }

  componentWillUnmount(){
        document.removeEventListener(
          "keydown",
          this.fire,
          false
        );
  }

  render() {
    return (
      <div className="game">
        <canvas
          ref="canvas"
          width={this.game_data.canvas.width}
          height={this.game_data.canvas.height}
          onMouseMove={this.onMouseMove}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          onKeyDown = {this.fire}
        />
        <p>{this.state.renderResponse.express}</p>
      </div>
    );
  }
}

export default Game;
