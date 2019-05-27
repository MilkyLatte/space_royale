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
import withAuth from './withAuth';
import PlayerProfile from './components/PlayerProfile';
import DeleteAccount from './components/DeleteAccount';


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
              <Route path="/game" component={withAuth(Game)} />
              <Route path="/lobby" component={withAuth(Lobby)} />
              <Route path="/home" component={withAuth(Home)} />
              <Route path="/register" component={Register} />
              <Route path="/" exact component={withAuth(Lobby)} />
              <Route path="/leaderboards" component={withAuth(Leaderboards)} />
              <Route path="/player" component={withAuth(PlayerProfile)}/>
              <Route path="/showplayer" component={withAuth(PlayerProfile)}/>
              <Route path="/settings" component={withAuth(DeleteAccount)}></Route>
              <Route path="*" component={withAuth(Lobby)} />

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
