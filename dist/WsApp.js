"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const datastore = require("./modules/datastore");
const GameSession_1 = require("./models/GameSession");
const Map_1 = require("./models/Map");
const WebSocket = require('ws');
class WsApp {
    constructor() {
        this.wsServer = new WebSocket.Server({ port: 8080 });
        this.init();
    }
    init() {
        this.wsServer.on('connection', function (ws) {
            let error;
            ws.send(JSON.stringify(datastore.Players));
            ws.on('message', function (data) {
                try {
                    var result = JSON.parse(data);
                }
                catch (err) {
                    console.log("Invalid format of data:" + data);
                    error = { error: "Invalid form of Data." + data };
                    ws.send(JSON.stringify(error));
                    return;
                }
                if (result['type'] == "joinSession") {
                    //make sure player exists.
                    let player = datastore.findPlayer(result['player']);
                    if (player == null) {
                        error = { error: "Invalid player session." };
                        ws.send(JSON.stringify(error));
                        return;
                    }
                    let gameSession = datastore.findGame(result['gameId']);
                    if (gameSession == null || gameSession.Players > 1) {
                        error = { error: "Invalid game." };
                        ws.send(JSON.stringify(error));
                        return;
                    }
                    //now add the player, after making sure they're unique.
                    if (gameSession.Players.find(x => x.Session == player.Session)) {
                        error = { error: "Already connected." };
                        ws.send(JSON.stringify(error));
                        return;
                    }
                    gameSession.Players.push(player);
                    gameSession.Connections.push(ws);
                    ws.send(JSON.stringify({ message: "Connected to game session " + gameSession['Id'] }));
                    //if there's two players or more, advise and prepare and such.
                    if (gameSession.Players.length > 1) {
                        gameSession.Map = new Map_1.Map("");
                        gameSession.genCharacters();
                        gameSession.State = 2; //started!
                    }
                    //and now that the game session was created, send it along! Wiee!
                    let view = new GameSession_1.GameSessionView(gameSession);
                    for (let connection of gameSession.Connections) {
                        connection.send(JSON.stringify({ message: "Player " + player.Name + " connected!" }));
                        //do stuff to initailze the map here. for now just a flat map.
                        connection.send(JSON.stringify({ sessionUpdate: view }));
                    }
                }
                else {
                    ws.send(JSON.stringify({ message: "Invalid 'type' sent." }));
                }
            });
            //on a close, clear out the old session and destroy it if they're left alone.
            ws.on('close', function (data) {
                datastore.leaveSessions(ws);
            });
        });
    }
}
exports.WsApp = WsApp;
