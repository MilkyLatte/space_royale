import React from "react"
import Navbar from "./Navbar";
import { Stats } from "fs";
import "./style/Leaderboards.css"

class Stat {
    constructor(player, wins, matches, kills){
        this.player = player;
        this.wins = wins;
        this.matches = matches;
        this.kills = kills;
    }
}

class Leaderboards extends React.Component{
    constructor (props){
        super(props);
        this.stats = [1,3,4];
    }
    state = {
        stats: []
    }
    componentDidMount(){
        let s = []
        for (let i = 0; i < 100; i++) {
            let stat = new Stat("Juan", 10, 8, 7);
            s.push(stat);
        }

        this.setState({stats: s})
    }

    

    render () {
        
        const listItems = this.state.stats.map((d) => {
            return (
                <div className="row l-row" key={d.player}>
                    <div className= "col-6 l-name" >
                        <h4>{d.player}</h4>
                    </div>
                    <div className="col-2 l-object">
                        <h4>{d.wins}</h4>
                    </div>
                    <div className="col-2 l-object">
                        <h4>{d.matches}</h4>
                    </div>
                    <div className="col-2 l-object">
                        <h4>{d.kills}</h4>
                    </div>
                </div>
            )
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