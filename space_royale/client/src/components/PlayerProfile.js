import React from 'react';
import './style/Profile.css'

class PlayerProfile extends React.Component{
    state = {
        user: "Juan",
        kills: 10,
        games: 100,
        wins: 80,
        rockets: []
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

    componentDidMount(){
        this.loadShips();
    }
    render() {
        const listItems = this.state.rockets.map((d, i) => {
            return (
                <div className="col-6 show-overlayed" id={i*99}>
                    <div className="overlayed">
                        <h3>1000</h3>
                    </div>

                    <img src={d} alt="" className="stat-image"/>
                </div>
            )
        })

        return(
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
                                            <i class="fas fa-gamepad"></i>
                                            {this.state.games}
                                        </h3>
                                    </div>
                                    <div className="col-4 stat">
                                        <h3>
                                            <i class="fas fa-trophy"></i>
                                            {this.state.wins}
                                        </h3>
                                    </div>
                                    <div className="col-4 stat">
                                        <h3>
                                            <i class="fas fa-skull-crossbones"></i>
                                            {this.state.kills}
                                        </h3>
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