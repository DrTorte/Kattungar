import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';

import PlayerRouter from './routes/PlayerRouter';
import GameRouter from './routes/GameRouter';

class App{
    public express: express.Application;

    constructor(){
        this.express = express();
        this.middleware();
        this.routes();

    }

    private middleware(): void{
        this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({extended:false}));
        
    }

    private routes(): void{
        let router = express.Router();

        //in this case, send the HTML down to the user.
        router.get('/', (req, res, next) => {
            res.sendFile('index.html', {root:__dirname});
        });

        router.get('/scripts/:file', (req,res,next) => {
            res.sendFile("scripts/" + req.params.file, { root:__dirname})
        });

        router.get('/assets/:file', (req,res,next) =>{
            res.sendFile("assets/" + req.params.file, { root:__dirname})
        });

        router.get('/assets/ui/:file', (req,res,next) =>{
            res.sendFile("assets/ui/" + req.params.file, { root:__dirname})
        });


        this.express.use('/', router);
        this.express.use('/api/v1/player', PlayerRouter);
        this.express.use('/api/v1/gamesession', GameRouter);
    }
}

export default new App().express;
