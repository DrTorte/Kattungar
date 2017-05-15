import { Router, Request, Response, NextFunction} from 'express';
import { Player, PlayerView } from '../models/player';
import { GameSession, GameSessionView } from '../models/GameSession';
import * as datastore from '../modules/datastore';

var GameSessions: GameSession[] = [];
let Id : number = 1;
export class GameSessionRouter{
    router: Router;

    constructor(){
        this.router = Router();
        this.init();
    }
    //get the game session.
    //use the header to make sure they actually have access.
    public getSessions(req: Request,res: Response, next:NextFunction){
        //first make sure hte player exists.
        var player = gameRoutes.checkPlayer(req,res,next);
        if (player == null){
            return;
        }
        
        //return all of them.
        let sessions = datastore.GameSessions;
        sessions = sessions.filter(x=>x.Private == false && (x.Players.find(x => x == player) == null));
        let sessionView: GameSessionView[] = [];
        for (let s of sessions){
            sessionView.push(new GameSessionView(s));
        }
        res.status(200).send({
            message:"Ok",
            GameSessions: sessionView
        });
        return;
    }

    public getSession(){

    }

    public addSession(req: Request,res: Response, next:NextFunction){
        let player = gameRoutes.checkPlayer(req,res,next);
        var playerSession = req.get("playerSession");
        if (playerSession == ""){
            res.status(401).send({
                message: "No access."
            });
            return;
        }

        if (player == null){
            return;
        }

        //create a session based on the name.
        if(!req.body['Name']){
            res.status(401).send({
                message:"Needs a name! Try again?"
            });
            return;
        }
        let newGameSession : GameSession = new GameSession(Id, req.body['Name'], req.body['Private'] === true);

        Id++;

        datastore.GameSessions.push(newGameSession);
        res.status(200).send({
            message:"Ok!",
            session: newGameSession
        });
        return;
    }

    checkPlayer(req: Request, res:Response, next:NextFunction){

        let player = datastore.findPlayer(req.get('playerSession'));
        if (player == null) {
            res.status(401).send({
                message: "No access."
            });
        }
        return player;

    }


    init(){
        this.router.get('/', this.getSessions);
        this.router.get('/:id', this.getSession);
        this.router.post('/', this.addSession);
    }
}

const gameRoutes = new GameSessionRouter();

gameRoutes.init();

export default gameRoutes.router;