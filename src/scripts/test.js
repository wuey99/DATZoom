import React from 'react';
import ReactDOM from 'react-dom';
import Game from './Game';
import { Main } from './app';

window.onload = () => {
    var __main = new Main (
        {
            onStateChange: () => {}
        }
    );

    __main.setup ();
} 

// ReactDOM.render(<Game/>, document.getElementById('root'));