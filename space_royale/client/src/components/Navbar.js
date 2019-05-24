import React from 'react';
import "./style/Navbar.css";
import {Link} from "react-router-dom";


class Navbar extends React.Component{
    render(){
        return (
          <nav className="navbar transparent navbar-expand-lg navbar-dark bg-transparent navbar-fixed-top">
            <Link className="navbar-brand" to="#">
              <i className="fas fa-rocket" />
              <span> </span>SPACE ROYALE
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarNavDropdown"
              aria-controls="navbarNavDropdown"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div
              className="collapse navbar-collapse"
              id="navbarNavDropdown"
            >
              <ul className="navbar-nav  ml-auto">
                <li className="nav-item active">
                  <Link className="nav-link" to="#">
                    Home <span className="sr-only">(current)</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="#">
                    Leaderboards
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <Link
                    className="nav-link dropdown-toggle "
                    to="#"
                    id="navbarDropdownMenuLink"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Username
                  </Link>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="navbarDropdownMenuLink"
                  >
                    <Link className="dropdown-item" to="#">
                      View Profile
                    </Link>
                    <Link className="dropdown-item" to="#">
                      Account Settings
                    </Link>
                    <Link className="dropdown-item" to="#">
                      Logout
                    </Link>
                  </div>
                </li>
              </ul>
            </div>
          </nav>
        );
    }
}

export default Navbar;