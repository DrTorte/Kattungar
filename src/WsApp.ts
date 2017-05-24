import * as datastore from './modules/datastore'
import {GameSession, GameSessionView } from './models/GameSession';
import { Player } from './models/Player';
import { Map } from './models/Map';
import { Character} from './models/Character';

const WebSocket = require('ws');
export class WsApp{
    ///ws below.

    public wsServer;

    constructor(){
        this.wsServer = new WebSocket.Server({port: 8080});
        this.init();
    }

    init(){
        this.wsServer.on('connection', function (ws){
            let error :object;
            ws.on('message', function (data){
                try {
                    var result = JSON.parse(data);
                } catch(err) {
                    console.log("Invalid format of data:" + data);
                    error = {error: "Invalid form of Data." + data};
                    ws.send(JSON.stringify(error));
                    return;
                }
                if(result['type'] == "joinSession"){
                    //make sure player exists.
                    let player = datastore.findPlayer(result['player']);
                    if (player == null){
                        error = {error: "Invalid player session."};
                        ws.send(JSON.stringify(error));
                        return;
                    }
                    let gameSession : GameSession = datastore.findGame(result['gameId']);
                    if (gameSession == null || gameSession.Players.length > 1){
                        error = {error: "Invalid game."};
                        ws.send(JSON.stringify(error));
                        return;
                    }
                    //now add the player, after making sure they're unique.
                    if (gameSession.Players.find(x=>x.Session == player.Session)){
                        error = {error: "Already connected."};
                        ws.send(JSON.stringify(error));
                        return;
                    }

                    gameSession.Players.push(player);
                    //also add the WS connection to the player so we can keep track of it.
                    player.Connections.push(ws);
                    gameSession.Connections.push(ws);
                    
                    ws.send(JSON.stringify({message: "Connected to game session " + gameSession['Id']}));
                    //if there's two players or more, advise and prepare and such.
                    if (gameSession.Players.length > 1){
                        gameSession.startGame();
                    }
                    
                    //and now that the game session was created, send it along! Wiee!
                    let view : GameSessionView = new GameSessionView(gameSession);
                    
                    for (let connection of gameSession.Connections){
                            connection.send(JSON.stringify({message: "Player " + player.Name + " connected!"}));
                            //do stuff to initailze the map here. for now just a flat map.

                            connection.send(JSON.stringify({session: view, startGame: true}));
                    }

                } else if (result['type'] =="moveChar"){
                    //result dir will decide direction.
                    //need to have character of course.
                    //but first,a s always, check player exists.
                    let player : Player | null = datastore.findPlayer(result['player']);
                    if (player == null){
                        error = {error: "Invalid player session."};
                        ws.send(JSON.stringify(error));
                        return;
                    }

                    //find the session.
                    let session : GameSession | null = datastore.findGame(result['gameId']);
                    if (session == null){
                        error = {error: "Invalid session."};
                        ws.send(JSON.stringify(error));
                        return;
                    }

                    //make sure it is the player's turn.
                    if (!session.CurrentPlayer || session.CurrentPlayer.Id != player.Id ){
                        error = {error: "Not your turn."};
                        ws.send(JSON.stringify(error));
                        return;   
                    }

                    //now that that's done, find the character.
                    let character : Character | undefined = session.Characters.find(x=>x.Id == result['charId']);
                    if (character == undefined || character.Owner != player.Id){
                        error = {error:"Invalid character."};
                        ws.send(JSON.stringify(error));
                        return;
                    }

                    //make sure there's enough action points.
                    if (character.Stats.CurrentActionPoints < 1){
                        error ={error:"Not enough AP."};
                        ws.send(JSON.stringify(error));
                        return;
                    }

                    //and make sure we're good to go and that there's nothing blocking the new location.
                    let dir = result['direction'];
                    let newPosition = {x: 0, y:0};
                    newPosition.x = character.Position.x;
                    newPosition.y = character.Position.y;
                    if (dir == "Up"){
                        newPosition.y--;
                    } else if (dir == "Down"){
                        newPosition.y++;
                    } else if (dir == "Left"){
                        newPosition.x--;
                    } else if (dir =="Right"){
                        newPosition.x++;
                    }

                    if (!session.Map.checkPos(newPosition.x, newPosition.y)){
                        error = { error: "Location is blocked by terrain."},
                        ws.send(JSON.stringify(error));
                        return;
                    }

                    //finally, make sure no other character is there.
                    if (session.Characters.find(x=>x.Position.x == newPosition.x && x.Position.y == newPosition.y) != null){
                        error = { error: "Location is blocked by another character."},
                        ws.send(JSON.stringify(error));
                        return;
                    }

                    //and now, do it! Woo!

                    character.Position = newPosition;
                    character.Stats.CurrentActionPoints--;

                    for (let c of session.Connections){
                        c.send(JSON.stringify({characterUpdate: character}));
                    }
                } else if (result['type'] =="attack"){
                    //result dir will decide direction.
                    //need to have character of course.
                    //but first,a s always, check player exists.
                    let player = datastore.findPlayer(result['player']);
                    if (player == null){
                        error = {error: "Invalid player session."};
                        ws.send(JSON.stringify(error));
                        return;
                    }

                    //find the session.
                    let session = datastore.findGame(result['gameId']);
                    if (session == null){
                        error = {error: "Invalid session."};
                        ws.send(JSON.stringify(error));
                        return;
                    }

                    //make sure it is the player's turn.
                    if (!session.CurrentPlayer || session.CurrentPlayer.Id != player.Id ){
                        error = {error: "Not your turn."};
                        ws.send(JSON.stringify(error));
                        return;   
                    }

                    //now that that's done, find the character.
                    let character : Character | null = session.Characters.find(x=>x.Id == result['charId'] && x.Owner == player.Id);
                    if (character == null){
                        error = {error:"Invalid character."};
                        ws.send(JSON.stringify(error));
                        return;
                    }
                    
                    if (character.Stats.CurrentActionPoints <  character.Stats.AttackCost) {
                        error = {error:"Not enough AP!"};
                        ws.send(JSON.stringify(error));
                        return;
                    }
                    let dir = result['direction'];
                    dir = dir.toUpperCase();
                    dir = dir.replace("ATK ", "");
                    //using X and Y here will eventually allow for diagonal attacks too.
                    let x = 0;
                    let y = 0; 
                    if (dir == "UP"){
                        y = -1;
                    } else if (dir == "DOWN"){
                        y = 1;
                    }
                    if (dir == "LEFT"){
                        x= -1;
                    } else if (dir == "RIGHT"){
                        x=1;
                    }
                    // a quick do while loop will do the trick. Starting from the player's position.
                    let i = 0;
                    var c : Character | null = null;
                    do{
                        i++;
                        let projPosition = {x: 0, y:0};
                        projPosition.x = character.Position.x;
                        projPosition.y = character.Position.y;
                        //check for target.
                        projPosition.x += x*i;
                        projPosition.y += y*i;
                        c = session.findCharacter(projPosition);

                    } while(c == null && i < character.Stats.Range);

                    //no target found, or just the samep layer.
                    if (c == null || c.Owner == character.Owner ){
                        ///Return at this point, as no target was found.
                        error = {error:"No target found."};
                        ws.send(JSON.stringify(error));
                        return;
                    } else {
                        
                        //and now finally, do the calculations.
                        character.Stats.CurrentActionPoints -= character.Stats.AttackCost;

                        //send damage taken and updated characters.
                        c.takeDamage(character.Stats.Damage);
                        for (let s of session.Connections){
                            s.send(JSON.stringify({effect: "Hit", targetChar: c}));
                            s.send(JSON.stringify({characterUpdate: character}));
                            s.send(JSON.stringify({characterUpdate: c}));
                        }
                        
                    }
                } else if (result['type'] == "endTurn"){
                    //check for player and session existance.
                    let player : Player | undefined = datastore.findPlayer(result['player']);
                    if (player == undefined){
                        error = {error: "Invalid player session."};
                        ws.send(JSON.stringify(error));
                        return;
                    }

                    //find the session.
                    let session : GameSession | undefined = datastore.findGame(result['gameId']);
                    if (session == undefined){
                        error = {error: "Invalid session."};
                        ws.send(JSON.stringify(error));
                        return;
                    }

                    //confirm that it is the player's turn.
                    //make sure it is the player's turn.
                    if (!session.CurrentPlayer || session.CurrentPlayer.Id != player.Id ){
                        error = {error: "Not your turn."};
                        ws.send(JSON.stringify(error));
                        return;   
                    }

                    session.nextRound();

                    let view : GameSessionView = new GameSessionView(session);

                    for (let connection of session.Connections){
                        connection.send(JSON.stringify({sessionUpdate: view}));
                    }

                } else {
                    ws.send(JSON.stringify({message:"Invalid 'type' sent."}));
                }
            });
            //on a close, clear out the old session and destroy it if they're left alone.
            ws.on('close', function(data){
                datastore.leaveSessions(ws);
            });
        });
    }
}