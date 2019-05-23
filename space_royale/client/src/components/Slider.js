import React from "react";

class Slider extends React.Component {
  state = {
    rockets: []
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
  }

  componentDidUpdate() {
    // console.log(this.state.rockets)
  }

  renderImage() {
    if (this.state.rockets[0]) {
      return <img className="bigImage" src={this.state.rockets[2]} />;
    }
  }

  render() {
    return <div>{this.renderImage()}</div>;
  }
}

export default Slider;
