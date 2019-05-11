import React from 'react';
import './App.css';
import { BrowserRouter, Route} from 'react-router-dom';
import Game from './components/Game.js';


function App() {
  return (
    <BrowserRouter>
      <div className="test">      
        <Route path="/game" component={Game}/>
      </div>
    </BrowserRouter>

  );
}

export default App;
