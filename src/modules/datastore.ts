import { Player, PlayerView } from '../models/player';
import { GameSession, GameSessionView } from '../models/GameSession';

export let Players: Player[] = [];
export let GameSessions: GameSession[] = [];

export function findPlayer(session: string) : any {
    return Players.find(x=>x.Session === session);
}

export function findGame(Id: number) : any{
    console.log(Id);
    console.log(GameSessions);
    return GameSessions.find(x=>x.Id == Id);
}

export function leaveSessions(ws: WebSocket){
    //clear out all sessions with this player.
    let sessions = GameSessions.filter(x=>x.Connections.find(y=>y == ws));
    for (let s of sessions){
        if(s.State == 1){
            GameSessions.splice(GameSessions.findIndex(x=>x == s), 1);
        }
        else {
            s.Connections.splice(s.Connections.indexOf(ws),1);
            s.State = 4;//mark it as over. victory can be handled later.
            for (let c of s.Connections){
                console.log("Here!");
                c.send(JSON.stringify({message:'you win! YAY!'}));
                c.send(JSON.stringify({sessionUpdate: new GameSessionView(s)}));
            }
        }
    }
}