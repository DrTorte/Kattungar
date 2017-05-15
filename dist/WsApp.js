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
                else if (result['type'] == "moveChar") {
                    //result dir will decide direction.
                    //need to have character of course.
                    //but first,a s always, check player exists.
                    let player = datastore.findPlayer(result['player']);
                    if (player == null) {
                        error = { error: "Invalid player session." };
                        ws.send(JSON.stringify(error));
                        return;
                    }
                    //find the session.
                    let session = datastore.findGame(result['gameId']);
                    if (session == null) {
                        error = { error: "Invalid session." };
                        ws.send(JSON.stringify(error));
                        return;
                    }
                    //now that that's done, find the character.
                    let character = session.Characters.find(x => x.Id == result['charId'] && x.Owner == player.Id);
                    if (character == null) {
                        error = { error: "Invalid character." };
                        ws.send(JSON.stringify(error));
                        return;
                    }
                    //make sure there's enough action points.
                    if (character.Stats.CurrentActionPoints < 1) {
                        error = { error: "Not enough AP." };
                        ws.send(JSON.stringify(error));
                        return;
                    }
                    //and make sure we're good to go and that there's nothing blocking the new location.
                    let dir = result['direction'];
                    let newPosition = { x: 0, y: 0 };
                    newPosition.x = character.Position.x;
                    newPosition.y = character.Position.y;
                    if (dir == "Up") {
                        newPosition.y--;
                    }
                    else if (dir == "Down") {
                        newPosition.y++;
                    }
                    else if (dir == "Left") {
                        newPosition.x--;
                    }
                    else if (dir == "Right") {
                        newPosition.x++;
                    }
                    if (!session.Map.checkPos(newPosition.x, newPosition.y)) {
                        error = { error: "Location is blocked by terrain." },
                            ws.send(JSON.stringify(error));
                        return;
                    }
                    //finally, make sure no other character is there.
                    if (session.Characters.find(x => x.Position.x == newPosition.x && x.Position.y == newPosition.y) != null) {
                        error = { error: "Location is blocked by another character." },
                            ws.send(JSON.stringify(error));
                        return;
                    }
                    //and now, do it! Woo!
                    character.Position = newPosition;
                    character.Stats.CurrentActionPoints--;
                    for (let c of session.Connections) {
                        c.send(JSON.stringify({ characterUpdate: character }));
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
