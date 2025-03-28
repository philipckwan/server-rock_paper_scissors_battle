import {timeLog} from './Utils.js';
import * as utils from './Utils.js';
import {RPSContext} from "./RPSContext.js";
import {Drawer} from "./Drawer.js";
import {Geometry, Point, Vector, Line} from "./Geometry.js";
import {Constants} from "./Constants.js"

const SVG_ROCK = `<svg width="30px" height="30px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#000000" d="M291.28 113.14c-21.105-.197-46.504 4.78-76.186 15.538l-61.31 97.62a9 9 0 0 1-7.57 4.214l-105.65.613.278 118.38 94.486.743a9 9 0 0 1 8.53 6.354c7.957 25.855 26.634 40.548 49.097 49.65 18.63 7.55 39.57 10.712 57.074 11.95-.924-9.667-.874-20.846 1.69-31.51 1.845-7.666 5.07-15.214 10.843-21.23 4.665-4.864 11.064-8.425 18.566-9.9-2.417-8.75-1.9-17.564.358-25.414 3.358-11.673 9.468-22.114 14.11-31.853a9 9 0 0 1 .002-.025c.904-8.89.39-20.137 2.015-30.924.813-5.394 2.175-10.806 5.143-15.803 1.907-3.21 4.615-6.177 7.955-8.473l-11.76-29.533c-7.754 29.296-23.77 49.333-40.265 62.213-11.166 8.717-22.448 14.333-31.495 17.992-9.046 3.66-16.89 5.758-17.437 5.955l-6.104-16.933c3.808-1.373 8.865-2.503 16.79-5.71 7.927-3.205 17.69-8.092 27.167-15.49 18.955-14.8 37.084-39.063 38.16-83.08a9 9 0 0 1 17.36-3.11l26.15 65.67c13.382 6.284 22.786 6.51 31.265 3.968 7.728-2.317 15.188-7.56 23.012-13.512-3.2-26.703-10.97-53.765-21.06-81.12-12.893-20.23-30.257-31.92-54.5-35.87-5.236-.853-10.81-1.314-16.718-1.37zm128.425 34.286l-37.166 5.428c8.478 24.046 15.285 48.305 18.58 72.832 25.347 4.217 36.318-.862 54.722-5.698 5.58-20.544 7.754-38.29 3.863-49.715-2.1-6.165-5.503-10.796-11.75-14.734-6.097-3.844-15.258-6.83-28.25-8.114zm33.604 91.8c-15.195 4.203-30.293 8.315-55.456 4.157-9.19 7.16-19.212 14.996-32.14 18.87-12.515 3.753-27.416 3.04-44.187-4.792-1.482.74-2.348 1.687-3.293 3.276-1.194 2.01-2.206 5.216-2.82 9.29-.93 6.17-1.052 14.123-1.467 22.267 42.27 11.538 84.406 18.628 126.424 19.78 10.864-8.28 18.62-17.718 21.59-28.792 3.073-11.467 1.617-25.51-8.65-44.055zm-143.34 70.797c-4.47 9.197-9.032 17.62-11.183 25.1-2.734 9.505-2.687 16.425 5.14 25.7 30.633 19.38 65.708 25.593 102.438 30.464 12.98-8.606 24.286-17.244 29.422-26.133 5.3-9.17 6.31-18.654-3.71-35.334-40.81-1.786-81.518-8.768-122.106-19.797zm-19.943 62.38a9 9 0 0 1-2.386.44c-5.964.33-9.28 2.154-12.087 5.08-2.806 2.924-4.992 7.41-6.332 12.98-2.308 9.597-1.81 21.784-.493 31.19 29.334 14.184 59.095 25.29 93.064 26.41 19.342-4.057 26.193-10.234 30.187-17.71 3.1-5.802 4.263-13.514 5.814-22.45-35.73-4.915-72.027-11.895-104.85-33.11a9 9 0 0 1-1.852-1.592c-.364-.41-.716-.823-1.06-1.238z"/></svg>`;
const SVG_PAPER = `<svg fill="#000000" width="30px" height="30px" viewBox="-8 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>paper</title><path d="M13.52 5.72h-7.4c-0.36 0-0.56 0.2-0.6 0.24l-5.28 5.28c-0.040 0.040-0.24 0.24-0.24 0.56v12.2c0 1.24 1 2.24 2.24 2.24h11.24c1.24 0 2.24-1 2.24-2.24v-16.040c0.040-1.24-0.96-2.24-2.2-2.24zM5.28 8.56v1.8c0 0.32-0.24 0.56-0.56 0.56h-1.84l2.4-2.36zM14.080 24.040c0 0.32-0.28 0.56-0.56 0.56h-11.28c-0.32 0-0.56-0.28-0.56-0.56v-11.36h3.040c1.24 0 2.24-1 2.24-2.24v-3.040h6.52c0.32 0 0.56 0.24 0.56 0.56l0.040 16.080z"></path></svg>`;
const SVG_SCISSORS = `<svg fill="#000000" height="30px" width="30px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 30.556 30.556" xml:space="preserve"><path d="M26.311,23.224c-0.812-1.416-2.072-2.375-3.402-2.736c-1.051-0.287-2.141-0.199-3.084,0.334l-2.805-4.904 c1.736-3.463,5.633-11.227,6.332-12.451C24.258,1.884,22.637,0,22.637,0l-7.36,12.872L7.919,0c0,0-1.62,1.884-0.715,3.466 c0.7,1.225,4.598,8.988,6.332,12.451l-2.804,4.904c-0.943-0.533-2.035-0.621-3.084-0.334c-1.332,0.361-2.591,1.32-3.403,2.736 c-1.458,2.547-0.901,5.602,1.239,6.827c0.949,0.545,2.048,0.632,3.107,0.345c1.329-0.363,2.591-1.322,3.402-2.735 c0.355-0.624,0.59-1.277,0.71-1.926v0.001c0.001-0.005,0.001-0.01,0.006-0.015c0.007-0.054,0.017-0.108,0.022-0.167 c0.602-4.039,1.74-6.102,2.545-7.104c0.807,1.002,1.946,3.064,2.547,7.104c0.006,0.059,0.016,0.113,0.021,0.167 c0.004,0.005,0.004,0.01,0.006,0.015v-0.001c0.121,0.648,0.355,1.302,0.709,1.926c0.812,1.413,2.074,2.372,3.404,2.735 c1.059,0.287,2.158,0.2,3.109-0.345C27.213,28.825,27.768,25.771,26.311,23.224z M9.911,26.468 c-0.46,0.803-1.189,1.408-1.948,1.615c-0.338,0.092-0.834,0.148-1.289-0.113c-0.97-0.555-1.129-2.186-0.346-3.556 c0.468-0.812,1.177-1.403,1.95-1.614c0.335-0.091,0.831-0.146,1.288,0.113C10.537,23.47,10.695,25.097,9.911,26.468z M23.881,27.97 c-0.455,0.262-0.949,0.205-1.287,0.113c-0.76-0.207-1.488-0.812-1.949-1.615c-0.783-1.371-0.625-2.998,0.346-3.555 c0.457-0.26,0.953-0.204,1.289-0.113c0.771,0.211,1.482,0.802,1.947,1.614C25.01,25.784,24.852,27.415,23.881,27.97z"/></svg>`;
const type = "image/svg+xml";


//const NUM_PIECES = 6;

let drw;
const DEBUG_RECEIVE_WS_MESSAGE_COUNT = 0;

const LOCAL_MODE_NUM_PIECES = 50;
const LOCAL_MODE_FPS = 24;
const LOCAL_MODE_FPS_INTERVAL = 1000 / LOCAL_MODE_FPS;

const LOCAL_MODE_ALL_SINGLE_TYPE_INTERVAL_MSEC = 10000;
const LOCAL_MODE_ALL_SINGLE_TYPE_CONSECUTIVE_COUNT = 2;
const LOCAL_MODE_TWO_TYPES_CHASER_POPULATION_INTERVAL_MSEC = 5000;
const LOCAL_MODE_TWO_TYPES_CHASER_POPULATION_PERCENTAGE = 30;

export class HTMLContext {
  static svgMap = new Map();

  static {
    timeLog(`HTMLContext.static;`);

    // init the constant svg objects
    let img;
    img = new Image();
    img.src = URL.createObjectURL(new Blob([SVG_ROCK], {type}));
    HTMLContext.svgMap.set(Constants.TYPE.ROCK, img);

    img = new Image();
    img.src = URL.createObjectURL(new Blob([SVG_PAPER], {type}));
    HTMLContext.svgMap.set(Constants.TYPE.PAPER, img);

    img = new Image();
    img.src = URL.createObjectURL(new Blob([SVG_SCISSORS], {type}));
    HTMLContext.svgMap.set(Constants.TYPE.SCISSORS, img);
  }

  constructor(window, document, navigator, isLocalMode = false) {
    timeLog(`HTMLContext.constructor;`);
    this.window = window;
    this.document = document;
    this.navigator = navigator;

    this.canvas = this.document.getElementById('myCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.then;

    this.socket = null;
    this.uuid = null;
    this.fps;

    this.rps = null;
    this.isAnimate = true;
    this.debugReceiveWSMessageCount = DEBUG_RECEIVE_WS_MESSAGE_COUNT;

    this.isLocalMode = isLocalMode;
    this.isSimulating = true;
    this.simulationIntervalID = null;
    this.checkSingleTypeIntervalID = null; //setInterval(checkSingleType, ALL_SINGLE_TYPE_INTERVAL_MSEC);
    this.checkTwoTypesChaserPopulationIntervalID = null;
    this.allSingleTypeConsecutiveCount = 0;
  
  }

  init = () => {
    timeLog(`HTMLContext.init; isLocalMode:[${this.isLocalMode}];`);

    drw = new Drawer(this.ctx);

    if (!this.isLocalMode) {
      this.initWSConnection();
    } else {
      this.rps = new RPSContext(LOCAL_MODE_NUM_PIECES, this.canvas.width, this.canvas.height);
      this.simulationIntervalID = setInterval(this.simulationFrame, LOCAL_MODE_FPS_INTERVAL);
      this.checkSingleTypeIntervalID = setInterval(this.checkSingleType, LOCAL_MODE_ALL_SINGLE_TYPE_INTERVAL_MSEC);
    }
    this.registerMouseEvents();
  }

  checkSingleType = () => {
    if (this.isSimulating) {
      if (this.rps.isAllSingleType()) {
        timeLog(`-checkSingleType: isAllSingleType = true;`);
        this.allSingleTypeConsecutiveCount++;
        if (this.allSingleTypeConsecutiveCount >= LOCAL_MODE_ALL_SINGLE_TYPE_CONSECUTIVE_COUNT) {
          timeLog(`-checkSingleType: will randomize the types;`);
          this.rps.replaceFirstPieceWithChaser();
          //setTimeout(rps.replaceFirstPieceWithChaser, ALL_SINGLE_TYPE_INTERVAL_MSEC);
          this.checkTwoTypesChaserPopulationIntervalID = setInterval(this.checkTwoTypesChaserPopulation, LOCAL_MODE_TWO_TYPES_CHASER_POPULATION_INTERVAL_MSEC);
        }
      } else {
        timeLog(`-checkSingleType: isAllSingleType = false;`);
        this.allSingleTypeConsecutiveCount = 0;
      }
    }
  }

  checkTwoTypesChaserPopulation = () => {
    timeLog(`-checkTwoTypesChaserPopulation;`);
    let firstPieceTypeCount = this.rps.countFirstPieceType();
    let firstPieceTypePercentage = firstPieceTypeCount / this.rps.pieces.length * 100;
    let isHigherThanThresHold = firstPieceTypePercentage >= LOCAL_MODE_TWO_TYPES_CHASER_POPULATION_PERCENTAGE;
    timeLog(`--firstPieceTypePercentage:[${firstPieceTypePercentage}]; isHigherThanThreshold:[${isHigherThanThresHold}];`);
    if (isHigherThanThresHold) {
      timeLog(`--will introduce chaser of chaser;`);
      this.rps.replaceFirstPieceWithChaser();
      clearInterval(this.checkTwoTypesChaserPopulationIntervalID);
    }
  }

  simulationFrame = () => {
    //timeLog(`server.simulationFrame;`);
    if (this.isSimulating) {
      this.rps.updateAll();
      this.redrawAllPieces(this.rps.pieces);
    }
  }

  initWSConnection = () => {
    timeLog(`initWSConnection;`);
    this.socket = new WebSocket("/");

    this.socket.addEventListener('open', (event) => {
      timeLog(`-socket.onOpen;`);
      //this.socket.send(`hello from dslb;`);
    });

    this.socket.addEventListener('message', (event) => {
      let message = event.data;
      //timeLog(`Message from server:[${message}]`);
      let messageJson;
      try {
        messageJson = JSON.parse(message); 
      } catch (err) {
        timeLog(`-message is not json, will skip further processing;`);
        return;
      }
      let command = messageJson.command;
      switch (command) {
        case Constants.COMMAND_SERVER_INIT:
          this.handleServerInit(messageJson);
          break;
        case Constants.COMMAND_SERVER_PIECES_UPDATE:
          if (this.debugReceiveWSMessageCount-- > 0) {
            timeLog(`-received command:[${Constants.COMMAND_SERVER_PIECES_UPDATE}];`);
          }
          this.handleServerPiecesUpdate(messageJson);
          break;
        default:
          timeLog(`-onMessage: unknown command:[${command}]`);
      }
    });

    this.socket.addEventListener('close', (event) => {
      timeLog(`WebSocket connection closed`);
    });

    this.socket.addEventListener('error', (event) => {
      timeLog(`WebSocket error: ${event};`);
    });

  }

  redrawAllPieces = (pieces) => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < pieces.length; i++) {
      let aPiece = pieces[i];
      //timeLog(`-drawOne:${aPiece.type};${aPiece.pos.x};${aPiece.pos.y};`);
      drw.drawImage(HTMLContext.svgMap.get(aPiece.type), aPiece.pos, -15, -15);
    }
  }

  handleServerPiecesUpdate = (messageJson) => {
    let pieces = messageJson.pieces;
    this.redrawAllPieces(pieces);
    //timeLog(`-handleServerPiecesUpdate: pieces.length:[${pieces.length}];`);
    //timeLog(`-handleServerPiecesUpdate: pieces:[${JSON.stringify(pieces)}];`);
    // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // for (let i = 0; i < pieces.length; i++) {
    //   let aPiece = pieces[i];
    //   //timeLog(`-drawOne:${aPiece.type};${aPiece.pos.x};${aPiece.pos.y};`);
    //   drw.drawImage(HTMLContext.svgMap.get(aPiece.type), aPiece.pos, -15, -15);
    // }
  }

  handleServerInit = (messageJson) => {
    this.uuid = messageJson.uuid;
    this.fps = messageJson.fps;
    timeLog(`-handleServerInit: this.uuid:[${this.uuid}]; this.fps:[${this.fps}];`);
  }

  registerMouseEvents = () => {
    utils.timeLog(`registerMouseEvents;`);
    // this.canvas.addEventListener('mousedown', (e) => {
    //   timeLog(`-mousedown;`);
    //   //utils.startDraw(this.drawObj, e.offsetX, e.offsetY);
    // });
    // this.canvas.addEventListener('mousemove', (e) => {if (this.drawObj.drawing) {
    //   //utils.updateLine(this.drawObj, e.offsetX, e.offsetY);
    //   timeLog(`-mousemove;`);
    // }});
    this.canvas.addEventListener('mouseup', (e) => { //if (this.drawObj.drawing) {
      timeLog(`-mouseup;`);

      let pointClicked = new Point(e.offsetX, e.offsetY);
      if (this.isLocalMode) {
        this.rps.replacePiece(pointClicked);
      } else {
        // send the x and y position to server
        let message = JSON.stringify({command: Constants.COMMAND_CLIENT_CLICK_UPDATE, pointClicked, uuid: this.uuid});
        this.socket.send(message);
      }
    });  
  }

  updatePlayersScore = () => {
    this.document.getElementById("p1Score").innerHTML = this.p1Score;
    this.document.getElementById("p2Score").innerHTML = this.p2Score;
  }
  // initialize the timer variables and start the animation
  startAnimating = () => {
    //this.updatePlayersScore();
    this.then = Date.now();
    this.animate();
  }

  animate = () => {
    //timeLog(`-animateRPS;`);
    let now = Date.now();
    let elapsed = now - this.then;
    if (elapsed > FPS_INTERVAL) {
      this.then = now - (elapsed % FPS_INTERVAL);
      if (this.isAnimate) {
        this.draw();
      }
    }
    requestAnimationFrame(this.animate);
  }

  draw = () => {
    //timeLog(`-draw; debugCount:[${debugCount}];`);
    //if (debugCount++ > 5) return;

    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.rps.drawAllThenUpdateAll();
  }

  pause = () => {
    timeLog(`HTMLContext.pause;`);
    this.isAnimate = !this.isAnimate;
  }

}