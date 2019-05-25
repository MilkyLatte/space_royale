import React from 'react';
import "./style/Register.css"

class Register extends React.Component{
    state = {
        password: '',
        confirmPassword: '',
        email: '',
        username: ''
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

    handleSubmit = e => {
        e.preventDefault();
        console.log(this.state);

    }
    render() {
        return(
            <div className="register-main-container">
                <div className="container inner-container">
                    <h2>
                        Register
                    </h2>
                    <form onSubmit={this.handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="reg-userName" className="labels">Username:</label>
                            <input type="text" className="form-control form-control-lg" id="reg-userName" name="username" value={this.state.username} onChange={this.userNameHandle}required/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="reg-email" className="labels">Email:</label>
                            <input type="email" className="form-control form-control-lg" id="reg-email" name="email" value={this.state.email} onChange={this.emailHandle}required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="reg-password" className="labels">Password:</label>
                            <input type="password" className="form-control form-control-lg" id="reg-password" value={this.state.password} onChange={this.passwordHandle} name="password" required/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="reg-confirm" className="labels">Confirm password:</label>
                            <input type="password" className="form-control form-control-lg" id="reg-confirm" value={this.state.confirmPassword} onChange={this.confirmHandle} required/>
                        </div>

                        <button className="submitButtonRegister">Register!</button>

                    </form>
                </div>


            </div>
        )
    }

}

export default Register;