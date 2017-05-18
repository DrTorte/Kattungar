import { User } from './user';
import { Session } from './session';
import { Character } from './character';
//another datastore module! Woo!

//store all the websocket and pixi stuff here.
export let url = window.location.hostname;
export let ws = new WebSocket("ws://" + url  + ":8080");


export class Datastore {

}

export class UIContainer{
    Name: PIXI.Text = new PIXI.Text("");
    Description: PIXI.Text = new PIXI.Text("");
    AP: PIXI.Text = new PIXI.Text("");
    Up: PIXI.Text = new PIXI.Text("Up");
    Left: PIXI.Text = new PIXI.Text("Left");
    Right: PIXI.Text = new PIXI.Text("Right");
    Down: PIXI.Text = new PIXI.Text("Down");

    AtkUp: PIXI.Text = new PIXI.Text("Atk Up");
    AtkLeft: PIXI.Text = new PIXI.Text("Atk Left");
    AtkRight: PIXI.Text = new PIXI.Text("Atk Right");
    AtkDown: PIXI.Text = new PIXI.Text("Atk Down");

    constructor(){
        //set y to 544 to start.
        let x= 10;
        let y = 544;
        this.Name.y = y;
        this.Name.x = x;

        y+=32;
        this.Description.y = y;
        this.Description.x = x;

        y+=32;
        this.AP.y = y;
        this.AP.x = x;

        x = 500;
        y = 544;
        
        this.Up.interactive = true;
        this.Up.buttonMode = true;
        this.Up.visible=false;
        this.Up.y = y;
        this.Up.x = x;

        y+=32;
        x-=32
        this.Left.interactive = true;
        this.Left.buttonMode = true;
        this.Left.visible=false;
        this.Left.y = y;
        this.Left.x = x;

        x+=64;
        this.Right.interactive = true;
        this.Right.buttonMode = true;
        this.Right.visible=false;
        this.Right.y = y;
        this.Right.x = x;
        
        y+=32;
        x-=32;
        this.Down.interactive = true;
        this.Down.buttonMode = true;
        this.Down.visible=false;
        this.Down.y = y;
        this.Down.x = x;

        x = 1000;
        y = 544;
        
        this.AtkUp.interactive = true;
        this.AtkUp.buttonMode = true;
        this.AtkUp.visible=false;
        this.AtkUp.y = y;
        this.AtkUp.x = x;

        y+=32;
        x-=64
        this.AtkLeft.interactive = true;
        this.AtkLeft.buttonMode = true;
        this.AtkLeft.visible=false;
        this.AtkLeft.y = y;
        this.AtkLeft.x = x;

        x+=96;
        this.AtkRight.interactive = true;
        this.AtkRight.buttonMode = true;
        this.AtkRight.visible=false;
        this.AtkRight.y = y;
        this.AtkRight.x = x;
        
        y+=32;
        x-=32;
        this.AtkDown.interactive = true;
        this.AtkDown.buttonMode = true;
        this.AtkDown.visible=false;
        this.AtkDown.y = y;
        this.AtkDown.x = x;
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