import { User } from './user';
import { Session } from './session';
import { Character } from './character';
import * as datastore from './datastore';
import * as PIXI from 'pixi.js';

let renderer = new PIXI.Application(window.innerWidth,window.innerHeight, {backgroundColor: 0x1099bb});
let stage = new PIXI.Container();

//get current page, minus http://, to connect accordingly.
let url = window.location.hostname;
let ws = new WebSocket("ws://" + url  + ":8080");
ws.onopen = function (event){
    //if we want to do something when connecting...
}

$.ajaxSetup({
    contentType: "application/json",
    dataType: "json"
});

$(document).ready(function(e){
    //hide most stuff as we don't need it right away.   
    $("#showLogin").hide();
    $("#gameList").hide();

    //first check if login exists. This will decide what to show and what not to show.
    checkSavedUser();

    //keep all forms fro mbeing submitted by default.
    $("form").on('submit', function(e){
        e.preventDefault();
    });

    //submit the user form!
    $("#loginForm").on('submit', function(e){
        let user = $("#loginUsername").val();
        let thisData = {
            username:user
        };
        $.ajax({
            type:"post",
            url: '/api/v1/player',
            data: JSON.stringify(thisData),
        }).done(function(e){
            //add all the relevant data to myuser.
            datastore.myUser.Id = e['player']['Id'];
            datastore.myUser.Session = e['player']['Session'];
            datastore.myUser.Username = e['player']['Username'];
            document.cookie = "usersession=" + datastore.myUser.Session;
            $("#showLogin").hide();
            $("#gameList").show();
            updateGames();
        }).fail(function(a){
            //error handler is rather generic.
            errorHandler(a);
        });
    });

    $("#newGameForm").on('submit', function(e){
        let name = $("#newGameName").val();
        let priv = $("#newGamePrivate").prop("checked"); //not value - property! Grr.
        let thisData = {
            Name:name,
            Private: priv
        };
        $.ajax({
            type:"post",
            url: '/api/v1/gamesession',
            headers:{playerSession:datastore.myUser.Session},
            data: JSON.stringify(thisData)
        }).done(function(e){
            updateGames();
            joinGame(e['session']['Id']);
        }).fail(function(a){
            errorHandler(a);
        });
    })

    $("#gameList").on("click", '.joinGame',function(e){
        joinGame($(e.target).attr("data-id"));
    });
});

window.onresize = function(){
    renderer.view.style.width = window.innerWidth + "px";
    renderer.view.style.height = window.innerHeight + "px";
}

function joinGame(gameId:any){
    ws.send(JSON.stringify({
        player: datastore.myUser.Session,
        gameId: gameId,
        type: "joinSession"
    }));
    prepGame();
}
function errorHandler(e : any){
    //generic error handler. Rather handy to have around.
    let message = JSON.parse(e.responseText)['message'];
    addError(message);
}

function addError(message: string){
    $("#messageList").append(
        "<div class='alert alert-danger' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='close'><span aria-hidden='true'>&times;</span></button>" + message + "</div>"
    )
}


function updateGames(){
    $("#gameList .list").html("Loading...");
    $("#gameList .list").show();
    $.ajax({
        type:"get",
        url:'/api/v1/gamesession',
        headers:{playerSession:datastore.myUser.Session}
    }).done(function(e){
        console.log(e['GameSessions']);
        if(e['GameSessions']){
            datastore.updateSessions(e['GameSessions'] as Session[]);
        } else {
            //stuff?
        }
    }).fail(function(a){
        errorHandler(a);
    });
}

function checkSavedUser(){
    //find the cookie!
    let cookie = decodeURIComponent(document.cookie);
    if (cookie == ""){
        userFound(false);
        return;
    }
    let cookies = cookie.split(';');
    let i = 0;
    while (i<cookies.length) {
        if (cookies[i].indexOf("usersession") > -1){
            let mySession = cookies[i].substring(cookies[i].indexOf('=')+1);
            checkUser(mySession);
            break;
        } else {
            i++;
        }
    }
    //if we went through the list and didn't find anything, no user found.
    if (i < cookies.length){
        userFound(false);
    }

}

function checkUser(mySession: string){
    //reach out to server to see if it's valid. If we get a 200, we're okay, and can update that info. If not, wipe the cookies: No good to us anymore.
    $.ajax({
        type:'get',
        url:'/api/v1/player',
        headers: {session: mySession}
    }).done(function(e){
        //set the data if that worked out.
        datastore.myUser.Id = e['Id'];
        datastore.myUser.Username = e['Username'];
        datastore.myUser.Session = mySession;
        console.log(datastore.myUser);
        userFound(true);
    }).fail(function(a){
        clearCookies();
        userFound(false);
    });
}

function userFound(found: boolean){
    $("#loading").hide();
    if (found){
        updateGames();
        $("#showLogin").hide();
        $("#gameList").show();
    } else {
        $("#showLogin").show();
        $("#gameList").hide();
    }
}

//thanks stack overflow for the handy one liner!
//http://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript
function clearCookies(){
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
}
ws.onmessage = function(event){
    try {
        var wsData = JSON.parse(event.data)
    } catch(err){
        addError("Invalid data received.");
        return;
    }
    console.log(wsData);
    if (wsData['message']){
        console.log(wsData['message']);
    }
    if (wsData['error']){
        addError(wsData['error']);
        return;
    }
    if (wsData['sessionUpdate']){
        datastore.updateSession(wsData['sessionUpdate'] as Session);
        //and hide the other views for now.
        $("#mainBody").hide();
        if(datastore.myGame.State == 2){
            let basicText = new PIXI.Text("Wiee!");
            basicText.x = 40;
            basicText.y = 40;
            //wipe out current.
            renderer.stage.removeChildren();

            //add the map.
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

            //draw some text jsut to the right.
            let text : PIXI.Text = new PIXI.Text("Players:");
            text.x = 1056;
            text.y = 32;
            renderer.stage.addChild(text)

            let y = 64;
            for (var p of datastore.myGame.Players){
                text = new PIXI.Text(p.Username);
                text.x = 1056;
                text.y = y;
                renderer.stage.addChild(text);
                y += 32;
            }

            //draw some characters.
            for (let c of datastore.myGame.Characters){
                console.log(c);
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

                item.on('pointerdown', selectCharacter);
                renderer.stage.addChild(item);
                c.Sprite = item;
            }

            //draw some UI, too!
            renderer.stage.addChild(datastore.uiContainer.Name);
            renderer.stage.addChild(datastore.uiContainer.Description);
            renderer.stage.addChild(datastore.uiContainer.AP);

            //easier to track stuff here, if we have the functions called within the main body. :)
            datastore.uiContainer.Up.on("pointerdown", moveButton);
            datastore.uiContainer.Left.on("pointerdown", moveButton);
            datastore.uiContainer.Right.on("pointerdown", moveButton);
            datastore.uiContainer.Down.on("pointerdown", moveButton);
            renderer.stage.addChild(datastore.uiContainer.Up);
            renderer.stage.addChild(datastore.uiContainer.Left);
            renderer.stage.addChild(datastore.uiContainer.Right);
            renderer.stage.addChild(datastore.uiContainer.Down);

            datastore.uiContainer.AtkUp.on("pointerdown", atkButton);
            datastore.uiContainer.AtkLeft.on("pointerdown", atkButton);
            datastore.uiContainer.AtkRight.on("pointerdown", atkButton);
            datastore.uiContainer.AtkDown.on("pointerdown", atkButton);
            renderer.stage.addChild(datastore.uiContainer.AtkUp);
            renderer.stage.addChild(datastore.uiContainer.AtkLeft);
            renderer.stage.addChild(datastore.uiContainer.AtkRight);
            renderer.stage.addChild(datastore.uiContainer.AtkDown);

        }
        if(datastore.myGame.State == 4){
            renderer.stage.removeChildren();
            let text : PIXI.Text = new PIXI.Text("You win! Yay! Now refresh the page.");
            text.x = 500;
            text.y = 250;
            renderer.stage.addChild(text);
        }
    } else if (wsData['characterUpdate']){
        //find the character.
        let char = wsData['characterUpdate'];
        let chars = datastore.myGame.Characters.find(x=>x.Id == char.Id);
        chars.Position.x = char.Position.x;
        chars.Position.y = char.Position.y;
        chars.Sprite.position.set(chars.Position.x * 32, chars.Position.y * 32);
        chars.Stats.CurrentActionPoints = char.Stats.CurrentActionPoints;
        chars.Stats.Armor = char.Stats.Armor;
        chars.Stats.Health = char.stats.Health;
        console.log(chars);
    }
}

/* game logic below here. */

function prepGame(){
    $("#canvas").append(renderer.view);
    datastore.addSprite("Floor", PIXI.Texture.fromImage('/assets/floor.png'));
    datastore.addSprite("Wall", PIXI.Texture.fromImage('/assets/wall.png'));
    datastore.addSprite("Ghoul", PIXI.Texture.fromImage('/assets/ghoul.png'));
    datastore.addSprite("Human", PIXI.Texture.fromImage('/assets/human.png'));
    datastore.addSprite("Orc", PIXI.Texture.fromImage('/assets/orc.png'));
    datastore.addSprite("Troll", PIXI.Texture.fromImage('/assets/troll.png'));

    //add "loading text"
    let basicText = new PIXI.Text("Awaiting other player...");
    basicText.x = 30;
    basicText.y = 30;
    renderer.stage.addChild(basicText);
}

function selectCharacter(e){
    //find the character.
    let char = datastore.myGame.Characters.find(x=>x.Sprite == this);
    if (char == null){
        return;
    }
    datastore.myGame.SelectedCharacter = char;
    //show some ui info.
    datastore.uiContainer.update(char);
}

function moveButton(e){
    //prep the message.
    let sendData={
        player: datastore.myUser.Session,
        gameId: datastore.myGame.Id,
        charId: datastore.myGame.SelectedCharacter.Id,
        direction: this.text,
        type: "moveChar"
    }
    ws.send(JSON.stringify({
        player: datastore.myUser.Session,
        gameId: datastore.myGame.Id,
        charId: datastore.myGame.SelectedCharacter.Id,
        direction: this.text,
        type: "moveChar"
    }));
}

function atkButton(e){
    console.log(e);
    console.log(this);
}