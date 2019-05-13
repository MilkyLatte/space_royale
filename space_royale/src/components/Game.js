import React from 'react';
import ReactDOM from 'react-dom'
import '../App.css';
import spaceship from './rocket.png'
import background from './map.png';
import * as Three from 'three';
import { Vector2 } from 'three';



class Game extends React.Component {
    state = {
        acceleration: 0.025,
        vx: 0,
        vy: 0,

        player: {
            angle: 0,
            pos: new Vector2(50, 100),
            velocity: new Vector2(0,0)
        },
        image: 0,
        map: 0,
        mouse: new Vector2(50,100),
        change: false
    }

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
            console.log(this.state.mouse);
            newPlayer.velocity = difference.clone();
            newPlayer.velocity.normalize();
            newPlayer.pos.add(newPlayer.velocity.multiplyScalar(2));
            let newAngle = Math.atan2(difference.y, difference.x);
            newPlayer.angle = newAngle;
            this.setState({change: false, player: newPlayer});
        } else{
            newPlayer.pos.add(newPlayer.velocity);
            this.setState({player: newPlayer});
        }
        

    }

    onMouseMove = (e) => {
        let m = new Vector2(e.nativeEvent.offsetX, e.nativeEvent.offsetY);


        this.setState({ change: true, mouse: m});
    }

    draw = () => {
        const ctx = this.refs.canvas.getContext("2d");
        ctx.fillStyle = "green";
        ctx.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
        ctx.drawImage(this.state.map, Math.max(this.state.player.pos.x - 250, 0), Math.max(this.state.player.pos.y - 250, 0), 500, 500, 0, 0, 500, 500);
        if (this.state.image !== 0){
            ctx.save();
            ctx.translate(this.state.player.pos.x, this.state.player.pos.y);

            ctx.rotate((this.state.player.angle) + 90 * (Math.PI / 180) );
            ctx.translate(-25, -25);

            ctx.drawImage(this.state.image, 0, 0, 50,50 )
            ctx.restore();
  
        }
    }

    update = () => {
        this.movePlayer();


        // console.log(this.state.mouse);
        this.draw();
    }

    loadCharacter = (img) => {
        this.setState({image: img})
    }

    loadMap = (img) => {
        this.setState({map: img});
    }


    componentDidMount() {
        setInterval(() => {
            this.update();
        }, 1000/60);
        let img = new Image();
        img.onload = this.loadCharacter(img);
        img.src = spaceship;

        let bg = new Image();
        bg.onload = this.loadMap(bg); 
        bg.src = background;
    }


    render(){
        return (
            <div className="game">
                <canvas ref="canvas" width={500} height={500} onMouseMove={this.onMouseMove}/>
            </div>
        )
    }
}

export default Game;