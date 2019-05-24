import React from "react";
import Slider from "./Slider";
import "./Lobby.css"
import Chart from "./Chart";
import GoButton from "./GoButton";
import { Redirect } from 'react-router-dom'
import { withRouter } from 'react-router'


class ShipStats {
    constructor(message, health, speed, firepower) {
        this.message = message;
        this.health = health;
        this.speed = speed;
        this.firepower = firepower;
        this.redirect = false;
    }
}

class Lobby extends React.Component {
    state = {
        current: 0,
        rockets: [],
        stats: []
    };

    loader = img => {
        let copy = this.state.rockets;
        copy.push(img);
        this.setState({ rockets: copy });
    };

    loadShips = () => {
        for (let i = 0; i < 4; i++) {
            fetch("api/ships")
                .then(res => res.json())
                .then(data => {
                    let src = `data:image/svg+xml;base64, ${data.express[i]}`;
                    this.loader(src);
                });
        }
    };

    componentDidMount() {
        this.loadShips();
        let s = []
        let s0 = new ShipStats("The fastest of all ships(and the most fragile)", "60", "Fast", "Medium")
        s.push(s0);
        let s1 = new ShipStats("A fast balanced ship", "70", "Fast", "Medium")
        s.push(s1);
        let s2 = new ShipStats("A short-range shooting powerhouse", "90", "Medium", "Medium")
        s.push(s2);
        let s3 = new ShipStats("The tankiest of all", "90", "Slow", "Strong")
        s.push(s3);

        this.setState({stats: s});

    }

    componentDidUpdate() {
        // console.log(this.state.rockets)
    }

    rightClick = () => {
        let value = (this.state.current + 1) % 4;
        this.setState({ current: value })
    }

    leftClick = () => {
        let value = (this.state.current - 1)
        if (value < 0) value = 3;
        this.setState({ current: value })

    }

    redirect = (e) => {
        this.setState({redirect: true})
    }


    render(){
        if (this.state.redirect) {
            return <Redirect push to={{
                pathname: '/game',
                state: { choice: this.state.current }
            }}/>
        }
        return(
            <div className="container">
                <div className="row" id="main-row">
                <div className="col-7">
                        <div className="row">
                            <div className="arrow-button col-1"><i className="fas fa-arrow-circle-left" onClick={this.leftClick} ></i></div>
                            <div className="col-10">
                                <Slider source={this.state.rockets[this.state.current]}></Slider>
                            </div>
                            <div className="arrow-button col-1"><i className="fas fa-arrow-circle-right" onClick={this.rightClick}></i></div>
                        </div>
                </div>
                <div className="col-5">
                    <div className="row">
                    <div className="col-12">
                                <Chart description={this.state.stats[this.state.current]}></Chart>
                    </div>
                    <div className="col-12" onClick={this.redirect}>
                        <GoButton />
                    </div>
                    </div>
                </div>
                </div>
            </div>
        )
    }
}

export default Lobby;