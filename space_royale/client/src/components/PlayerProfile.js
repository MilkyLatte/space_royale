import React from 'react';
import './style/Profile.css'

class PlayerProfile extends React.Component{
    state = {
        user: Juan,
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
        return(
            <div className="container">


            </div>
        )
    }
    
}


export default PlayerProfile;