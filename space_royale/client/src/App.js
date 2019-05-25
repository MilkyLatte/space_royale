import React from 'react';
import './App.css';
import { BrowserRouter, Route, Switch} from 'react-router-dom';
import Game from './components/Game.js';
import Lobby from './components/Lobby';
import Home from './components/Home'
import Navbar from './components/Navbar';
import Login from './components/Login';
import signUp from './components/signUp'


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
          {/* <span> .</span> */}
          <Switch>
              <Route path="/login" component={Login}></Route>
              <Route path="/game" component={Game} />
              <Route path="/lobby" component={Lobby} />
              <Route path="/home" component={Home} />
              <Route path="/signup" component={signUp} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
