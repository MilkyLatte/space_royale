import React from 'react';
import "./style/Navbar.css";
import {Link, Redirect} from "react-router-dom";
import jwtDecode from 'jwt-decode';


class Navbar extends React.Component{
    state = {
      loggedOut: false,
      username: ""
    }

    logout = () => {
      this.setState({loggedOut: true});

      console.log(localStorage.removeItem('JWT'));
    }
    
    componentDidMount() {
      let token = jwtDecode(localStorage.getItem('JWT'));

      fetch(`api/username/${token.id}/${token.database}`)
      .then(res => res.json())
      .then(username => {
        this.setState({username: username.username})
      })
      .catch(err => console.error(err));
      
    }

    render(){
      if (this.state.loggedOut) {
        return (
          <Redirect to="/login"/>
        )
      }

      if (this.props.inGame) {
        return (
         <nav className="navbar transparent navbar-expand-lg navbar-dark bg-transparent navbar-fixed-top">
           <div className="navbar-brand" to="#">
             <i className="fas fa-rocket" />
             <span> </span>SPACE ROYALE
           </div>
         </nav>
        );

      } else {
        
        return (
          <nav className="navbar transparent navbar-expand-lg navbar-dark bg-transparent navbar-fixed-top">
            <Link className="navbar-brand" to="/">
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
                  <Link className="nav-link" to="/lobby">
                    Home 
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/leaderboards">
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
                    {this.state.username}
                  </Link>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="navbarDropdownMenuLink"
                  >
                    <Link className="dropdown-item" to="/player">
                      View Profile
                    </Link>
                    <Link className="dropdown-item" to="/settings">
                      Account Settings
                    </Link>
                    <button className="dropdown-item" to="#" onClick={this.logout}> 
                      Logout
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </nav>
        );
      }
    }
}

export default Navbar;