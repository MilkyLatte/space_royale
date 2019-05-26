import "./style/Login.css"
import React from "react"
import axios from "axios";
import {Redirect, Link} from "react-router-dom"

class Login extends React.Component {
  state = {
    username: "",
    password: "",
    lobbyRedirect: false
  };

  setRedirect = () => {
    this.setState({
        lobbyRedirect: true
    })
  }

  renderRedirect = () => {
    if(this.state.lobbyRedirect) {
        return <Redirect to = '/lobby' />
    }
  }

  usernameHandle = e => {
    this.setState({ username: e.target.value });
  };

  passwordHandle = e => {
    this.setState({ password: e.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();
    axios.post('/loginUser', {
        username: this.state.username,
        password: this.state.password
    }).then((response) => {
        console.log("successfully logged in");
        localStorage.setItem('JWT', response.data.token);
        this.setRedirect();
    }).catch((error) => {
          console.error(error.response.data);
        });
    }


  render() {
    return (
      <div className="container">
      <div className="main-container">
        <div className="row">
          <div className="col-6">
            <div className="login-image" />
          </div>
          <div className="col-6">
            <div className="right-login">
              <div className="container login-container">
                <div className="headline">
                  <h2 className="fas fa-rocket top-part" />
                  <h2 className="top-part">SPACE ROYALE</h2>
                </div>
                <h2>Sign in</h2>
                <form onSubmit={this.handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="username" className="labels">
                      Your Username:
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="username"
                      value={this.state.username}
                      onChange={this.usernameHandle}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password" className="labels">
                      Your Password:
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="password"
                      value={this.state.password}
                      onChange={this.passwordHandle}
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-lg-6">
                      {this.renderRedirect()}
                      <button className="login-button">Sign In</button>
                    </div>
                    <div className="col-1" id="or">
                      or
                    </div>
                    <div className="col-lg-5">
                      <div
                        className="g-signin2"
                        id="g-button"
                        data-onsuccess="onSignIn"
                        data-height="45"
                        data-width="135%"
                      />
                    </div>
                  </div>
                </form>
              </div>
                <div className="col-12" id="register-here">
                  <h4>Need an account? Register <Link to="/register">here</Link></h4>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      
      
      </div>
    );
  }
}

export default Login;

