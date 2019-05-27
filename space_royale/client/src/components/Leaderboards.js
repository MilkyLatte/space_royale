import React from "react"
import Navbar from "./Navbar";
import { Stats } from "fs";
import "./style/Leaderboards.css";
import {Link} from 'react-router-dom';

class Stat {
    constructor(player, wins, games, kills, ships, playerID, database){
        this.player = player;
        this.wins = wins;
        this.games = games;
        this.kills = kills;
        this.ships = ships;
        this.playerID = playerID;
        this.database = database;
    }
}

class Leaderboards extends React.Component{
    constructor (props){
        super(props);
    }

    state = {
        stats: []
    }

    loadTopFTY = () => {
        let s = []

        fetch('/api/leaderboard')
        .then(res => res.json())
        .then(response => {
            let data = response.data;        
            for (let i = 0; i < data.length; i++) {
                let stat = new Stat(data[i].username, data[i].wins, data[i].games, data[i].kills, [data[i].ship1, data[i].ship2, data[i].ship3, data[i].ship4], data[i].id, data[i].database);
                s.push(stat);
            }
        })
        .then(() => this.setState({stats: s}))
        .catch( err => {
            console.error(err);
        })
    }

    componentDidMount(){
        
        this.loadTopFTY();

    }

    

    render () {
        
        const listItems = this.state.stats.map((d, i) => {
            return (
              <div className="row l-row" key={d.player}>
                <div className="col-6 l-name">
                  <Link
                    to={{
                      pathname: "/showplayer",
                      state: { stat: this.state.stats[i] }
                    }}
                  >
                    <h4>{d.player}</h4>
                  </Link>
                </div>
                <div className="col-2 l-object">
                  <h4>{d.wins}</h4>
                </div>
                <div className="col-2 l-object">
                  <h4>{d.games}</h4>
                </div>
                <div className="col-2 l-object">
                  <h4>{d.kills}</h4>
                </div>
              </div>
            );
        }

        )
        return(
            <div>
                <Navbar></Navbar>
                <div className="container l-container">
                    <div className="row top-l-row">
                        <div className="col-6 top-name">
                            <h3>Username</h3>
                        </div>
                        <div className="col-2 top-object">
                            <h4>Wins</h4>
                        </div>
                        <div className="col-2 top-object">
                            <h4>Games</h4>
                        </div>
                        <div className="col-2 top-object">
                            <h4>Kills</h4>
                        </div>
                    </div>
                    {listItems}
                </div>
            </div>
        )
    }
}

export default Leaderboards;