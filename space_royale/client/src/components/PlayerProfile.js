import React from 'react';
import './style/Profile.css'
import Navbar from './Navbar';
import jwtDecode from 'jwt-decode'
import { Stats } from 'fs';


class PlayerProfile extends React.Component{
    constructor(props) {
        super(props);
        this.token = jwtDecode(
                      localStorage.getItem("JWT")
                    );
    }
    state = {
        user: "Juan",
        kills: 10,
        games: 100,
        wins: 80,
        rockets: [],
        ships: []
    }

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

    loadProfile = () => {
        fetch(`api/profile/${this.token.id}/${this.token.database}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            this.setState({
                user: data.username,
                wins: data.wins,
                kills: data.kills,
                games: data.games,
                ships: data.ships
            });
        })
        .catch(error => {
            console.error(error);
        })
    }
    componentDidMount(){
        if (this.props.location.state){
            let stat = this.props.location.state.stat;
            this.setState({ user: stat.player, wins: stat.wins, games: stat.games, ships: stat.ships, kills: stat.kills})
        } else {
            this.setState({
                database: this.token.database,
                id: this.token.id
            })
            this.loadProfile();
        }
        this.loadShips();
    }
    render() {
        const listItems = this.state.rockets.map((d, i) => {
            return (
                <div className="col-6 show-overlayed" key={i}>
                    <div className="overlayed">
                        <h3 id={i*1000}>{this.state.ships[i]}</h3>
                    </div>
                    <img src={d} alt="" className="stat-image"/>
                </div>
            )
        })

        return(
            <div>
                <Navbar></Navbar>
                <div className="container player-container">
                    <div className="row">
                        <div className="col-4">
                            <div className="row left-row-player">
                                <div className="col-12">
                                    <h3 id="left-player">
                                        Games per ship
                                    </h3>
                                </div>
                                {listItems}
                            </div>
                        </div>
                        <div className="col-8">
                            <div className="container right-player-container">
                                <div className="row">
                                    <div className="col-12 " id="playerName">
                                        <h2>
                                            {this.state.user}
                                        </h2>
                                    </div>
                                    <div className="row container" id="stats-container">

                                        <div className="col-4 stat-title">
                                            <h3>
                                                Games Played

                                            </h3>
                                        </div>
                                        <div className="col-4 stat-title">
                                            <h3>
                                                Total Victories
                                            </h3>
                                        </div>
                                        <div className="col-4 stat-title">
                                            <h3>
                                                Career Kills
                                            </h3>
                                        </div>
                                        <div className="col-4 stat">

                                            <h3>
                                                <i className="fas fa-gamepad"></i>
                                                {this.state.games}
                                            </h3>
                                        </div>
                                        <div className="col-4 stat">
                                            <h3>
                                                <i className="fas fa-trophy"></i>
                                                {this.state.wins}
                                            </h3>
                                        </div>
                                        <div className="col-4 stat">
                                            <h3>
                                                <i className="fas fa-skull-crossbones"></i>
                                                {this.state.kills}
                                            </h3>
                                        </div>

                                    </div>
        
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        )
    }
    
}


export default PlayerProfile;