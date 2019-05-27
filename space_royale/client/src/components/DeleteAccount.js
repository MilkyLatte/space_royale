// Followed tutorial from https://itnext.io/implementing-json-web-tokens-passport-js-in-a-javascript-application-with-react-b86b1f313436
// Modified for this project

import React from 'react';
import "./style/DeleteAccount.css";
import Navbar from './Navbar';
import { Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import jwtDecoder from 'jwt-decode';


class DeleteAccount extends React.Component {

    state = {
        redirect: false
    }

    constructor(props) {
        super(props);
        this.token = jwtDecoder(localStorage.getItem('JWT'));
    }

    handleDelete = (e) => {

        fetch(`/deleteUser/${this.token.id}/${this.token.database}`)
            .then(res => res.json())
            .then(response => {
                console.log(response);
                if (response.deleted) {
                    localStorage.removeItem('JWT')
                    this.setState({redirect: true})
                }
            })
            .catch(error => {
                console.log('here')
                console.error(error);
            })
    }
    render(){
        if (this.state.redirect){
            return <Redirect to="/login"></Redirect>
        } else {
            return (
                <div>
                    <Navbar></Navbar>
                    <div container>
                            <button className="delete-button" onClick={this.handleDelete}>DELETE ACCOUNT</button>
                    </div>
        
                </div>
            )
        }
    }
}

export default DeleteAccount;