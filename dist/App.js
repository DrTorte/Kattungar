"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const PlayerRouter_1 = require("./routes/PlayerRouter");
const GameRouter_1 = require("./routes/GameRouter");
class App {
    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
    }
    middleware() {
        this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }
    routes() {
        let router = express.Router();
        //in this case, send the HTML down to the user.
        router.get('/', (req, res, next) => {
            res.sendFile('index.html', { root: __dirname });
        });
        router.get('/scripts/:file', (req, res, next) => {
            res.sendFile("scripts/" + req.params.file, { root: __dirname });
        });
        router.get('/assets/:file', (req, res, next) => {
            res.sendFile("assets/" + req.params.file, { root: __dirname });
        });
        router.get('/assets/ui/:file', (req, res, next) => {
            res.sendFile("assets/ui/" + req.params.file, { root: __dirname });
        });
        this.express.use('/', router);
        this.express.use('/api/v1/player', PlayerRouter_1.default);
        this.express.use('/api/v1/gamesession', GameRouter_1.default);
    }
}
exports.default = new App().express;
