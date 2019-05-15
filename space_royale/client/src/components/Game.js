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

    state = {
        // acceleration: 0.025,
        game_data: {
            background: {
                size: {
                    x: 2000,
                    y: 1000,
                    sprites: 0
                }
            },
            ships: {
                rogue:{
                    size: 50,
                    sprites: 0
                }
            }
        },

        players: {
            0: {
                angle: 0,
                pos: new Vector2(50, 100),
                velocity: new Vector2(50, 100),
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
        },

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
        let pos = this.state.player.pos.clone();
        let velocity = this.state.player.velocity.clone();
        let newPlayer = {
            pos,
            velocity,
            angle: this.state.player.angle
        }

        // let newPlayer = Object.assign(Object.create(Object.getPrototypeOf(this.state.player)), this.state.player)
        let difference = this.state.mouse.clone();
        if (this.state.change){
            difference.sub(newPlayer.pos);
            newPlayer.velocity = difference.clone();
            newPlayer.velocity.normalize();
            newPlayer.pos.add(newPlayer.velocity.multiplyScalar(3));
            let newAngle = Math.atan2(difference.y, difference.x);
            newPlayer.angle = newAngle;
            if (newPlayer.pos.x < 0) {
                newPlayer.pos.x = 0
            }
            if (newPlayer.pos.y < 0) {
                newPlayer.pos.y = 0
            }

            if (newPlayer.pos.x > 2000) {
                newPlayer.pos.x = 2000
            }
            if (newPlayer.pos.y > 1000) {
                newPlayer.pos.y = 1000
            }
            this.setState({change: false, player: newPlayer});
        }
         else{
            newPlayer.pos.add(newPlayer.velocity);
            if (newPlayer.pos.x < 0) {
                newPlayer.pos.x = 0
            }
            if (newPlayer.pos.y < 0) {
                newPlayer.pos.y = 0
            }

            if (newPlayer.pos.x > 2000) {
                newPlayer.pos.x = 2000
            }
            if (newPlayer.pos.y > 1000) {
                newPlayer.pos.y = 1000
            }
            this.setState({player: newPlayer});
        }
        

    }

    onMouseMove = (e) => {
        let leftCornerx = Math.min(Math.max(0, this.state.player.pos.x-250) , 1500);
        let leftCornery = Math.min(Math.max(0, this.state.player.pos.y-250), 500);
        let m = new Vector2(e.nativeEvent.offsetX+leftCornerx, e.nativeEvent.offsetY+leftCornery);
        console.log(m)
        this.setState({ change: true, mouse: m });
        socket.emit('state', this.state);
    }

    draw = () => {
        const ctx = this.refs.canvas.getContext("2d");
        ctx.fillStyle = "green";
        ctx.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
        ctx.drawImage(this.state.map, Math.max(this.state.player.pos.x - 250, 0), Math.max(this.state.player.pos.y - 250, 0), 500, 500, 0, 0, 500, 500);
        if (this.state.image !== 0){
            
            let leftCornerx = 0;
            let leftCornery = 0

            
            if (this.state.player.pos.x > 2000 - 250) {
                leftCornerx = this.state.player.pos.x - 1500;
            }  else if (this.state.player.pos.x < 250) {
                leftCornerx = this.state.player.pos.x;
            } else {
                leftCornerx = 250;
            }

            if (this.state.player.pos.y > 1000 - 250) {
                leftCornery = this.state.player.pos.y - 500;
            } else if (this.state.player.pos.y < 250) {
                leftCornery = this.state.player.pos.y;
            } else {
                leftCornery = 250;
            }

            
            ctx.save();
            ctx.translate(leftCornerx, leftCornery);

            ctx.rotate((this.state.player.angle) + 90 * (Math.PI / 180) );
            ctx.translate(-25, -25);

            ctx.drawImage(this.state.image, 0, 0, 50,50 )
            ctx.restore();  
  
        }
    }

    update = () => {
        this.movePlayer();


        // console.log(this.state.renderResponse);
        this.draw();
    }

    loadCharacter = (img) => {
        this.setState({image: img})
    }

    loadMap = (img) => {
        this.setState({map: img});
    }

    onMouseEnter = (e) => {
        this.setState({ change: true });
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
        console.log("HELLO");


    }




    render(){
        return (
            <div className="game">
                <canvas ref="canvas" width={500} height={500} onMouseMove={this.onMouseMove} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}/>
                <p>{this.state.renderResponse.express}</p>
            </div>
        )
    }
}

export default Game;