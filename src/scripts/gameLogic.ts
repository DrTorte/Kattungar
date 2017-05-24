import { User } from './user';
import { Session } from './session';
import { Character } from './character';
import { EffectStyle } from './effectStyle';
import * as datastore from './datastore';
import * as graphics from './graphics';

export class gameLogic{

}

export function updateCharacter(char:Character){
    let chara = datastore.myGame.Characters.find(x=>x.Id == char.Id);

    if (chara == null){
        return; //couldn't update, leave it for now. error log later.
    }

    //check if this is the selected char - if so, make sure selected char is updated as well.

    let isSelected : boolean = (chara == datastore.myGame.SelectedCharacter);

    //first update the numbers.
    chara.Position.x = char.Position.x;
    chara.Position.y = char.Position.y;
    chara.Stats.CurrentActionPoints = char.Stats.CurrentActionPoints;
    chara.Stats.Armor = char.Stats.Armor;

    //now updated the applicable graphics.
    chara.Sprite.position.set(chara.Position.x * 32, chara.Position.y * 32);

    //if hp is altered, display that as such.
    if (chara.Stats.Health != char.Stats.Health){
        //floating effect.
        let style = new EffectStyle();
        style.Velocity = { x: 0, y:-1};
        style.Acceleration = { x:0, y:-.2};
        style.Lifespan = 180;
        style.ColorStart = 0xee0000;

        //since I want to be able to push multiple styles at once...
        let styles: EffectStyle[] = [];
        styles.push(style);
        graphics.addEffect(null, String(char.Stats.Health - chara.Stats.Health), chara, null, styles);
    }
    chara.Stats.Health = char.Stats.Health;

    //if selected, update selected character too.
    if (isSelected){
        datastore.myGame.SelectedCharacter = chara;
    }
    //and update the UI.
    graphics.updateUI(chara);
}

export function moveButton(e){
    //prep the message.
    let sendData={
        player: datastore.myUser.Session,
        gameId: datastore.myGame.Id,
        charId: datastore.myGame.SelectedCharacter.Id,
        direction: this.text,
        type: "moveChar"
    }
    datastore.ws.send(JSON.stringify(sendData));
}

export function atkButton(e){
    let sendData={
        player: datastore.myUser.Session,
        gameId: datastore.myGame.Id,
        charId: datastore.myGame.SelectedCharacter.Id,
        direction: this.text,
        type: "attack"
    }
    datastore.ws.send(JSON.stringify(sendData));
}

//select the character when clicking on them or otherwise.
export function selectCharacter(e){
    //find the character.
    let char = datastore.myGame.Characters.find(x=>x.Sprite == this);
    if (char == null){
        return;
    }
    datastore.myGame.SelectedCharacter = char;
    //show some ui info.
    graphics.updateUI(char);
}

export function endTurn(e){
    if (datastore.myGame.CurrentPlayer && datastore.myGame.CurrentPlayer.Id == datastore.myUser.Id){
        let sendData={
            player: datastore.myUser.Session,
            gameId: datastore.myGame.Id,
            type:"endTurn"
        };
        datastore.ws.send(JSON.stringify(sendData));
    } else {
        graphics.addMessage("Not your turn, unable to end.");
    }
}