"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GameSession_1 = require("../models/GameSession");
const datastore = require("../modules/datastore");
var GameSessions = [];
let Id = 1;
class GameSessionRouter {
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    //get the game session.
    //use the header to make sure they actually have access.
    getSessions(req, res, next) {
        //first make sure hte player exists.
        var player = gameRoutes.checkPlayer(req, res, next);
        if (player == null) {
            return;
        }
        //return all of them.
        let sessions = datastore.GameSessions;
        sessions = sessions.filter(x => x.Private == false && (x.Players.find(x => x == player) == null));
        let sessionView = [];
        for (let s of sessions) {
            sessionView.push(new GameSession_1.GameSessionView(s));
        }
        res.status(200).send({
            message: "Ok",
            GameSessions: sessionView
        });
        return;
    }
    getSession() {
    }
    addSession(req, res, next) {
        let player = gameRoutes.checkPlayer(req, res, next);
        var playerSession = req.get("playerSession");
        if (playerSession == "") {
            res.status(401).send({
                message: "No access."
            });
            return;
        }
        if (player == null) {
            return;
        }
        //create a session based on the name.
        if (!req.body['Name']) {
            res.status(401).send({
                message: "Needs a name! Try again?"
            });
            return;
        }
        let newGameSession = new GameSession_1.GameSession(Id, req.body['Name'], req.body['Private'] === true);
        Id++;
        datastore.GameSessions.push(newGameSession);
        res.status(200).send({
            message: "Ok!",
            session: newGameSession
        });
        return;
    }
    checkPlayer(req, res, next) {
        let player = datastore.findPlayer(req.get('playerSession'));
        if (player == null) {
            res.status(401).send({
                message: "No access."
            });
        }
        return player;
    }
    init() {
        this.router.get('/', this.getSessions);
        this.router.get('/:id', this.getSession);
        this.router.post('/', this.addSession);
    }
}
exports.GameSessionRouter = GameSessionRouter;
const gameRoutes = new GameSessionRouter();
gameRoutes.init();
exports.default = gameRoutes.router;
