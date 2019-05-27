import React from 'react';
import "./style/DeleteAccount.css";
import Navbar from './Navbar';
import { Link } from 'react-router-dom';


class DeleteAccount extends React.Component {

    handleDelete = () => {
        console.log("HERE");
    }
    render(){
        return (
            <div>
                <Navbar></Navbar>
                <div container>
                    <Link to="/login">
                        <button className="delete-button" onClick={this.handleDelete()}>DELETE ACCOUNT</button>
                    </Link>
                </div>

            </div>
        )
    }
}

export default DeleteAccount;