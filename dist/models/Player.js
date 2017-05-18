"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var randomstring = require("randomstring");
//this is all the information regarding the player.
class Player {
    //construct a player with a random session attached.
    constructor(name, id) {
        this.Connections = [];
        this.Username = name;
        this.Session = randomstring.generate();
        this.Id = id;
    }
}
exports.Player = Player;
class PlayerView {
    //the session is hidden here, because it's only suipposed to exist between the player and the server. no one should see them.
    constructor(player) {
        this.Id = player.Id;
        this.Username = player.Username;
    }
}
exports.PlayerView = PlayerView;
//this shows the session, but should only be called for itself.
class PlayerSelfView {
    constructor(player) {
        this.Id = player.Id;
        this.Username = player.Username;
        this.Session = player.Session;
    }
}
exports.PlayerSelfView = PlayerSelfView;
