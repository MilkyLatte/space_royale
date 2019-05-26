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

class App extends React.Component{
  state = {
    loggedIn: true
  }

  navFunction = () => {
    if (this.state.loggedIn) {
      return <Navbar></Navbar>
    }
  }
  render(){

    return (
      <div>
        <BrowserRouter>
          {this.navFunction()}
          <Switch>
              <Route path='/login' component={Login} />
              <PrivateRoute path="/game" component={Game} />
              <PrivateRoute path="/lobby" component={Lobby} />
              <PrivateRoute path="/home" component={Home} />
              <Route path="/register" component={Register} />
          </Switch>
        </BrowserRouter>

        <h3 className="author-message">Brought to you by Juan Quintero and David Shin</h3>
      </div>
    );
  }
}

export default App;
