import React from "react"
import io from "socket.io-client"
import axios from "axios"

class signUp extends React.Component {
    
    state = {
        username: "",
        password: "",
        email: ""
    }

    handleClick(evt) {
        console.log('here');
    }


    updateUsername = (evt) => {
        this.setState({
            username: evt.target.value
        })
    }

    updateEmail = (evt) => {
        this.setState({
            email: evt.target.value
        })
    }

    updatePassword = (evt) => {
        this.setState({
            password: evt.target.value
        })
    }

    render() {
        return(
            <div>
                <label>
                    username:
                    <input type="text" value={this.state.username} onChange={this.updateUsername.bind(this)} name="username" />
                </label>
                <label>
                    email:
                    <input type="text" name="email" />
                </label>
                <label>
                    password:
                    <input type="password" name="password" />
                </label>
                <button onClick={this.handleClick(this)}>Enter</button>
            </div>
        )
    }
}

export default signUp;