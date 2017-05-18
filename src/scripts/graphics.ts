//handle all the graphics here, yo.
import { User } from './user';
import { Session } from './session';
import { Character } from './character';

import * as gameLogic from './gameLogic';
import * as datastore from './datastore';
import * as PIXI from 'pixi.js';

export let renderer = new PIXI.Application(1600,900, {backgroundColor: 0x1099bb});
export let stage = new PIXI.Container();

export let messages : DisplayMessage[] = [];

export class Graphics{
}

//these message are displayed on screen for a short period of time.
class DisplayMessage {
    Message: PIXI.Text;
    Lifespan: number = 180;
    Text: string;

    constructor(message:string){
        this.Message = new PIXI.Text(message, {fill:['#FF0000']});
        this.Message.position.x = 10;
        this.Message.position.y = 10 + (32*messages.length);
        this.Text = message;
        renderer.stage.addChild(this.Message);
    }
}

export function init(){
    renderer.renderer.autoResize = true;
    renderer.ticker.add(function(delta){
        messages.forEach((m, key) => {
            m.Lifespan -= delta;
            if (m.Lifespan < 0){
                //remove it from the list.
                renderer.stage.removeChild(m.Message);
                messages.splice(key, 1);
                //shift remaining messages up.
                for (var i = key; i < messages.length; i++){
                    messages[i].Message.y -= 32;
                }
            }
        });
    });
}

export function addMessage(message:string){
    let newMessage = new DisplayMessage(message);
    this.messages.push(newMessage);
}

export function drawTerrain(){
    datastore.myGame.Map.Terrain.forEach(element => {
        let item : PIXI.Sprite = new PIXI.Sprite();
        if(element.Terrain == 0){
            item = new PIXI.Sprite(datastore.sprites[0].Sprite);
        } else {
            item = new PIXI.Sprite(datastore.sprites[1].Sprite);
        }
        item.x = element.X*32;
        item.y = element.Y*32;
        renderer.stage.addChild(item);
    });
}

//the intiial UI draw.
export function drawUI(){
    //draw some UI, too!
    renderer.stage.addChild(datastore.uiContainer.Name);
    renderer.stage.addChild(datastore.uiContainer.Description);
    renderer.stage.addChild(datastore.uiContainer.AP);

    //easier to track stuff here, if we have the functions called within the main body. :)
    datastore.uiContainer.Up.on("pointerdown", gameLogic.moveButton);
    datastore.uiContainer.Left.on("pointerdown", gameLogic.moveButton);
    datastore.uiContainer.Right.on("pointerdown", gameLogic.moveButton);
    datastore.uiContainer.Down.on("pointerdown", gameLogic.moveButton);
    renderer.stage.addChild(datastore.uiContainer.Up);
    renderer.stage.addChild(datastore.uiContainer.Left);
    renderer.stage.addChild(datastore.uiContainer.Right);
    renderer.stage.addChild(datastore.uiContainer.Down);

    datastore.uiContainer.AtkUp.on("pointerdown", gameLogic.atkButton);
    datastore.uiContainer.AtkLeft.on("pointerdown", gameLogic.atkButton);
    datastore.uiContainer.AtkRight.on("pointerdown", gameLogic.atkButton);
    datastore.uiContainer.AtkDown.on("pointerdown", gameLogic.atkButton);
    renderer.stage.addChild(datastore.uiContainer.AtkUp);
    renderer.stage.addChild(datastore.uiContainer.AtkLeft);
    renderer.stage.addChild(datastore.uiContainer.AtkRight);
    renderer.stage.addChild(datastore.uiContainer.AtkDown);
}

//update the UI. Primarily called when selecting a character.
export function updateUI(char: Character = null){
    //if not selected character, hide.
    datastore.uiContainer.Name.visible = (char != null);
    datastore.uiContainer.Description.visible = (char != null);
    datastore.uiContainer.AP.visible = (char != null);

    if (char == datastore.myGame.SelectedCharacter){
        datastore.uiContainer.Name.text = char.Name;
        datastore.uiContainer.Description.text = char.Description;
        datastore.uiContainer.AP.text = String(char.Stats.CurrentActionPoints) + " / " + String(char.Stats.FreshActionPoints);

        datastore.uiContainer.Up.visible = char.Owner == datastore.myUser.Id;
        datastore.uiContainer.Down.visible = char.Owner == datastore.myUser.Id;
        datastore.uiContainer.Right.visible = char.Owner == datastore.myUser.Id;
        datastore.uiContainer.Left.visible = char.Owner == datastore.myUser.Id;

        datastore.uiContainer.AtkUp.visible = char.Owner == datastore.myUser.Id;
        datastore.uiContainer.AtkDown.visible = char.Owner == datastore.myUser.Id;
        datastore.uiContainer.AtkRight.visible = char.Owner == datastore.myUser.Id;
        datastore.uiContainer.AtkLeft.visible = char.Owner == datastore.myUser.Id;
    }
}

//draw the characters.
export function drawCharacters(){
    //draw some characters.
    for (let c of datastore.myGame.Characters){
        let item : PIXI.Sprite = new PIXI.Sprite();
        try {
            item = new PIXI.Sprite(datastore.sprites.find(x=>x.Name == c.Name).Sprite);
        } catch(err) {
            continue; //ignore it if we have to.
        }
        item.x = c.Position.x * 32;
        item.y = c.Position.y * 32;

        //make this interactive!
        item.interactive = true;
        item.buttonMode = true;

        item.on('pointerdown', gameLogic.selectCharacter);
        renderer.stage.addChild(item);
        c.Sprite = item;
    }
}