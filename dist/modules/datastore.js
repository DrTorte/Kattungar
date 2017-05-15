"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameSession_1 = require("../models/GameSession");
exports.Players = [];
exports.GameSessions = [];
function findPlayer(session) {
    return exports.Players.find(x => x.Session === session);
}
exports.findPlayer = findPlayer;
function findGame(Id) {
    console.log(Id);
    console.log(exports.GameSessions);
    return exports.GameSessions.find(x => x.Id == Id);
}
exports.findGame = findGame;
function leaveSessions(ws) {
    //clear out all sessions with this player.
    let sessions = exports.GameSessions.filter(x => x.Connections.find(y => y == ws));
    for (let s of sessions) {
        if (s.State == 1) {
            exports.GameSessions.splice(exports.GameSessions.findIndex(x => x == s), 1);
        }
        else {
            s.Connections.splice(s.Connections.indexOf(ws), 1);
            s.State = 4; //mark it as over. victory can be handled later.
            for (let c of s.Connections) {
                console.log("Here!");
                c.send(JSON.stringify({ message: 'you win! YAY!' }));
                c.send(JSON.stringify({ sessionUpdate: new GameSession_1.GameSessionView(s) }));
            }
        }
    }
}
exports.leaveSessions = leaveSessions;
