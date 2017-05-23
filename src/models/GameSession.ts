import { Map } from './Map';
import { Character } from './Character';
import { Player, PlayerView } from './Player';

//a game session is where the majority of the game content resides.
export class GameSession{
    Id: number;
    Name: string;
    State: State;
    Map: Map;
    Characters: Character[] = [];
    Players : Player[] = [];
    Connections : any[] = [];
    Private: boolean = false; // by defualt, false.

    constructor(id: number, name: string, priv: boolean){
        this.Id = id;
        this.Name = name;
        this.Private = priv;
        this.State = State.Waiting;
    }

    public genCharacters(){
        //we want to create 5 characters per player.
        //human, orc, troll, ghoulx2.
        //human: okay all around with some range.
        //orc: Weak but with extended range and speed.
        //troll: strong, but with no range, and decent speed.
        //ghoul: Very durable, but no range, weak, but with decent speed.
        let id = 1;
        for (let i = 0; i < 10; i++){
            let c = new Character();
            //if i is 5+, all further calculationjs should be done minus 5.
            let count : number;
            if (i > 4){
                count = i -5;
            } else {
                count = i;
            } 
            if (count == 0){
                c.Description = "A standard human.";
                c.Name = "Human";         
            } else if (count == 1){
                c.Description = "An Orc!";
                c.Name = "Orc";
            } else if (count == 2){
                c.Description = "A troll. Nasty. :(";
                c.Name = "Troll";
            } else {
                c.Description = "Something stinks. Ghouls?";
                c.Name = "Ghoul";
            }
            c.Id = id;
            //have to make sure that the position is okay.
            do {
                var positionOkay = true;
                c.Position.x = Math.round(1 + (Math.random()*30));
                if (i > 4){
                    c.Position.y = 14;
                } else {
                    c.Position.y = 1;
                }
                console.log(c.Position);
                //check map okay, then check character okay.
                if (!this.Map.checkPos(c.Position.x, c.Position.y)){
                    positionOkay = false;
                }
                //now check characters to see if any of them have the same position.
                if (this.Characters.find(x=>x.Position == c.Position) != null){
                    positionOkay = false;
                }
            } while(!positionOkay);
            //random position should be anywhere between 1 and 31.
            id++;
            c.setStats();
            //set the owner. If i > 4, owner is player 2. Otherwise player 1.
            let index : number;
            if (i > 4){
                index =1;
            } else {
                index = 0;
            }
            c.Owner = this.Players[index].Id;
            this.Characters.push(c);
        }
    }

    public findCharacter(position : {x,y}, player?) {
        //if player is not specified, it is not a factor.
        for (let c of this.Characters){
            console.log("X: " + c.Position.x + " Y: " + position.x);
            console.log("X: " + c.Position.y + " Y: " + position.y);
            if (c.Position.x == position.x && c.Position.y == position.y){
                console.log(c);
                return c;
            }
        }
        return null;
    }
}

//get a game session view that doesn't expose much.
export class GameSessionView{
    Id: number;
    Name: string;
    State: State;
    Map: Map;
    Characters: Character[] = [];
    Players: PlayerView[] = [];
    Private: boolean;

    constructor(session: GameSession){
        this.Id = session.Id;
        this.Name = session.Name;
        this.State = session.State;
        this.Private = session.Private;
        this.Map = session.Map;
        this.Characters = session.Characters;
        for(let p of session.Players){
            this.Players.push(new PlayerView(p));
        }
    }
}

enum State{
    Waiting = 1,
    Started = 2,
    Ongoing = 3,
    Ended = 4
}