import React from 'react';

class Game extends React.Component {
    state = {
        mouseX: 50,
        mouseY: 100,
        player: {
            x: 50,
            y: 100,
        }
    }

    onMouseMove = (e) => {
        this.setState({ player: {x: e.screenX, y: e.screenY}});
    }

    draw = () => {
        const ctx = this.refs.canvas.getContext("2d");
        ctx.fillStyle = "green";
        ctx.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
    
        ctx.fillStyle = "white";

        ctx.beginPath();
        ctx.moveTo(this.state.player.x, this.state.player.y);
        ctx.lineTo(this.state.player.x + 25, this.state.player.y + 25);
        ctx.lineTo(this.state.player.x + 25, this.state.player.y - 25);

        ctx.fill();
    }

    update = () => {
        console.log(this.state.player);
        this.draw();
    }

    componentDidMount() {
        setInterval(() => {
            this.update();
        }, 1000/60);
    }


    render(){
        return (
            <div>
                <canvas ref="canvas" width={500} height={500} onMouseMove={this.onMouseMove}/>
            </div>
        )
    }
}

export default Game;