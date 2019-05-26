import React from 'react';
import "./style/Register.css"
import axios from "axios";
import {Redirect} from "react-router-dom"

class Register extends React.Component{
    state = {
        userExists: false,
        unmatched: false,
        password: '',
        confirmPassword: '',
        email: '',
        username: '',
        loginRedirect: false
    }

    setRedirect = () => {
        this.setState({
            loginRedirect: true
        })
    }

    renderRedirect = () => {
        if (this.state.loginRedirect) {
            return <Redirect to ='/login' />
        }
    }

    passwordHandle = e => {
        this.setState({password: e.target.value});
    }

    confirmHandle = e => {
        this.setState({ confirmPassword: e.target.value });
    }

    userNameHandle = e => {
        this.setState({username: e.target.value})
    }

    emailHandle = e => {
        this.setState({ email: e.target.value })
    }

    passNoMatch = () => {
        if(this.state.unmatched) {
            setTimeout(() => {
                this.setState({unmatched: false});
            }, 5000);
            return <h6 className="no-match">Passwords don't match</h6>
        }
    }

    userNameExists = () => {
        if(this.state.userExists) {
            setTimeout(() => {
                this.setState({ userExists: false });
            }, 5000);
            return <h6 className="no-match">Username already in use</h6>

        }
    }

    handleSubmit = e => {
        e.preventDefault();
        if (this.state.password === this.state.confirmPassword) {
            axios.post('/registerUser', {
                username: this.state.username, password: this.state.confirmPassword, email: this.state.email
            }).then(response => {
                if (response.data.message == undefined) {
                    this.setState({userExists: true});
                } else {
                    this.setRedirect();
                }
            })
        } else {
            this.setState({unmatched: true});
        }

    }
    render() {
        return(
            <div className="container register-main-container">
                <div className="inner-container">
                    <h2>
                        Register
                    </h2>
                    <form onSubmit={this.handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="reg-email" className="labels">Email:</label>
                            <input type="email" className="form-control form-control-lg" id="reg-email" name="email" value={this.state.email} onChange={this.emailHandle}required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="reg-userName" className="labels">Username:</label>
                            <input type="text" className="form-control form-control-lg" id="reg-userName" name="username" value={this.state.username} onChange={this.userNameHandle}required/>
                        </div>
                        {this.userNameExists()}
                        <div className="form-group">
                            <label htmlFor="reg-password" className="labels">Password:</label>
                            <input type="password" className="form-control form-control-lg" id="reg-password" value={this.state.password} onChange={this.passwordHandle} name="password" required/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="reg-confirm" className="labels">Confirm password:</label>
                            <input type="password" className="form-control form-control-lg" id="reg-confirm" value={this.state.confirmPassword} onChange={this.confirmHandle} required/>
                        </div>
                        {this.passNoMatch()}
                        {this.renderRedirect()}
                        <button className="submitButtonRegister">Register!</button>

                    </form>
                </div>


            </div>
        )
    }

}

export default Register;