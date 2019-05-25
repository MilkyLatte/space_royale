import "./style/Login.css"
import React from "react"

class Login extends React.Component {
  state = {
    email: "",
    password: ""
  };

  emailHandle = e => {
    this.setState({ email: e.target.value });
  };

  passwordHandle = e => {
    this.setState({ password: e.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();
    console.log(this.state);
  };

  render() {
    return (
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
                    <label htmlFor="email" className="labels">
                      Your Email:
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      value={this.state.email}
                      onChange={this.emailHandle}
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
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;

