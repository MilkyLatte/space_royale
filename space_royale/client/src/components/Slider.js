import React from "react";
import "./Lobby.css"

function Slider(props) {
    console.log(props.source);
    return <img className="big-img" src={props.source} />;
}

export default Slider;
