import { User } from './user';
import { Session } from './session';
import { Character } from './character';
//another datastore module! Woo!

export class Datastore {

}

export class UIContainer{
    Name: PIXI.Text = new PIXI.Text("");
    Description: PIXI.Text = new PIXI.Text("");
    AP: PIXI.Text = new PIXI.Text("");

    constructor(){
        //set y to 544 to start.
        let y = 544;
        this.Name.y = y;
        this.Name.x = 10;

        y+=32;
        this.Description.y = y;
        this.Description.x = 10;

        y+=32;
        this.AP.y = y;
        this.AP.x = 10;
    }

    public update(char: Character){
        this.Name.text = char.Name;
        this.Description.text = char.Description;
        this.AP.text = String(char.Stats.CurrentActionPoints) + " / " + String(char.Stats.FreshActionPoints);
    }
}

export let gameSessions : Session[] = [];
export let myUser : User = new User();
export let myGame : Session;
export let sprites : SpriteContainer[] = [];
export let uiContainer : UIContainer = new UIContainer();

export function updateSessions(sessions: Session[]){
    //update the list of sessions.
    gameSessions = sessions;
    //empty the list.
    $("#gameList .list").html("");
    gameSessions.forEach(element => {
        let html = "<div class='game' data-id'" + element.Id + "'>" + element.Name;
        html += "<button type='button' class='btn btn-default showDetails'>Details</button><button type='button' class='btn btn-success joinGame' data-id='"+element.Id+"'>Join</button>"
        html += "</div>"
        $("#gameList .list").append(html)
    });
}

export function updateSession(session: Session){
    myGame = session;
}

//add a sprite.
export function addSprite(name: string, sprite: PIXI.Texture){
    let spriteC = new SpriteContainer();
    spriteC.Name = name;
    spriteC.Sprite = sprite;
    sprites.push(spriteC);
}

//sprite container for Pixi.
class SpriteContainer{
    Name: string;
    Sprite: PIXI.Texture;
}