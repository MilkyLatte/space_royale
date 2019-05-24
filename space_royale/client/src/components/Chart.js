import React from "react";

function Chart (props) {
    if (props.description){
        return (
          <div className="chart-container">
              <div className="container">
                    "{props.description.message}"
                <p><i className="fas fa-heartbeat"></i> Health: {props.description.health}</p>
                    <p><i className="fas fa-tachometer-alt"></i> Speed: {props.description.speed}</p>
                <p><i className="fas fa-fire-alt"></i> Fire Power: {props.description.firepower}</p>
              </div>
          </div>
        );
    } else {
        return (
            <div className="chart-container">
                <div className="container">
                    Loading
                <p><i className="fas fa-heartbeat"></i> Health: </p>
                    <p><i className="fas fa-tachometer-alt"></i> Speed: </p>
                    <p><i className="fas fa-fire-alt"></i> Fire Power: </p>
                </div>
            </div>
        );
    }
}

export default Chart;
