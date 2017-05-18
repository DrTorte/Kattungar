//handle all the graphics here, yo.
import { User } from './user';
import { Session } from './session';
import { Character } from './character';

import * as datastore from './datastore';
import * as PIXI from 'pixi.js';

export let renderer = new PIXI.Application(window.innerWidth,window.innerHeight, {backgroundColor: 0x1099bb});
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
    renderer.ticker.add(function(delta){
        for(let m of messages){
            console.log(delta);
            m.Lifespan -= delta;
            if (m.Lifespan < 0){
                //remove it from the list.
                renderer.stage.removeChild(m.Message);
                messages.splice(messages.indexOf(m), 1);
            }
        }
    });
}

export function addMessage(message:string){
    let newMessage = new DisplayMessage(message);
    this.messages.push(newMessage);
}

