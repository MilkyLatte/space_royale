import React from "react";
import io from "socket.io-client";

const GOOGLE_BUTTON_ID = 'google-sign-in-button';

class Login extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.socket = io.connect("http://localhost:5000/");
    }

    componentDidMount() {
        window.gapi.signin2.render(
            GOOGLE_BUTTON_ID, {
                width: 200,
                height: 50,
                onsuccess: this.responseGoogle,
                onfailure: this.noresponseGoogle
            }
        )
    }

    noresponseGoogle(response) {
        console.log(response);
    }
    
    responseGoogle (googleUser) {

        var id_token = googleUser.getAuthResponse().id_token;
        var profile = googleUser.getBasicProfile();

        var googleId = profile.getId()
        var googleName = profile.getName();
        var googleEmail = profile.getEmail();
        
        //anything else you want to do(save to localStorage)...


    }

    render(){
        return(
            <div>

                <nav>
                    <ul>
                        <li><a href="/logout">Logout</a></li>
                        <li><a href="/login">Login</a></li>
                        <li><a href="/home">Homepage</a></li>
                    </ul>
                </nav>
                <header>
                    <h1>Login using...</h1>
                </header>
                <main>
                    <div id={GOOGLE_BUTTON_ID}></div>             
                </main>
            </div>
        )
    }

}

export default Login;