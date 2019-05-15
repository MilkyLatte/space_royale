import React from 'react';
import ReactDOM from 'react-dom'
import '../App.css';
import spaceship from './rocket.png'
import background from './map.png';
import { Vector2 } from 'three';
import { resolve } from 'url';
import io from 'socket.io-client';


let socket = io.connect("http://localhost:5000");

class Game extends React.Component {
    constructor(props){
        super(props);
        this.game_data = {
            canvas: {
                width: 1000,
                height: 1000
            },
            background: {
                size: {
                    x: 2300,
                    y: 1000,
                },
                sprites: 0
            },
            ships:{
                fast: {
                    size: 50,
                    sprites: 0
                }
            }
        }
        this.players = {
            0: {
                angle: 0,
                pos: new Vector2(50, 100),
                velocity: new Vector2(0, 0),
                acceleration: 3
            },
            1: {
                angle: 0,
                pos: new Vector2(1250, 100),
                velocity: new Vector2(50, 100),
                acceleration: 3
            },
            2: {
                angle: 0,
                pos: new Vector2(50, 900),
                velocity: new Vector2(50, 100),
                acceleration: 3
            },
            3: {
                angle: 0,
                pos: new Vector2(50, 100),
                velocity: new Vector2(50, 100),
                acceleration: 3
            }
        }
        this.mouse = new Vector2(50, 100);
        this.change = false;
    }

    state = {
        // acceleration: 0.025,




        player: {
            angle: 0,
            pos: new Vector2(50, 100),
            velocity: new Vector2(0,0)
        },
        image: 0,
        map: 0,
        mouse: new Vector2(50,100),
        change: false,
        renderResponse: ""
    }

    getResponse = async() => {
        const response = await fetch('/api/hello');
        console.log(response);
        const body = await response.json();
        if (response.status !== 200) throw Error (body.message);
        return body;
    }

    // fetch('/api/hello')
    //         .then(res => res.json())
    //         .then(data => this.setState({ renderResponse: data }))
    // .catch(err => console.log(err));

    movePlayer = () => {

        // let this.players[0] = Object.assign(Object.create(Object.getPrototypeOf(this.players[0])), this.players[0])
        let difference = this.mouse.clone();
        if (this.change){
            difference.sub(this.players[0].pos);
            this.players[0].velocity = difference.clone();
            this.players[0].velocity.normalize();
            this.players[0].pos.add(this.players[0].velocity.multiplyScalar(3));
            let newAngle = Math.atan2(difference.y, difference.x);
            this.players[0].angle = newAngle;
            if (this.players[0].pos.x < 0) {
                this.players[0].pos.x = 0
            }
            if (this.players[0].pos.y < 0) {
                this.players[0].pos.y = 0
            }

            if (this.players[0].pos.x > this.game_data.background.size.x) {
                this.players[0].pos.x = this.game_data.background.size.x;
            }
            if (this.players[0].pos.y > this.game_data.background.size.y) {
                this.players[0].pos.y = this.game_data.background.size.y;
            }
            this.change = false;
        }
         else{
            this.players[0].pos.add(this.players[0].velocity);
            if (this.players[0].pos.x < 0) {
                this.players[0].pos.x = 0
            }
            if (this.players[0].pos.y < 0) {
                this.players[0].pos.y = 0
            }

            if (this.players[0].pos.x > this.game_data.background.size.x) {
                this.players[0].pos.x = this.game_data.background.size.x;
            }
            if (this.players[0].pos.y > this.game_data.background.size.y) {
                this.players[0].pos.y = this.game_data.background.size.y;
            }
        }
    }

    onMouseMove = (e) => {
        let halfx = this.game_data.canvas.width / 2;
        let halfy = this.game_data.canvas.height / 2;
        let leftCornerx = Math.min(Math.max(0, this.players[0].pos.x - halfx), this.game_data.background.size.x - this.game_data.canvas.width);
        let leftCornery = Math.min(Math.max(0, this.players[0].pos.y - halfy), this.game_data.background.size.y - this.game_data.canvas.height);
        let m = new Vector2(e.nativeEvent.offsetX+leftCornerx, e.nativeEvent.offsetY+leftCornery);
        console.log(m)
        this.mouse = m;
        this.change = true;
        socket.emit('state', this.players[0]);
    }

    draw = () => {
        let halfx = this.game_data.canvas.width / 2;
        let halfy = this.game_data.canvas.height / 2;
        const ctx = this.refs.canvas.getContext("2d");
        ctx.fillStyle = "green";
        ctx.fillRect(0, 0, this.game_data.canvas.width, this.game_data.canvas.height);
        let dx;
        let dy;
        if (this.players[0].pos.x < halfx) {
            dx = 0
        } else if (this.players[0].pos.x > this.game_data.background.size.x - halfx) {
            dx = this.game_data.background.size.x - this.game_data.canvas.width;
        } else {
            dx = this.players[0].pos.x - halfx;
        }

        if (this.players[0].pos.y < halfy) {
            dy = 0
        } else if (this.players[0].pos.y > this.game_data.background.size.y - halfy) {
            dy = this.game_data.background.size.y - this.game_data.canvas.height;
        } else {
            dy = this.players[0].pos.y - halfy;
        }

        ctx.drawImage(this.game_data.background.sprites, dx, dy, this.game_data.canvas.width, this.game_data.canvas.height, 0, 0, this.game_data.canvas.width, this.game_data.canvas.height);
        if (this.game_data.ships.fast.sprites !== 0){
            
            let leftCornerx = 0;
            let leftCornery = 0;

            
            if (this.players[0].pos.x > this.game_data.background.size.x - halfx) {
                leftCornerx = this.players[0].pos.x - (this.game_data.background.size.x - this.game_data.canvas.width);
            }  else if (this.players[0].pos.x < halfx) {
                leftCornerx = this.players[0].pos.x;
            } else {
                leftCornerx = halfx;
            }

            if (this.players[0].pos.y > this.game_data.background.size.y - halfy) {
                leftCornery = this.players[0].pos.y - (this.game_data.background.size.y - this.game_data.canvas.height);
            } else if (this.players[0].pos.y < halfy) {
                leftCornery = this.players[0].pos.y;
            } else {
                leftCornery = halfy;
            }
            
            ctx.save();
            ctx.translate(leftCornerx, leftCornery);

            ctx.rotate((this.players[0].angle) + 90 * (Math.PI / 180) );
            ctx.translate(-25, -25);

            ctx.drawImage(this.game_data.ships.fast.sprites, 0, 0, 50,50 )
            ctx.restore();  
  
        }
    }

    update = () => {
        this.movePlayer();


        // console.log(this.players[0].pos);
        this.draw();
    }

    loadCharacter = (img) => {
        this.game_data.ships.fast.sprites = img;
        // this.setState({image: img})
    }

    loadMap = (img) => {
        this.game_data.background.sprites = img;
    }

    onMouseEnter = (e) => {
        this.change = true;
    }

    onMouseLeave = (e) => {
        this.setState({ change: false });
    }
    componentDidMount() {
        // this.getResponse().then(res => {
        //     const someData = res;
        //     this.setState({ renderResponse: someData });
        // });
        setInterval(() => {
            this.update();
        }, 1000/60);
        let img = new Image();
        img.onload = this.loadCharacter(img);
        img.src = spaceship;
        
        let bg = new Image();
        bg.onload = this.loadMap(bg); 
        bg.src = background;
        fetch('api/hello')
            .then(res => res.json())
            .then(data => this.setState({ renderResponse: data }))
            .catch(err => console.log(err));


    }




    render(){
        return (
            <div className="game">
                <canvas ref="canvas" width={this.game_data.canvas.width} height={this.game_data.canvas.height} onMouseMove={this.onMouseMove} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}/>
                <p>{this.state.renderResponse.express}</p>
            </div>
        )
    }
}

export default Game;