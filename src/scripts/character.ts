import { Stats } from './Stats';

export class Character {
    Id: number;    
    Owner: number; //owner by Id.

    Name: string;
    Description: string;
    
    Position: {
        x: number,
        y: number
    } = {x: 0, y: 0};

    Stats: Stats = new Stats();

    Sprite: PIXI.Sprite;
}