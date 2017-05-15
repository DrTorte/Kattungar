import { Router, Request, Response, NextFunction} from 'express';
import { Player, PlayerView } from '../models/player';
import * as datastore from '../modules/datastore';

let Id: number = 1;

export class PlayerRouter{
    router: Router;
    constructor(){
        this.router = Router();
        this.init();
    }

    public getPlayer(req: Request, res: Response, next: NextFunction){
        //check the header for player.
        let session = req.get("session");
        console.log(session);
        if (!session){
            res.status(401).send("No header set.");
            return;
        }

        let thisPlayer = datastore.Players.find(x=>x.Session === session);
        if (!thisPlayer){  
            res.status(401).send("No player found.");
            return;
        }

        res.send(200, thisPlayer);
    }

    public getSpecificPlayer(req: Request, res: Response, next: NextFunction){
        let searchParam = req.params.name;
        let session = req.headers.session;
        if (!session){
            res.send(401, "No header set.");
            return;
        }
    }

    public addPlayer(req: Request, res:Response, next:NextFunction){
        console.log(req.body);
        let username = req.body['username'];
        //first check if there are too many players. For now, we'll have a hard limit of 64...
        //this should of course scale with hardware and such, but works for now.
        if (datastore.Players.length > 63){
            res.status(401).send({
                message: "Server is full. :("
            });
            return;
        }

        //minimum 3 character length for name.
        
        if (username.length < 3){
            res.status(401).send({
                message:"The name " + username + " is too short."
            });
            return;
        }

        if (datastore.Players.find(x=> x.Username.toUpperCase() === username.toUpperCase())) {
            res.status(401).send({
                message:"Player with that name exists."
            });
        } else {
            let newPlayer : Player = new Player(username, Id);
            //count up the ID per entry.
            datastore.Players.push(newPlayer);
            Id++;
            res.status(200).send({
                message:'Success',
                player:newPlayer
            });
        }
    }

    init(){
        this.router.get('/', this.getPlayer);
        this.router.get('/:name', this.getSpecificPlayer);
        this.router.post('/', this.addPlayer);
    }
}

const playerRoutes = new PlayerRouter();

playerRoutes.init();

export default playerRoutes.router;