var randomstring = require("randomstring");
//this is all the information regarding the player.
export class Player{
    Id: number;
    Username: string;
    Session: string;
    Connections: WebSocket[] = [];

    //construct a player with a random session attached.
    constructor(name:string, id:number){
        this.Username = name;
        this.Session =  randomstring.generate();
        this.Id = id;
    }
}

export class PlayerView {
    Id: number;
    Username: string;
    //the session is hidden here, because it's only suipposed to exist between the player and the server. no one should see them.
    constructor(player : Player){

        this.Id = player.Id;
        this.Username = player.Username;
    }
}

//this shows the session, but should only be called for itself.
export class PlayerSelfView {
    Id: number;
    Username: string;
    Session: string;
    constructor(player : Player){
        this.Id = player.Id;
        this.Username = player.Username;
        this.Session = player.Session;
    }
}