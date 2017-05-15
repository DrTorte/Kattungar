import { User } from './User';
import { Map } from './Map';
import { Character } from './Character';

export class Session{

    Id : number;
    Characters : Character[] =  []
    Players: User[] = [];
    Private: boolean;
    State: number;
    Name: string;
    Map: Map;
    SelectedCharacter : Character;
    
    constructor(){

    }
}