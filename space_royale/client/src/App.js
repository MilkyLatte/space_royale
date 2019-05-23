import React from 'react';
import './App.css';
import { BrowserRouter, Route} from 'react-router-dom';
import Game from './components/Game.js';
import Lobby from './components/Lobby';
import Home from './components/Home'


function App() {
  return (
    <BrowserRouter>
      <div className="test">      
        <Route path="/game" component={Game}/>
        <Route path="/lobby" component={Lobby}/>
        <Route path ="/home" component={Home}/>
      </div>
    </BrowserRouter>

  );
}

export default App;
