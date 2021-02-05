import React from 'react';
import ReactDOM from 'react-dom';
import Game from './Game';
import { Main } from './app';
import { ZoomMtg } from "@zoomus/websdk";

window.onload = () => {
    var __main = new Main (
        {
            onStateChange: () => {}
        }
    );

    __main.setup ();

    console.log (": test.js: ", document.getElementById("zmmtg-root"), document.getElementById("game"), document.getElementById("aria-notify-area"));
} 
