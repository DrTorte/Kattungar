import { User } from './user';
import { Session } from './session';
import { Character } from './character';
import * as datastore from './datastore';
import * as graphics from './graphics';
import * as gameLogic from './gamelogic';

import * as PIXI from 'pixi.js';

//get current page, minus http://, to connect accordingly.
datastore.ws.onopen = function (event){
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

    $("#refreshGames").click(function(e){
        updateGames();
    });

    //and now, initialize all components.
    graphics.init();
});

window.onresize = function(){
    //todo: add proper resize.
}

function joinGame(gameId:any){
    datastore.ws.send(JSON.stringify({
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
datastore.ws.onmessage = function(event){
    try {
        var wsData = JSON.parse(event.data)
    } catch(err){
        addError("Invalid data received.");
        return;
    }
    if (wsData['message']){
        graphics.addMessage(wsData['message']);
    }
    if (wsData['error']){
        graphics.addMessage(wsData['error']);
        return;
    }
    
    if (wsData['sessionUpdate']){
        console.log("Session update.");
        datastore.updateSession(wsData['sessionUpdate'] as Session);
        graphics.updateUI();
    } 

    if (wsData['startGame']){
        //and hide the other views for now.
        $("#mainBody").hide();
        datastore.setSession(wsData['session'] as Session);

        if(datastore.myGame.State == 4){
            graphics.renderer.stage.removeChildren();
            let text : PIXI.Text = new PIXI.Text("You win! Yay! Now refresh the page.");
            text.x = 500;
            text.y = 250;
            graphics.addSprite(text, 150);
        }

        if(datastore.myGame.State == 2){
            //wipe out current.
            graphics.renderer.stage.removeChildren();

            //draw some text jsut to the right.
            let text : PIXI.Text = new PIXI.Text("Players:");
            text.x = 1056;
            text.y = 32;
            graphics.addSprite(text, 100)

            let y = 64;
            for (var p of datastore.myGame.Players){
                text = new PIXI.Text(p.Username);
                text.x = 1056;
                text.y = y;
                graphics.addSprite(text, 100);
                y += 32;
            }


            graphics.drawTerrain();

            graphics.drawCharacters();

            graphics.drawUI();

        }
    }

    if (wsData['characterUpdate']){
        //find the character.
        let char = wsData['characterUpdate'] as Character;

        //if character is dead, hide it, and leave a splash of blood.
        if (char.Stats.Alive == false){
            //kill it! Wiee!
            let chara = datastore.myGame.Characters.find(x=>x.Id == char.Id);
            chara.Sprite.visible = false; //hide.
            graphics.addTexture("Blood", chara.Position);
        } else {
            gameLogic.updateCharacter(char);
        }
    } 
    
    if (wsData['effect']){
        let targetPosition:{x:number, y:number};
        // draw the effect at the target, by determining if there is a hard location coded, or
        // based on character location.
        if (wsData['targetChar']){
            graphics.addEffect(wsData['effect'], null, wsData['targetChar'] as Character, null );
        } else if (wsData['targetPosition']){
            graphics.addEffect(wsData['effect'], null, null, wsData['targetPosition'] );
        }
    }
}

/* game logic below here. */

function prepGame(){
    $("#canvas").append(graphics.renderer.view);
    datastore.createSpriteEntry("Floor", PIXI.Texture.fromImage('/assets/floor.png'));
    datastore.createSpriteEntry("Wall", PIXI.Texture.fromImage('/assets/wall.png'));
    datastore.createSpriteEntry("Ghoul", PIXI.Texture.fromImage('/assets/ghoul.png'));
    datastore.createSpriteEntry("Human", PIXI.Texture.fromImage('/assets/human.png'));
    datastore.createSpriteEntry("Orc", PIXI.Texture.fromImage('/assets/orc.png'));
    datastore.createSpriteEntry("Troll", PIXI.Texture.fromImage('/assets/troll.png'));
    datastore.createSpriteEntry("Blood", PIXI.Texture.fromImage('/assets/blood.png'));
    datastore.createSpriteEntry("UI_selector", PIXI.Texture.fromImage('/assets/ui/select.png'));
    datastore.createSpriteEntry("Hit", PIXI.Texture.fromImage('/assets/ui/slash.png'));

    //add "loading text"
    let basicText = new PIXI.Text("Awaiting other player...");
    basicText.x = 30;
    basicText.y = 30;
    graphics.addSprite(basicText, 100);
}