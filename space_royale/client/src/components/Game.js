import React from "react";
import "./style/Game.css";
import { Link } from 'react-router-dom';

import { Vector2 } from "three";
import io from "socket.io-client";
import * as sizeof from "object-sizeof";
import { Redirect } from 'react-router-dom'
import Navbar from "./Navbar";


class Ship {
  constructor(width, height, img) {
    this.width = width;
    this.height = height;
    this.image = img;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.playing = false;
    this.game_data = {
      bullet: {
        sprites: 0,
        width: 5,
        height: 10
      },
      canvas: {
        width: 1000,
        height: 600
      },
      background: {
        size: {
          x: 2000,
          y: 2000
        },
        sprites: 0
      },
      rockets: [],
      UI: {
        health: [],
        bullets: 0
      }
    };
    this.players = [];
    this.placeholder = [];
    this.loading = 200;
    this.mouse = new Vector2(50, 100);
    this.change = false;
    this.playerNumber = 0;
    this.socket = io.connect("http://localhost:5000");
    this.gameId = 0;
    this.gameOver = false;
    this.unmounted = false;
    this.choice = 0;
  }

  state = {
    redirect: false,
    gameOver: false,
    winner: false,
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
  drawLoading = () => {
    const ctx = this.refs.canvas.getContext("2d");
    ctx.fillStyle = "green";
    ctx.fillRect(
      0,
      0,
      this.game_data.canvas.width,
      this.game_data.canvas.height
    );

    ctx.font = "68px VT323";

    ctx.fillStyle = "white";
    ctx.fillText(
      "Loading...",
      this.game_data.canvas.width / 2 -100,
      this.game_data.canvas.height / 2
    );

    ctx.save();
    ctx.translate(this.loading, this.game_data.canvas.height/2 + 40);

    ctx.rotate(90 * (Math.PI / 180));
    ctx.translate(
      -this.game_data.rockets[0].width / 2,
      -this.game_data.rockets[0].height / 2
    );

    ctx.drawImage(
      this.game_data.rockets[0].image,
      0,
      0,
      this.game_data.rockets[0].width,
      this.game_data.rockets[0].height
    );
    ctx.restore();

    this.loading += 1;
    if (this.loading > 800) this.loading = 200;

  };

  drawPlayers = () => {
    let halfx = this.game_data.canvas.width / 2;
    let halfy = this.game_data.canvas.height / 2;
    const ctx = this.refs.canvas.getContext("2d");

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
      if (
        this.players[this.playerNumber].pos.x >
        this.game_data.background.size.x - halfx
      ) {
        leftCornerx =
          this.players[this.playerNumber].pos.x -
          (this.game_data.background.size.x - this.game_data.canvas.width);
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
      ctx.translate(
        -this.game_data.rockets[this.players[this.playerNumber].type].width / 2,
        -this.game_data.rockets[this.players[this.playerNumber].type].height / 2
      );

      ctx.drawImage(
        this.game_data.rockets[this.players[this.playerNumber].type].image,
        0,
        0,
        this.game_data.rockets[this.players[this.playerNumber].type].width,
        this.game_data.rockets[this.players[this.playerNumber].type].height
      );
      ctx.restore();
    }

    let canvas = this.getCavasPosition();

    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].dead) continue;
      if (i !== this.playerNumber) {
        if (this.inCanvas(this.players[i].pos)) {
          ctx.save();
          // ctx.translate(tcanvas.x, canvas.y);
          ctx.translate(
            this.players[i].pos.x - canvas.x,
            this.players[i].pos.y - canvas.y
          );
          // console.log(this.players[i].pos);

          ctx.rotate(this.players[i].angle + 90 * (Math.PI / 180));
          ctx.translate(
            -this.game_data.rockets[this.players[i].type].width / 2,
            -this.game_data.rockets[this.players[i].type].height / 2
          );

          ctx.drawImage(
            this.game_data.rockets[this.players[i].type].image,
            0,
            0,
            this.game_data.rockets[this.players[i].type].width,
            this.game_data.rockets[this.players[i].type].height
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
      canvasx = this.game_data.background.size.x - this.game_data.canvas.width;
    } else {
      canvasx = this.players[this.playerNumber].pos.x - halfx;
    }

    if (this.players[this.playerNumber].pos.y < halfy) {
      canvasy = 0;
    } else if (
      this.players[this.playerNumber].pos.y >
      this.game_data.background.size.y - halfy
    ) {
      canvasy = this.game_data.background.size.y - this.game_data.canvas.height;
    } else {
      canvasy = this.players[this.playerNumber].pos.y - halfy;
    }

    return { x: canvasx, y: canvasy };
  };

  inCanvas = pos => {
    let canvas = this.getCavasPosition();
    if (
      pos.x >= canvas.x &&
      pos.x <= canvas.x + this.game_data.canvas.width &&
      pos.y >= canvas.y &&
      pos.y <= canvas.y + this.game_data.canvas.height
    ) {
      return true;
    } else {
      return false;
    }
  };

  drawBullets = () => {
    const ctx = this.refs.canvas.getContext("2d");
    for (let i = 0; i < this.players.length; i++) {
      for (let b = 0; b < this.players[i].bullets.length; b++) {
        if (this.inCanvas(this.players[i].bullets[b].pos)) {
          let canvas = this.getCavasPosition();
          ctx.save();
          ctx.translate(
            this.players[i].bullets[b].pos.x - canvas.x,
            this.players[i].bullets[b].pos.y - canvas.y
          );

          ctx.rotate(this.players[i].bullets[b].angle + 90 * (Math.PI / 180));

          ctx.drawImage(this.game_data.bullet.sprites, 0, 0, 20, 40);

          ctx.restore();
        }
      }
    }
  };

  drawUI = () => {
    const ctx = this.refs.canvas.getContext("2d");
    let health = Math.floor(this.players[this.playerNumber].health / 10);
    ctx.drawImage(this.game_data.UI.health[health], 50, 500, 400, 60);
    ctx.drawImage(this.game_data.UI.bullets, 800, 480, 150, 75);

  };
  update = () => {
    if (this.gameOver) console.log("GAMEOVER");
    if (this.playing && !this.gameOver) {
      this.drawPlayers();
      this.drawBullets();
      this.drawUI();
    }
  };

  mainUpdateLoop = setInterval(() => {
    this.update();
  }, 1000 / 100);

  fire = e => {
    if (e.code === "Space") {
      this.socket.emit("fire", { player: this.playerNumber });
    }
  };

  loadCharacter = (img, type) => {
    switch (type) {
      case 0:
        this.game_data.rockets.push(new Ship(100, 100, img));
        break;
      case 1:
        this.game_data.rockets.push(new Ship(125, 125, img));
        break;
      case 2:
        this.game_data.rockets.push(new Ship(150, 150, img));
        break;
      case 3:
        this.game_data.rockets.push(new Ship(200, 200, img));
        break;
      default:
        break;
    }
  };

  loadMap = img => {
    this.game_data.background.sprites = img;
  };

  loadBullet = img => {
    this.game_data.bullet.sprites = img;
  };

  onMouseEnter = e => {
    this.change = true;
  };

  onMouseLeave = e => {
    this.setState({ change: false });
  };

  interpolate = data => {
    for (let i = 0; i < data.playersInfo.length; i++) {
      this.players[i].health = data.playersInfo[i].health;
      this.players[i].dead = data.playersInfo[i].dead;

      this.players[i].bullets = data.playersInfo[i].bullets;
      this.players[i].pos.x =
        (this.players[i].pos.x + data.playersInfo[i].pos.x) / 2;
      this.players[i].pos.y =
        (this.players[i].pos.y + data.playersInfo[i].pos.y) / 2;
      this.players[i].angle = data.playersInfo[i].angle;
    }
  };

  updateGame = data => {
    this.interpolate(data);
  };

  dead = data => {
    console.log("FINISHED");
    this.gameOver = true;
    this.socket.disconnect();
    clearInterval(this.mainUpdateLoop);
    this.setState({gameOver: true, winner: data.winner})
  };

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

  };

  loadShips = () => {
    for (let i = 0; i < 5; i++) {
      if (i == 4) {
        let b = new Image();
        b.onload = this.loadBullet(b);
        fetch("api/ships")
          .then(res => res.json())
          .then(data => {
            b.src = `data:image/svg+xml;base64, ${data.express[i]}`;
          });
        continue;
      }
      let img = new Image();
      img.onload = this.loadCharacter(img, i);
      fetch("api/ships")
        .then(res => res.json())
        .then(data => {
          img.src = `data:image/svg+xml;base64, ${data.express[i]}`;
        });
    }
  };

  loadUI = (img, bullet) => {
    if (!bullet) {
      this.game_data.UI.health.push(img);
    } else {
      this.game_data.UI.bullets = img;
    }
  };
  loadUIElements = () => {
    for (let i = 10; i >= 0; i--) {
      let img = new Image();
      img.onload = this.loadUI(img, false);
      fetch("api/hp")
        .then(res => res.json())
        .then(data => {
          img.src = `data:image/svg+xml;base64, ${data.express[i]}`;
        });
    }
    let img = new Image();
    img.onload = this.loadUI(img, true);
    fetch("api/bulletCounter")
      .then(res => res.json())
      .then(data => {
        img.src = `data:image/svg+xml;base64, ${data.express}`;
      });

    //for background
  };

  bgloader = img => {
    this.game_data.background.sprites = img;
  };

  loadBackground = () => {
    let img = new Image();
    img.onload = this.bgloader(img);
    fetch("api/background")
      .then(res => res.json())
      .then(data => {
        img.src = `data:image/png;base64, ${data.express}`;
      });
  };

  componentDidMount() {
    if (!this.props.location.state){
      this.setState({ redirect: true })
    } else {
      this.choice = this.props.location.state.choice;
      this.loadBackground();
      this.loadShips();
      this.loadUIElements();
  
      fetch("api/hello")
        .then(res => res.json())
        .then(data => this.setState({ renderResponse: data }))
        .catch(err => console.log(err));
      let loading = setInterval(() => {
        if(this.refs.canvas) {
          this.drawLoading();
        }
        if (this.playing) clearInterval(loading);
      }, 1000/100)
      this.socket.emit("choice", { type: this.props.location.state.choice, token: localStorage.getItem('JWT') });
      this.socket.on("init", this.initGame);
      this.socket.on("play", this.play);
    }
    
  }

  componentWillUnmount() {
    clearInterval(this.mainUpdateLoop);
    this.playing = false;
    this.socket.disconnect();
    document.removeEventListener("keydown", this.fire, false);
  }
  gameOverButtons() {
    let gameOverMessage;

    if (this.state.gameOver && this.state.winner) {
      gameOverMessage = <h2 id="victory">VICTORY</h2>;
    } else {
      gameOverMessage = <h2 id="defeat">DEFEAT</h2>;
    }

    if (this.state.gameOver) {
      return (
        <div className="gameover-container">

          <div className="row">
            <div className="col-12" id="top-row">
              <div className="GameOver">{gameOverMessage}</div>
            </div>
            <div className="col-lg-12">
              <Link  to="/lobby">
                <button id="home-button">
                  <i className="fas fa-home"></i>
                </button>
              </Link>
            </div>
          </div>

        </div>

      )
    }
  }


  render() {
    if (this.state.redirect) {
      return <Redirect  to= '/lobby'/>
    }
    return (
      <div>
        <Navbar inGame={true}></Navbar>
        <div id="gameContainer" className="container">
        {this.gameOverButtons()}
          <canvas className="gameCanvas"
            ref="canvas"
            width={this.game_data.canvas.width}
            height={this.game_data.canvas.height}
            onMouseMove={this.onMouseMove}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
            onKeyDown={this.fire}
          />
          <p>{this.state.renderResponse.express}</p>
        </div>


      </div>
    );
  }
}

export default Game;
        