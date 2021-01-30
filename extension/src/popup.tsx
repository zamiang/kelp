import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import './popup.css';

const mountNode = document.getElementById('popup');
ReactDOM.render(<App />, mountNode);
