import React from "react"
import Navbar from "./Navbar";

class Stat {
    constructor(player, wins, matches, kills){
        this.player = player;
        this.wins = wins;
        this.matches = matches;
        this.kills = kills;
    }
}

class Leaderboards extends React.Component{
    state = {
        stats: []
    }

    generateLeaderboards = () => {
        
    }

    render () {
        return(
            <div>
                <Navbar></Navbar>
                <div className="container">
                    <div className="row">


                    </div>

                </div>
            </div>
        )
    }
}

export default Leaderboards;