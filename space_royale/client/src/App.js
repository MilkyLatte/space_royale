import React from 'react';
import './App.css';
import { BrowserRouter, Route, Switch} from 'react-router-dom';
import Game from './components/Game.js';
import Lobby from './components/Lobby';
import Home from './components/Home'
import Navbar from './components/Navbar';


function App() {
  return (
    <BrowserRouter>
    <Navbar></Navbar>
    <Switch>
      <div className="test">      
        <Route path="/game" component={Game}/>
        <Route path="/lobby" component={Lobby}/>
        <Route path ="/home" component={Home}/>
      </div>
    </Switch>
    </BrowserRouter>

  );
}

export default App;
