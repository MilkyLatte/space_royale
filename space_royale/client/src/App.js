import React from 'react';
import './App.css';
import { BrowserRouter, Route} from 'react-router-dom';
import Game from './components/Game.js';
import Lobby from './components/Lobby';


function App() {
  return (
    <BrowserRouter>
      <div className="test">      
        <Route path="/game" component={Game}/>
        <Route path="/lobby" component={Lobby}/>
      </div>
    </BrowserRouter>

  );
}

export default App;
