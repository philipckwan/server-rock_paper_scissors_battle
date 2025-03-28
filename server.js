import express from "express";
import http from "http";
import path from 'path';
import {fileURLToPath} from 'url';
import {timeLog} from "./src/Utils.js";

import {} from 'dotenv/config';
import {Constants} from "./src/Constants.js";
import {RPSContext} from "./src/RPSContext.js";
import {WebSocketServer} from 'ws';
//import { time } from "console";
import {v4 as uuid} from 'uuid';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const START_HTML = "rps-3.html";

const app = express();
const httpServer = http.Server(app);
const PORT = process.env.ALL_SERVER_PORT;

const FPS = 24;
const FPS_INTERVAL = 1000 / FPS;

const NUM_PIECES = 100;
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

// if the field has only one type, after this interval, times the count, will introduce some new types (i.e. first a chaser, and a chaser of the chaser)
/**
 * if the field has only one type, after this interval x count,
 *  will first introduce the chaser
 * then, after chaser has reached population percentage
 *  will introduce the chaser to the chaser
 */
const ALL_SINGLE_TYPE_INTERVAL_MSEC = 10000;
const ALL_SINGLE_TYPE_CONSECUTIVE_COUNT = 2;
const TWO_TYPES_CHASER_POPULATION_INTERVAL_MSEC = 5000;
const TWO_TYPES_CHASER_POPULATION_PERCENTAGE = 30;
let allSingleTypeConsecutiveCount = 0;

let wsClients = new Map();

httpServer.listen(PORT, () => {
  timeLog(`server [v0.3]; listening on port:[${PORT}];`);
  timeLog(`-__dirname:[${__dirname}]`);  
});

timeLog(`-about to start ws server;`);
let wsServer = new WebSocketServer({
  server: httpServer
});

timeLog(`-about to start RPSContext;`);
let rps = new RPSContext(NUM_PIECES, CANVAS_WIDTH, CANVAS_HEIGHT);
let isSimulating = true;
let checkTwoTypesChaserPopulationIntervalID;

const simulationFrame = () => {
  //timeLog(`server.simulationFrame;`);
  if (isSimulating) {
    rps.updateAll();
    updateWSClients();
  }
}

const checkSingleType = () => {
  if (isSimulating) {
    if (rps.isAllSingleType()) {
      timeLog(`-checkSingleType: isAllSingleType = true;`);
      allSingleTypeConsecutiveCount++;
      if (allSingleTypeConsecutiveCount >= ALL_SINGLE_TYPE_CONSECUTIVE_COUNT) {
        timeLog(`-checkSingleType: will randomize the types;`);
        rps.replaceFirstPieceWithChaser();
        //setTimeout(rps.replaceFirstPieceWithChaser, ALL_SINGLE_TYPE_INTERVAL_MSEC);
        checkTwoTypesChaserPopulationIntervalID = setInterval(checkTwoTypesChaserPopulation, TWO_TYPES_CHASER_POPULATION_INTERVAL_MSEC);
      }
    } else {
      timeLog(`-checkSingleType: isAllSingleType = false;`);
      allSingleTypeConsecutiveCount = 0;
    }
  }
}

const checkTwoTypesChaserPopulation = () => {
  timeLog(`-checkTwoTypesChaserPopulation;`);
  let firstPieceTypeCount = rps.countFirstPieceType();
  let firstPieceTypePercentage = firstPieceTypeCount / rps.pieces.length * 100;
  let isHigherThanThresHold = firstPieceTypePercentage >= TWO_TYPES_CHASER_POPULATION_PERCENTAGE;
  timeLog(`--firstPieceTypePercentage:[${firstPieceTypePercentage}]; isHigherThanThreshold:[${isHigherThanThresHold}];`);
  if (isHigherThanThresHold) {
    timeLog(`--will introduce chaser of chaser;`);
    rps.replaceFirstPieceWithChaser();
    clearInterval(checkTwoTypesChaserPopulationIntervalID);
  }
}

timeLog(`-about to start simulation interval;`);
let simulationIntervalID = setInterval(simulationFrame, FPS_INTERVAL);
let checkSingleTypeIntervalID = setInterval(checkSingleType, ALL_SINGLE_TYPE_INTERVAL_MSEC);

const updateWSClients = () => {
  // send rps.pieces to all ws clients
  for (let aWSClient of wsClients.values()) {
    aWSClient.send(JSON.stringify({
      command: Constants.COMMAND_SERVER_PIECES_UPDATE,
      pieces: rps.pieces
    }));
  }
}

const handleClientClick = (messageJson) => {
  timeLog(`-handleClientClick;`);
  let uuidFromCommand = messageJson.uuid;
  let pointClicked = messageJson.pointClicked;
  timeLog(`--uuidFromCommand:[${uuidFromCommand}]; pointClicked:[${JSON.stringify(pointClicked)}];`);

  rps.replacePiece(pointClicked);
}

wsServer.on('connection', (clientWS, request) => {
  timeLog(`server.wsServer.on.connection: client connected;`);

  clientWS.uuid = uuid();
  timeLog(`-assigned uuid:[${clientWS.uuid}] to this client;`);
  wsClients.set(clientWS.uuid, clientWS);
  let message = JSON.stringify({command: Constants.COMMAND_SERVER_INIT, uuid:clientWS.uuid, fps: FPS});
  clientWS.send(message);
  clientWS.send(JSON.stringify({
    command: Constants.COMMAND_SERVER_PIECES_UPDATE,
    pieces: rps.pieces
  }));

  clientWS.on('message', (message) => {
    timeLog(`clientWS.onMessage: ${message}; clientWS.uuid:[${clientWS.uuid}]`);

    let messageJson;
    try {
      messageJson = JSON.parse(message); 
    } catch (err) {
      timeLog(`-message is not json, will skip further processing;`);
      return;
    }
    let command = messageJson.command;
    switch (command) {
      case Constants.COMMAND_CLIENT_CLICK_UPDATE:
        handleClientClick(messageJson);
        break;
      default:
        timeLog(`-onMessage: unknown command:[${command}]`);
    }
  });

  clientWS.on('close', function close() {
    timeLog('Client disconnected');
  });

  clientWS.on('error', function error(err) {
    timeLog(`WebSocket error: ${err}`);
  });
});

app.get('/', function(req, res){
  timeLog(`server./: 1.1; req.originalUrl:[${req.originalUrl}]`);
  let filePathFull = `${__dirname}/html/${START_HTML}`;
  //timeLog(`-serving file:[${filePathFull}]`);
  res.sendFile(filePathFull);
});

app.get("/version", (req, res) => {
  timeLog(`server./version: 1.0;`);
  res.status(200).json({...Constants});
});

app.get("/server_status", (req, res) => {
  timeLog(`server./server_status: 1.0;`);
  //let aSocket = Object.keys(ioServer.sockets.sockets[0]);

  //timeLog(`--clients:[${JSON.stringify(wsServer.clients)}]; size:[${wsServer.clients.size}]`);
  for (let aKey of wsClients.keys()) {
    timeLog(`-client: uuid:[${aKey}];`);
    let wsClient = wsClients.get(aKey);
    wsClient.send(`your uuid is:[${wsClient.uuid}]`);
  }
 
  res.status(200).json({
    status:"OK", 
    numConnected: wsClients.size,
    numPieces: rps.pieces.length,
    isSimulating

  });//, ids: ioServer.sockets.sockets});
});

app.get("/pieces", (req, res) => {
  timeLog(`server./pieces;`);
  res.status(200).json(rps.pieces);
}); 

app.get("/update", (req, res) => {
  timeLog(`server./update;`);
  rps.updateAll();
  updateWSClients();
  res.status(200).json({status:"OK"});
});

app.get("/simulateToggle", (req, res) => {
  timeLog(`server.simulateToggle;`);
  isSimulating = !isSimulating;
  res.status(200).json({status:"OK", isSimulating});
})

app.get("/restart", (req, res) => {
  timeLog(`server.restart;`)
  rps.init();
  res.status(200).json({status:"OK"});
})

app.get('/*', function(req, res){
  timeLog(`server./*: 1.0; req.originalUrl:[${req.originalUrl}]`);
  let urlSplits = req.originalUrl.split("/");
  if (urlSplits.length === 2) {
    let pathBase = urlSplits[1];
    res.sendFile(__dirname + req.originalUrl);
  } else if (urlSplits.length === 3) {
    let pathDir = urlSplits[1];
    let pathBase = urlSplits[2];
    res.sendFile(__dirname + req.originalUrl);
  }
});

