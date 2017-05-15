import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import app from '../src/App';


chai.use(chaiHttp);
const expect = chai.expect;
var playerSession :string;

//create a few players. After X, which is currently 63, it should go nope.
describe('POST api/v1/player/', ()=>{
    it('it should create a player with the name "Bob"', () =>{
        return chai.request(app).post('/api/v1/player').send({"name":"Bob"})
        .then(res=>{
            playerSession = res.body.player['Session'];
            expect(res.body.player['Name']).to.eql("Bob");
        });
    });
    it('it should fail to create a second player named Bob', () =>{
        return chai.request(app).post('/api/v1/player').send({"name":"Bob"})
        .then(res =>{
            expect.fail();
        }, 
        err =>{
            expect(err.status == 401);
        });
    });
    it('should not be able to create a player with too short a name', () =>{
        return chai.request(app).post('/api/v1/player').send({"name":"k"})
        .then(res=>{
            expect.fail();
        },
        err =>{
            expect(err.status==401);
        });
    })

    it('should get the player\'s info.', () =>{
        return chai.request(app).get('/api/v1/player').set("session", playerSession)
        .then(res=>{
            expect(res.body.name==="Bob");
            expect(res.body.Id==1);
        })
    });

});