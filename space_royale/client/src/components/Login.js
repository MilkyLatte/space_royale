import "./style/Login.css"
import React from "react"
import io from "socket.io-client"
import { Redirect } from 'react-router-dom'
import axios from "axios"

const GOOGLE_BUTTON_ID = 'google-sign-in-button';

class Login extends React.Component{
    
    state = {
        loginRedirect: false
    }

    setRedirect = () => {
        this.setState({
            loginRedirect: true
        })
    }

    noresponseGoogle = (response) => {
        console.log(response);
        this.socket = io.connect("http://localhost:5000")
    }
    
    componentDidMount() {
        window.gapi.signin2.render(
            GOOGLE_BUTTON_ID, {
                width: 135,
                height: 45,
                onsuccess: this.responseGoogle,
                onfailure: this.noresponseGoogle
            }
        )
    }

    responseGoogle = (googleUser) => {

        var id_token = googleUser.getAuthResponse().id_token;
        var profile = googleUser.getBasicProfile();

        var googleId = profile.getId()
        var googleName = profile.getName();
        var googleEmail = profile.getEmail();

        axios.post('/loginUser', {
            username: "test", password: "danwoo1004"
        }).then(response => {
            console.log("Logged in");
        }).catch(err => {
            if (err.response.data === 'bad username' || err.response.data === 'passwords do not match') {
                console.log(err.response.data);
            }
        })
        
        // axios.post('/registerGoogleUser', {
        //     id: googleId, username: googleName, email: googleEmail
        // }).then (response => {
        //     // this.setRedirect()
        // })

        // axios.post('/registerUser', {
        //     username: googleName, password: "1234", email: googleEmail
        // }).then(response => {
        //     console.log(response.data.message);
        // })


    }

    renderRedirect = () => {
        if (this.state.loginRedirect) {
            return <Redirect to='/lobby' />
        }
    }

    render() {
        return (
            <div className="main-container">
                <div className="row">
                    <div className="col-6">
                        <div className="login-image">
                            
                        </div>
                    
                    </div>
                    <div className="col-6">
    
                        <div className="right-login">
                        <div className="container login-container">
                            <div className="headline">
                                <h2 className="fas fa-rocket top-part" />
                                <h2 className="top-part">SPACE ROYALE</h2>

                            </div>
                            <h2>Sign in</h2>
                            <form>
                    

                                <div className="form-group">
                                    <label htmlFor="email" className="labels">Your Email:</label>
                                        <input type="email" className="form-control form-control-lg" id="email"/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password" className="labels">Your Password:</label>
                                    <input type="password" className="form-control form-control-lg" id="password" />
                                </div>
                            </form>
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="login-button">
                                            Sign In
                                        </div>
                                    </div>
                                    <div className="col-1" id="or">
                                        or
                                    </div>
                                    <div className="col-lg-5">
                                        {this.renderRedirect()}
                                        <div id={GOOGLE_BUTTON_ID}></div>             

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

export default Login;

