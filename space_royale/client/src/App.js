import React from 'react';
import './App.css';
import { BrowserRouter, Route, Switch} from 'react-router-dom';
import Game from './components/Game.js';
import Lobby from './components/Lobby';
import Home from './components/Home'
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import { PrivateRoute } from './PrivateRoute';
import Leaderboards from './components/Leaderboards';

class App extends React.Component{
  state = {
    loggedIn: false
  }

  componentDidMount(){
    if (localStorage.getItem("JWT")) {
      // this.setState({loggedIn: true })
    }
  }
  render(){

    return (
      <div className="app-main">
        <BrowserRouter>
          <span id="dot">.</span>
          <Switch>
              <Route path='/login' component={Login} />
              <PrivateRoute path="/game" component={Game} />
              <PrivateRoute path="/lobby" component={Lobby} />
              <PrivateRoute path="/home" component={Home} />
              <Route path="/register" component={Register} />
              <PrivateRoute path="/leaderboards" component={Leaderboards} />
          </Switch>
        </BrowserRouter>

        <h3 className="author-message">
          Brought to you by Juan Quintero and David Shin
        </h3>
      </div>
    );
  }
}

export default App;
